import { MAX_RETRY_ATTEMPTS, RETRY_INTERVAL, TERMINAL_CHECK_DELAY } from "./extensionConsts";
import type { TabInfo, TerminalCheckResult } from "./extensionTypes";
import { isTerminalUrl, logInfo, logError, logSuccess } from "./helpers";

import { TabManager } from "./tab-manager";

export class TerminalChecker {
    private tabManager: TabManager;
    // @ts-ignore
    private retryIntervals: Map<number, NodeJS.Timeout> = new Map();

    constructor(tabManager: TabManager) {
        this.tabManager = tabManager;
    }

    async checkAllTerminalTabs(): Promise<void> {
        try {
            const tabs = await chrome.tabs.query({});
            for (const tab of tabs) {
                if (isTerminalUrl(tab.url)) {
                    logInfo('Checking existing terminal tab:', tab.url);
                    setTimeout(() => this.checkTerminalAPI(tab as TabInfo), TERMINAL_CHECK_DELAY);
                }
            }
        } catch (error) {
            logError('Error checking all tabs:', error);
        }
    }

    async checkTerminalAPI(tab: TabInfo): Promise<boolean> {
        try {
            if (this.tabManager.hasTab(tab.id!)) {
                logSuccess('Already registered for tab', tab.id);
                return true; // Уже зарегистрированы - считаем что проверка прошла
            }

            logInfo('Checking terminal API for tab', tab.id);

            const result = await this.executeTerminalCheck(tab.id!);
            console.log('Terminal check result:', result);

            if (result.found) {
                logSuccess('Terminal API found for tab', tab.id);
                return true;
            } else {
                logError('Terminal API not found, retrying...');
                return await this.retryTerminalCheck(tab);
            }
        } catch (error) {
            logError(`Check error for tab ${tab.id}:`, error);
            return false;
        }
    }

    private async executeTerminalCheck(tabId: number): Promise<TerminalCheckResult> {
        const checkFunction = function (): TerminalCheckResult {
            console.log('🔍 EdickExt: Auto-checking window.terminal in PAGE context...');

            const terminal = (window as any).terminal;
            if (terminal && typeof terminal.registerExtension === 'function') {
                console.log('✅ Terminal API available in auto-check!');
                return {
                    found: true,
                    terminal: '[Object]',
                    keys: Object.keys(terminal),
                    hasRegisterExtension: true
                };
            } else {
                console.log('❌ No terminal API found in auto-check');
                return {
                    found: false,
                    reason: 'window.terminal is undefined or missing registerExtension'
                };
            }
        };

        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: checkFunction,
            world: 'MAIN'
        });

        return results[0].result as TerminalCheckResult;
    }

    private async retryTerminalCheck(tab: TabInfo): Promise<boolean> {
        if (this.tabManager.hasTab(tab.id!)) return true;

        let attempts = 0;

        return new Promise((resolve) => {
            const interval = setInterval(async () => {
                if (this.tabManager.hasTab(tab.id!)) {
                    clearInterval(interval);
                    this.retryIntervals.delete(tab.id!);
                    resolve(true);
                    return;
                }

                attempts++;
                logInfo(`Attempt ${attempts}/${MAX_RETRY_ATTEMPTS} for tab ${tab.id}`);

                try {
                    const result = await this.executeTerminalCheck(tab.id!);

                    if (result.found) {
                        clearInterval(interval);
                        this.retryIntervals.delete(tab.id!);
                        logSuccess(`Terminal API found on attempt ${attempts}`);
                        resolve(true);
                    } else if (attempts >= MAX_RETRY_ATTEMPTS) {
                        clearInterval(interval);
                        this.retryIntervals.delete(tab.id!);
                        logError(`Terminal API not found after ${MAX_RETRY_ATTEMPTS} attempts`);
                        resolve(false);
                    }
                } catch (error) {
                    logError('Check attempt failed:', error);
                    if (attempts >= MAX_RETRY_ATTEMPTS) {
                        clearInterval(interval);
                        this.retryIntervals.delete(tab.id!);
                        resolve(false);
                    }
                }
            }, RETRY_INTERVAL);

            this.retryIntervals.set(tab.id!, interval);
        });
    }

    // Очистка всех интервалов при уничтожении
    cleanup(): void {
        for (const [tabId, interval] of this.retryIntervals) {
            clearInterval(interval);
            logInfo(`Cleaned up retry interval for tab ${tabId}`);
        }
        this.retryIntervals.clear();
        this.tabManager.clear();
    }
}