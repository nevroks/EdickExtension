import { defaultUserAppSettings } from '../utils/consts/appConsts.js';
import type { RegistrationResult, TabInfo } from './extensionTypes.js';
import { logError, logInfo, logSuccess, showNotification } from './helpers.js';
import { TabManager } from './tab-manager.js';
import { UserAppSettingsManager } from './userAppSettings-manager.js';

export class RegistrationService {
  private tabManager: TabManager;
  private userAppSettingsManager: UserAppSettingsManager;

  constructor(tabManager: TabManager, userAppSettingsManager: UserAppSettingsManager) {
    this.tabManager = tabManager;
    this.userAppSettingsManager = userAppSettingsManager;
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
    // Гарантируем, что widgets.iife.js загружен в MAIN world
    try {
      logInfo('Injecting widgets.iife.js to MAIN world before registration...');
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['widgets.iife.js'],
        world: 'MAIN',
      });
      logSuccess('Widgets script injected successfully');
    } catch (error) {
      logError('Failed to inject widgets script:', error);
      // Продолжаем, возможно скрипт уже загружен
    }

    const widgetsCssUrl = chrome.runtime.getURL('widgets.css');
    const widgetsScriptUrl = chrome.runtime.getURL('widgets.iife.js');
    const extensionId = chrome.runtime.id;
    const userAppSettings = this.userAppSettingsManager.getUserAppSettings();

    const registerFunction = function (cssUrl: string, extensionId: string, scriptUrl: string, userAppSettings: any, defaultSettings: any): Promise<RegistrationResult> {
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

          (window as any).terminal
            .registerExtension({
              extensionName: 'EDICK_EXTENSION',
              displayName: 'EdickExt - Аналитика',
            })
            .then((extension: any) => {
              console.log('Extension:', extension);

              const renderReactWidget = async (widget: any, props: any) => {
                const safeRender = async (retryCount = 0, maxRetries = 20) => {
                  // scriptUrl доступен из замыкания registerFunction
                  try {
                    const container = widget.contentRef || widget.container;

                    if (!container) {
                      console.warn('❌ Container not found, retrying...');
                      if (retryCount < maxRetries) {
                        setTimeout(() => safeRender(retryCount + 1, maxRetries), 100);
                      }
                      return;
                    }

                    if (!document.body.contains(container)) {
                      console.warn('❌ Container not in DOM');
                      return;
                    }

                    // Проверяем наличие EdickExtWidgets
                    let EdickExtWidgets = (window as any).EdickExtWidgets;

                    if (!EdickExtWidgets) {
                      // Пытаемся загрузить скрипт динамически, если он не загружен
                      if (retryCount === 0) {
                        console.warn('❌ EdickExtWidgets not found, attempting to load script...');
                        const scriptId = 'edick-ext-widgets-script';
                        const existingScript = document.getElementById(scriptId);
                        if (!existingScript) {
                          const script = document.createElement('script');
                          script.id = scriptId;
                          script.src = scriptUrl;
                          script.async = false; // Загружаем синхронно для гарантии

                          // Ждем загрузки скрипта
                          await new Promise<void>((resolve, reject) => {
                            script.onload = () => {
                              console.log('✅ widgets.iife.js loaded successfully');
                              resolve();
                            };
                            script.onerror = () => {
                              console.error('❌ Failed to load widgets.iife.js');
                              reject(new Error('Failed to load widgets.iife.js'));
                            };
                            document.head.appendChild(script);
                          });

                          // Дополнительная задержка для инициализации
                          await new Promise((resolve) => setTimeout(resolve, 100));
                        } else {
                          // Скрипт уже существует, но EdickExtWidgets все еще не доступен
                          // Возможно, скрипт еще загружается
                          await new Promise((resolve) => setTimeout(resolve, 200));
                        }
                      }

                      EdickExtWidgets = (window as any).EdickExtWidgets;

                      if (!EdickExtWidgets) {
                        console.warn(`❌ EdickExtWidgets not loaded yet, retrying... (${retryCount}/${maxRetries})`);
                        if (retryCount < maxRetries) {
                          setTimeout(() => safeRender(retryCount + 1, maxRetries), 100);
                          return;
                        } else {
                          throw new Error('EdickExtWidgets не загружен после максимального количества попыток. Убедитесь, что widgets.iife.js доступен.');
                        }
                      }
                    }

                    // Проверяем наличие метода renderWidget
                    if (typeof EdickExtWidgets.renderWidget !== 'function') {
                      console.warn(`❌ EdickExtWidgets.renderWidget не является функцией, retrying... (${retryCount}/${maxRetries})`);
                      if (retryCount < maxRetries) {
                        setTimeout(() => safeRender(retryCount + 1, maxRetries), 100);
                        return;
                      } else {
                        throw new Error('EdickExtWidgets.renderWidget недоступен');
                      }
                    }

                    while (container.firstChild) {
                      container.removeChild(container.firstChild);
                    }

                    const reactRoot = document.createElement('div');
                    reactRoot.style.cssText = 'height: 100%; width: 100%;';
                    container.appendChild(reactRoot);

                    // Используем универсальный рендерер
                    EdickExtWidgets.renderWidget(props.widgetId, reactRoot, {
                      ...props,
                      onUpdate: (data: any) => {
                        console.log('Widget update:', data);
                      },
                    });
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

              // Используем переданные настройки виджетов (с значениями по умолчанию)
              const settings = userAppSettings || defaultSettings;

              const allWidgetConfigs = [
                {
                  id: 'bond-analyzer',
                  enabled: true, // Всегда доступен
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
                      pinnable: true,
                    },
                    menu: {
                      icon: 'chart',
                      label: 'Облигации EdickExt',
                      order: 1,
                      hint: 'Анализ облигаций',
                    },
                  },
                },
                {
                  id: 'news',
                  enabled: settings.newsWidget,
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
                      pinnable: true,
                    },
                    menu: {
                      icon: 'newspaper',
                      label: 'Новости EdickExt',
                      order: 2,
                      hint: 'Последние новости',
                    },
                  },
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
                      pinnable: true,
                    },
                    menu: {
                      icon: 'newspaper',
                      label: 'Заявки EdickExt',
                      order: 2,
                      hint: 'Последние заявки',
                    },
                  },
                },
              ];

              // Фильтруем виджеты на основе настроек
              const widgetConfigs = allWidgetConfigs.filter((widget) => widget.enabled);

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
                        terminalWidgetId: widget.widgetId,
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
                    },
                  },
                });
              });

              console.log('✅ EdickExt: Successfully registered with new API');
              resolve({ success: true });
            })
            .catch((error: Error) => {
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
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });
    };

    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: registerFunction,
      args: [widgetsCssUrl, extensionId, widgetsScriptUrl, userAppSettings, defaultUserAppSettings], // Передаем URL CSS, Extension ID, URL скрипта, настройки и дефолтные значения
      world: 'MAIN',
    });

    // @ts-ignore
    const resultPromise = results[0].result as Promise<RegistrationResult>;
    return await resultPromise;
  }
}
