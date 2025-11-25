
import type { TabInfo, WidgetsCheckResult } from "./extensionTypes";
import {  logInfo, logError, logSuccess } from "./helpers";
import { TabManager } from "./tab-manager";

export class WidgetsChecker {
    private tabManager: TabManager;
    private retryIntervals: Map<number, NodeJS.Timeout> = new Map();

    constructor(tabManager: TabManager) {
        this.tabManager = tabManager;
    }


    async checkWidgetsAvailability(tab: TabInfo): Promise<boolean> {
        try {
            if (this.tabManager.hasTab(tab.id!)) {
                logSuccess('Already registered for tab', tab.id);
                return true;
            }

            logInfo('Checking widgets availability for tab', tab.id);

            const injectionSuccess = await this.injectWidgetsApiToMainWorld(tab.id!);

            if (!injectionSuccess) {
                logError('Failed to inject Widgets API');
                return false;
            }

            const result = await this.executeWidgetsCheck(tab.id!);
            console.log('Widgets check result:', result);

            if (result.available) {
                logSuccess('Widgets available for tab', tab.id);
                return true;
            } else {
                logError('Widgets not available, retrying...');
                return false;
                // return await this.retryWidgetsCheck(tab);
            }
        } catch (error) {
            logError(`Widgets check error for tab ${tab.id}:`, error);
            return false;
        }
    }

    private async executeWidgetsCheck(tabId: number): Promise<WidgetsCheckResult> {
        const checkFunction = function (): WidgetsCheckResult {
            console.log('🔍 EdickExt: Checking widgets availability in PAGE context...');

            const EdickExtWidgets = (window as any).EdickExtWidgets;

            if (EdickExtWidgets && EdickExtWidgets.components) {
                console.log('✅ Widgets available in auto-check!');
                const widgetIds = Object.keys(EdickExtWidgets.components);
                return {
                    available: true,
                    widgetsCount: widgetIds.length,
                    widgetIds: widgetIds,
                    hasRenderWidget: typeof EdickExtWidgets.renderWidget === 'function',
                    hasGetWidgetComponent: typeof EdickExtWidgets.getWidgetComponent === 'function'
                };
            } else {
                console.log('❌ Widgets not found in auto-check');
                return {
                    available: false,
                    reason: 'EdickExtWidgets not found or missing components'
                };
            }
        };

        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                func: checkFunction,
                world: 'MAIN'
            });

            return results[0].result as WidgetsCheckResult;
        } catch (error) {
            console.error('Error executing widgets check:', error);
            return {
                available: false,
                reason: `Script execution error: ${error}`
            };
        }
    }
    private async injectWidgetsApiToMainWorld(tabId: number): Promise<boolean> {
        try {
            logInfo('Injecting Widgets API to main world...');

            // Инжектим React в основной мир
            await chrome.scripting.executeScript({
                target: { tabId },
                files: ['widgets.iife.js'],
                world: 'MAIN'
            });

            logSuccess('Widgets API injected to main world');
            return true;
        } catch (error) {
            logError('Failed to inject Widgets API to main world:', error);

            return false;
        }
    }
    // private async retryWidgetsCheck(tab: TabInfo): Promise<boolean> {
    //     if (this.tabManager.hasTab(tab.id!)) return true;

    //     let attempts = 0;

    //     return new Promise((resolve) => {
    //         const interval = setInterval(async () => {
    //             if (this.tabManager.hasTab(tab.id!)) {
    //                 clearInterval(interval);
    //                 this.retryIntervals.delete(tab.id!);
    //                 resolve(true);
    //                 return;
    //             }

    //             attempts++;
    //             logInfo(`Widgets check attempt ${attempts}/${MAX_RETRY_ATTEMPTS} for tab ${tab.id}`);

    //             try {
    //                 const result = await this.executeWidgetsCheck(tab.id!);

    //                 if (result.available) {
    //                     clearInterval(interval);
    //                     this.retryIntervals.delete(tab.id!);
    //                     logSuccess(`Widgets found on attempt ${attempts}`);
    //                     resolve(true);
    //                 } else if (attempts >= MAX_RETRY_ATTEMPTS) {
    //                     clearInterval(interval);
    //                     this.retryIntervals.delete(tab.id!);
    //                     logError(`Widgets not found after ${MAX_RETRY_ATTEMPTS} attempts`);
    //                     resolve(false);
    //                 }
    //             } catch (error) {
    //                 logError('Widgets check attempt failed:', error);
    //                 if (attempts >= MAX_RETRY_ATTEMPTS) {
    //                     clearInterval(interval);
    //                     this.retryIntervals.delete(tab.id!);
    //                     resolve(false);
    //                 }
    //             }
    //         }, RETRY_INTERVAL);

    //         this.retryIntervals.set(tab.id!, interval);
    //     });
    // }

    cleanup(): void {
        for (const [tabId, interval] of this.retryIntervals) {
            clearInterval(interval);
            logInfo(`Cleaned up widgets retry interval for tab ${tabId}`);
        }
        this.retryIntervals.clear();
    }
}