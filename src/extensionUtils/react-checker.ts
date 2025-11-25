import type { TabInfo } from "./extensionTypes";
import { logInfo, logError, logSuccess } from "./helpers";
import { TabManager } from "./tab-manager";


export interface ReactCheckResult {
    available: boolean;
    reactVersion?: string;
    reactDOMVersion?: string;
    hasCreateElement?: boolean;
    hasRender?: boolean;
    reason?: string;
}

export class ReactChecker {
    private tabManager: TabManager;

    constructor(tabManager: TabManager) {
        this.tabManager = tabManager;
    }

    async checkReactAvailability(tab: TabInfo): Promise<boolean> {
        try {
            if (this.tabManager.hasTab(tab.id!)) {
                logSuccess('Already registered for tab', tab.id);
                return true;
            }

            logInfo('Checking React availability for tab', tab.id);

            // Сначала пытаемся инжектить React
            const injectionSuccess = await this.injectReactToMainWorld(tab.id!);

            if (!injectionSuccess) {
                logError('Failed to inject React');
                return false;
            }

            // Затем проверяем доступность
            const result = await this.executeReactCheck(tab.id!);
            console.log('React check result:', result);

            if (result.available) {
                logSuccess('React available for tab', tab.id);
                return true;
            } else {
                logError('React not available after injection');
                return false;
            }
        } catch (error) {
            logError(`React check error for tab ${tab.id}:`, error);
            return false;
        }
    }

    private async injectReactToMainWorld(tabId: number): Promise<boolean> {
        try {
            logInfo('Injecting React to main world...');

            // Инжектим React в основной мир
            await chrome.scripting.executeScript({
                target: { tabId },
                files: ['react.production.min.js'],
                world: 'MAIN'
            });

            // Инжектим ReactDOM в основной мир
            await chrome.scripting.executeScript({
                target: { tabId },
                files: ['react-dom.production.min.js'],
                world: 'MAIN'
            });

            logSuccess('React injected to main world');
            return true;
        } catch (error) {
            logError('Failed to inject React to main world:', error);

            return false;
        }
    }

    

    private async executeReactCheck(tabId: number): Promise<ReactCheckResult> {
        const checkFunction = function (): ReactCheckResult {
            console.log('🔍 EdickExt: Checking React availability in MAIN world...');

            const React = window.React;
            // @ts-ignore
            const ReactDOM = window.ReactDOM;

            if (React && ReactDOM) {
                console.log('✅ React available in MAIN world!');
                console.log('React version:', React.version);
                console.log('ReactDOM version:', ReactDOM.version);

                return {
                    available: true,
                    reactVersion: React.version,
                    reactDOMVersion: ReactDOM.version,
                    hasCreateElement: typeof React.createElement === 'function',
                    hasRender: typeof ReactDOM.render === 'function'
                };
            } else {
                console.log('❌ React not found in MAIN world');
                console.log('Available globals:', Object.keys(window).filter(key =>
                    key.includes('react') || key.includes('React')
                ));
                return {
                    available: false,
                    reason: 'React or ReactDOM not found in main world'
                };
            }
        };

        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                func: checkFunction,
                world: 'MAIN'
            });

            return results[0].result as ReactCheckResult;
        } catch (error) {
            console.error('Error executing React check:', error);
            return {
                available: false,
                reason: `Script execution error: ${error}`
            };
        }
    }
}