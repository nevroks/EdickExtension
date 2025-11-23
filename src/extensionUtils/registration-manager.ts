
import type { TabInfo, RegistrationResult, Widget } from "./extensionTypes";
import { logInfo, showNotification, logSuccess, logError } from "./helpers";
import { TabManager } from "./tab-manager";
import { DEFAULT_WIDGET_CONFIG } from "../extensionUtils/extensionConsts";

import { renderWidget, cleanupWidget } from "../extensionUtils/widget-funcs";




export class RegistrationService {
    private tabManager: TabManager;

    constructor() {
        this.tabManager = new TabManager();
    }

    async registerExtension(tab: TabInfo): Promise<void> {
        try {
            this.tabManager.addTab(tab.id!);
            logInfo('Auto-registering extension for tab', tab.id);

            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id! },
                func: () => {
                    return new Promise((resolve) => {
                        try {
                            console.log('🎯 EdickExt: Registering with NEW API...');

                            if (!window.terminal?.registerExtension) {
                                resolve({ success: false, error: 'Terminal API not available' });
                                return;
                            }

                            window.terminal.registerExtension({
                                extensionName: 'EDICK_EXTENSION',
                                displayName: 'EdickExt - Аналитика'
                            }).then(extension => {
                                console.log("Extension:", extension);

                                extension.registerWidgetType('bond-analyzer', {
                                    ...DEFAULT_WIDGET_CONFIG,
                                    handlers: {
                                        mount: (widget: Widget) => {
                                            console.log('Widget mounted:', widget);
                                            renderWidget(widget);
                                        },
                                        unmount: (widget: Widget) => {
                                            console.log('Widget unmounted:', widget);
                                            cleanupWidget(widget);
                                        },
                                        tickerChange: (widget: Widget, oldTicker: string) => {
                                            console.log('Ticker changed:', oldTicker, '->', widget.ticker);
                                        },
                                        groupChange: (widget: Widget, oldGroup: string) => {
                                            console.log('Group changed:', oldGroup, '→', widget.group);
                                        },
                                        onCurrencyChange: (widget: Widget, oldCurrency: string) => {
                                            console.log('Currency changed:', oldCurrency, '→', widget.currency);
                                        }
                                    }
                                });

                                console.log('✅ EdickExt: Successfully registered with new API');
                                resolve({ success: true });

                            }).catch((error: Error) => {
                                if (error.message.includes('already registered')) {
                                    console.log('✅ EdickExt: Already registered (caught)');
                                    resolve({ success: true, alreadyRegistered: true });
                                } else {
                                    console.error('❌ Registration failed:', error);
                                    resolve({ success: false, error: error.message });
                                }
                            });

                        } catch (error) {
                            console.error('❌ Registration failed:', error);
                            resolve({
                                success: false,
                                error: error instanceof Error ? error.message : 'Unknown error'
                            });
                        }
                    });
                },
                world: 'MAIN'
            });

            const result = results[0].result as RegistrationResult;
            logInfo('Auto-registration results:', result);

            if (result.success) {
                await showNotification(tab, 'EdickExt: Автоматически зарегистрирован! 🎉');
                logSuccess('Successfully registered for tab', tab.id);
            } else {
                logError('Auto-registration failed:', result.error);
                this.tabManager.removeTab(tab.id!);
            }
        } catch (error) {
            logError('Auto-registration error:', error);
            this.tabManager.removeTab(tab.id!);
        }
    }
}