import { TERMINAL_CHECK_DELAY } from "./extensionConsts";
import type { TabInfo, TerminalCheckResult } from "./extensionTypes";
import { isTerminalUrl, logInfo, logError, logSuccess } from "./helpers";
import { RegistrationService } from "./registration-manager";
import { TabManager } from "./tab-manager";

export class TerminalChecker {
    private tabManager: TabManager;
    private registrationService: RegistrationService;
    // @ts-ignore
    private retryIntervals: Map<number, NodeJS.Timeout> = new Map();


    constructor(tabManager: TabManager) {
        this.tabManager = tabManager;
        this.registrationService = new RegistrationService(tabManager);
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

    async checkTerminalAPI(tab: TabInfo): Promise<void> {
        try {
            if (this.tabManager.hasTab(tab.id!)) {
                logSuccess('Already registered for tab', tab.id);
                return;
            }

            logInfo('Checking terminal API for tab', tab.id);

            // Функция для выполнения в контексте страницы - ОПРЕДЕЛЯЕМ ЕЁ ВНУТРИ МЕТОДА
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
                target: { tabId: tab.id! },
                func: checkFunction,
                world: 'MAIN'
            });

            const result = results[0].result as TerminalCheckResult;
            console.log('Terminal check result:', result);

            if (result.found) {
                logSuccess('Terminal API found for tab', tab.id);
                await this.registrationService.registerExtension(tab);
            } else {
                logError('Terminal API not found, retrying...');
                // Раскомментируй когда будет готово
                // this.retryTerminalCheck(tab);
            }
        } catch (error) {
            logError(`Check error for tab ${tab.id}:`, error);
        }
    }

    // private async retryTerminalCheck(tab: TabInfo): Promise<void> {
    //     if (this.tabManager.hasTab(tab.id!)) return;

    //     let attempts = 0;

    //     const interval = setInterval(async () => {
    //         if (this.tabManager.hasTab(tab.id!)) {
    //             this.stopRetryForTab(tab.id!);
    //             return;
    //         }

    //         attempts++;
    //         logInfo(`Attempt ${attempts}/${MAX_RETRY_ATTEMPTS} for tab ${tab.id}`);

    //         try {
    //             const checkFunction = function (): TerminalCheckResult {
    //                 console.log('🔍 EdickExt: Checking window.terminal...');
    //                 const terminal = (window as any).terminal;
    //                 return {
    //                     found: !!(terminal && typeof terminal.registerExtension === 'function'),
    //                     reason: terminal ? 'API available' : 'No terminal object'
    //                 };
    //             };

    //             const results = await chrome.scripting.executeScript({
    //                 target: { tabId: tab.id! },
    //                 func: checkFunction,
    //                 world: 'MAIN'
    //             });

    //             const result = results[0].result as TerminalCheckResult;
    //             if (result.found) {
    //                 this.stopRetryForTab(tab.id!);
    //                 logSuccess(`Terminal API found on attempt ${attempts}`);
    //                 await this.registrationService.registerExtension(tab);
    //             } else if (attempts >= MAX_RETRY_ATTEMPTS) {
    //                 this.stopRetryForTab(tab.id!);
    //                 logError(`Terminal API not found after ${MAX_RETRY_ATTEMPTS} attempts`);
    //             }
    //         } catch (error) {
    //             logError('Check attempt failed:', error);
    //             if (attempts >= MAX_RETRY_ATTEMPTS) {
    //                 this.stopRetryForTab(tab.id!);
    //             }
    //         }
    //     }, RETRY_INTERVAL);

    //     this.retryIntervals.set(tab.id!, interval);
    // }

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