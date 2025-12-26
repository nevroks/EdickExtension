import type {
  RegistrationResult,
  TabInfo,
} from './extensionTypes.js';
import {
  logError,
  logInfo,
  logSuccess,
  showNotification,
} from './helpers.js';
import { TabManager } from './tab-manager.js';

export class RegistrationService {
  private tabManager: TabManager;

  constructor(tabManager: TabManager) {
    this.tabManager = tabManager;
  }

  async registerExtension(tab: TabInfo): Promise<boolean> {
    try {
      logInfo('Starting extension registration for tab', tab.id);

      const result = await this.executeRegistration(tab.id!);
      logInfo('Registration results:', result);

      if (result.success) {
        this.tabManager.addTab(tab.id!);
        await showNotification(tab, 'EdickExt: Автоматически зарегистрирован! 🎉');
        logSuccess('Successfully registered for tab', tab.id);
        return true;
      } else {
        logError('Registration failed:', result.error);
        return false;
      }
    } catch (error) {
      logError('Registration error:', error);
      return false;
    }
  }
  private async executeRegistration(tabId: number): Promise<RegistrationResult> {
    const widgetsCssUrl = chrome.runtime.getURL('widgets.css');
    const extensionId = chrome.runtime.id;

    const registerFunction = function (cssUrl: string, extensionId: string): Promise<RegistrationResult> {
      return new Promise((resolve) => {
        try {
          const injectWidgetsCSS = () => {
            const cssId = 'edick-ext-widgets-css';

            if (document.getElementById(cssId)) {
              return;
            }

            const link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.href = cssUrl;
            link.onerror = () => {
              console.warn('⚠️ EdickExt: Failed to load widgets.css, using fallback');
              // Fallback: можно попробовать загрузить через fetch и инжектировать как <style>
            };
            document.head.appendChild(link);
          };

          injectWidgetsCSS();

          // Сохраняем Extension ID в глобальной переменной для использования в виджетах
          if (!(window as any).__EDICK_EXTENSION_ID__) {
            (window as any).__EDICK_EXTENSION_ID__ = extensionId;
          }

          console.log('🎯 EdickExt: Registering with NEW API...');

          (window as any).terminal.registerExtension({
            extensionName: 'EDICK_EXTENSION',
            displayName: 'EdickExt - Аналитика'
          }).then((extension: any) => {
            console.log("Extension:", extension);

            const renderReactWidget = async (widget: any, props: any) => {
              const safeRender = async () => {
                try {
                  let container = widget.contentRef || widget.container;

                  if (!container) {
                    console.warn('❌ Container not found, retrying...');
                    setTimeout(safeRender, 100);
                    return;
                  }

                  if (!document.body.contains(container)) {
                    console.warn('❌ Container not in DOM');
                    return;
                  }

                  while (container.firstChild) {
                    container.removeChild(container.firstChild);
                  }

                  const reactRoot = document.createElement('div');
                  reactRoot.style.cssText = 'height: 100%; width: 100%;';
                  container.appendChild(reactRoot);

                  const { EdickExtWidgets } = window as any;

                  // Используем универсальный рендерер
                  EdickExtWidgets.renderWidget(
                    props.widgetId,
                    reactRoot,
                    {
                      ...props,
                      onUpdate: (data: any) => {
                        console.log('Widget update:', data);
                      }
                    }
                  );
                  // Используем универсальный рендерер из бандла

                  console.log(`✅ Widget ${props.widgetId} rendered successfully`);

                } catch (error) {
                  console.error('❌ Safe render error:', error);

                  // Фолбэк на простой виджет если основной не загрузился
                  try {
                    const container = widget.contentRef || widget.container;
                    if (container) {
                      container.innerHTML = `
                      <div style="padding: 20px; background: #ff6b6b; color: white; border-radius: 8px; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                        <h3 style="margin: 0 0 12px 0;">💰 EdickExt</h3>
                        <p style="margin: 0 0 8px 0;">Виджет временно недоступен</p>
                        <p style="margin: 0; font-size: 12px; opacity: 0.8;">Ошибка загрузки</p>
                      </div>
                    `;
                    }
                  } catch (fallbackError) {
                    console.error('❌ Fallback also failed:', fallbackError);
                  }
                }
              };

              setTimeout(safeRender, 50);
            };

            const cleanupWidget = (widget: any) => {
              console.log('🔧 Widget unmounted:', widget);
              try {
                const container = widget.contentRef || widget.container;
                if (container && document.body.contains(container)) {
                  if ((window as any).ReactDOM) {
                    (window as any).ReactDOM.unmountComponentAtNode(container);
                  }
                  while (container.firstChild) {
                    container.removeChild(container.firstChild);
                  }
                }
              } catch (error) {
                console.error('❌ Cleanup error:', error);
              }
            };

            const widgetConfigs = [
              {
                id: 'bond-analyzer',
                config: {
                  layout: { width: 400, height: 300 },
                  settings: {
                    title: 'Анализ облигаций',
                    searchable: true,
                    symbolRequired: false,
                    noGroup: false,
                    fullscreenAllowed: true,
                    isSymbolResettingWithGroup: false,
                    useSymbolInTitle: false,
                    pinnable: true
                  },
                  menu: {
                    icon: 'chart',
                    label: 'Облигации EdickExt',
                    order: 1,
                    hint: 'Анализ облигаций'
                  }
                }
              },
              {
                id: 'news',
                config: {
                  layout: { width: 400, height: 500 },
                  settings: {
                    title: 'Новости',
                    searchable: true,
                    symbolRequired: false,
                    noGroup: false,
                    fullscreenAllowed: true,
                    isSymbolResettingWithGroup: false,
                    useSymbolInTitle: false,
                    pinnable: true
                  },
                  menu: {
                    icon: 'newspaper',
                    label: 'Новости EdickExt',
                    order: 2,
                    hint: 'Последние новости'
                  }
                }
              },
              {
                id: 'application',
                config: {
                  layout: { width: 400, height: 500 },
                  settings: {
                    title: 'Заявки',
                    searchable: true,
                    symbolRequired: false,
                    noGroup: false,
                    fullscreenAllowed: true,
                    isSymbolResettingWithGroup: false,
                    useSymbolInTitle: false,
                    pinnable: true
                  },
                  menu: {
                    icon: 'newspaper',
                    label: 'Заявки EdickExt',
                    order: 2,
                    hint: 'Последние заявки'
                  }
                }
              }
            ];

            widgetConfigs.forEach(({ id, config }) => {
              const updateWidget = (widget: any) => {
                console.log(widget);

                renderReactWidget(widget, {
                  figi: widget.asset.figi,
                  ticker: widget.ticker,
                  group: widget.group,
                  currency: widget.currency,
                  widgetId: id,
                  terminalWidgetId: widget.widgetId,
                });
              };

              extension.registerWidgetType(id, {
                ...config,
                handlers: {
                  mount: (widget: any) => {
                    console.log(`Widget ${id} mounted:`, widget);
                    renderReactWidget(widget, {
                      ticker: widget.ticker,
                      group: widget.group,
                      currency: widget.currency,
                      widgetId: id,
                      terminalWidgetId: widget.widgetId
                    });
                  },
                  unmount: cleanupWidget,
                  tickerChange: (widget: any, oldTicker: string) => {
                    console.log(`Ticker changed in ${id}:`, oldTicker, '->', widget.ticker);
                    updateWidget(widget);
                  },
                  groupChange: (widget: any, oldGroup: string) => {
                    console.log(`Group changed in ${id}:`, oldGroup, '→', widget.group);
                    updateWidget(widget);
                  },
                  onCurrencyChange: (widget: any, oldCurrency: string) => {
                    console.log(`Currency changed in ${id}:`, oldCurrency, '→', widget.currency);
                    updateWidget(widget);
                  }
                }
              });
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
    };

    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: registerFunction,
      args: [widgetsCssUrl, extensionId], // Передаем URL CSS и Extension ID
      world: 'MAIN'
    });

    // @ts-ignore
    const resultPromise = results[0].result as Promise<RegistrationResult>;
    return await resultPromise;
  }

}


