import type { TabInfo, RegistrationResult } from './extensionTypes.js';
import { logInfo, showNotification, logSuccess, logError } from './helpers.js';
import { TabManager } from './tab-manager.js';


export class RegistrationService {
  private tabManager: TabManager;

  constructor(tabManager: TabManager) {
    this.tabManager = tabManager;
  }

  async registerExtension(tab: TabInfo): Promise<void> {
    try {
      this.tabManager.addTab(tab.id!);
      logInfo('Auto-registering extension for tab', tab.id);

      // Функция регистрации которая возвращает Promise
      const registerFunction = function(): Promise<RegistrationResult> {
        return new Promise((resolve) => {
          try {
            console.log('🎯 EdickExt: Registering with NEW API...');
            
            (window as any).terminal.registerExtension({
              extensionName: 'EDICK_EXTENSION',
              displayName: 'EdickExt - Аналитика'
            }).then((extension: any) => {
              console.log("Extension:", extension);

              // Функция для безопасного рендеринга виджета
              const renderWidget = (widget: any) => {
                const safeRender = () => {
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

                    const newContent = document.createElement('div');
                    newContent.style.cssText = `
                      padding: 20px; 
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      border-radius: 8px; 
                      height: 100%;
                      box-sizing: border-box;
                    `;
                    newContent.innerHTML = `
                      <h3 style="margin: 0 0 12px 0;">💰 EdickExt</h3>
                      <p style="margin: 0 0 8px 0;">Анализ облигаций</p>
                      <p style="margin: 0; font-size: 12px; opacity: 0.8;">Работает!</p>
                    `;

                    while (container.firstChild) {
                      container.removeChild(container.firstChild);
                    }

                    container.appendChild(newContent);
                    console.log('✅ Widget content rendered safely');

                  } catch (error) {
                    console.error('❌ Safe render error:', error);
                  }
                };

                setTimeout(safeRender, 50);
              };

              // Функция для очистки виджета
              const cleanupWidget = (widget: any) => {
                console.log('🔧 Widget unmounted:', widget);
                try {
                  const container = widget.contentRef || widget.container;
                  if (container && document.body.contains(container)) {
                    while (container.firstChild) {
                      container.removeChild(container.firstChild);
                    }
                  }
                } catch (error) {
                  console.error('❌ Safe unmount error:', error);
                }
              };

              // Регистрируем тип виджета
              extension.registerWidgetType('bond-analyzer', {
                layout: {
                  width: 400,
                  height: 300
                },
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
                },
                handlers: {
                  mount: (widget: any) => {
                    console.log('Widget mounted:', widget);
                    renderWidget(widget);
                  },
                  unmount: (widget: any) => {
                    console.log('Widget unmounted:', widget);
                    cleanupWidget(widget);
                  },
                  tickerChange: (widget: any, oldTicker: string) => {
                    console.log('Ticker changed:', oldTicker, '->', widget.ticker);
                  },
                  groupChange: (widget: any, oldGroup: string) => {
                    console.log('Group changed:', oldGroup, '→', widget.group);
                  },
                  onCurrencyChange: (widget: any, oldCurrency: string) => {
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
      };

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: registerFunction,
        world: 'MAIN'
      });

      // ФИКС: правильная обработка типа
      const result = results[0].result as RegistrationResult;
      
      logInfo('Auto-registration results:', result);

      if (result.success) {
        await showNotification(tab, 'EdickExt: Автоматически зарегистрирован! 🎉');
        logSuccess('Successfully registered for tab', tab.id);
        
        // Проверим, зарегистрировались ли виджеты
        setTimeout(() => this.checkWidgetRegistration(tab), 1000);
      } else {
        logError('Auto-registration failed:', result.error);
        this.handleRegistrationFailure(tab.id!);
      }
    } catch (error) {
      logError('Auto-registration error:', error);
      this.handleRegistrationFailure(tab.id!);
    }
  }

  private async checkWidgetRegistration(tab: TabInfo): Promise<void> {
    try {
      const checkFunction = function(): string {
        // Проверяем, появились ли наши виджеты в меню
        const widgets = document.querySelectorAll('[class*="widget"], [class*="Widget"]');
        console.log('Available widgets in DOM:', widgets.length);
        
        // Ищем элементы, которые могут быть связаны с нашим виджетом
        const menuItems = document.querySelectorAll('[class*="menu"], [class*="Menu"]');
        console.log('Menu items:', menuItems.length);
        
        return `Widgets: ${widgets.length}, Menu items: ${menuItems.length}`;
      };

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: checkFunction,
        world: 'MAIN'
      });

      logInfo('Widget registration check:', results[0].result);
    } catch (error) {
      logError('Widget check error:', error);
    }
  }

  private handleRegistrationFailure(tabId: number): void {
    this.tabManager.removeTab(tabId);
    logInfo(`Registration failed for tab ${tabId}, removed from tracking`);
  }
}