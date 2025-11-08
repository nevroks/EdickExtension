// Background script for EdickExt
console.log('EdickExt: Background script loaded');

const registeredTabs = new Set();

// Обработчик установки
chrome.runtime.onInstalled.addListener(() => {
  console.log('EdickExt: Extension installed');
  // При установке проверяем все открытые вкладки с терминалом
  checkAllTerminalTabs();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && isTerminalUrl(tab.url)) {
    console.log('🔍 EdickExt: Terminal page loaded or updated, checking...', tab.url);
    
    // Сбрасываем состояние для этой вкладки
    registeredTabs.delete(tabId);
    
    // Даем странице больше времени на инициализацию Terminal API
    setTimeout(async () => {
      await checkTerminalAPI(tab);
    }, 5000); // Увеличил задержку
  }
});

// Проверяем все уже открытые вкладки с терминалом
async function checkAllTerminalTabs() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (isTerminalUrl(tab.url)) {
      console.log('🔍 EdickExt: Checking existing terminal tab:', tab.url);
      setTimeout(async () => {
        await checkTerminalAPI(tab);
      }, 3000);
    }
  }
}

chrome.tabs.onRemoved.addListener((tabId) => {
  registeredTabs.delete(tabId);
});

// Проверяем является ли URL терминалом
function isTerminalUrl(url) {
  return url && (
    url.includes('tinkoff.ru/terminal') ||
    url.includes('tbank.ru/terminal') ||
    url.includes('tinkoff.ru/invest/') ||
    url.match(/https:\/\/(www\.)?tinkoff\.ru\/invest\/[^\/]+\/terminal/)
  );
}

// Функция проверки Terminal API
async function checkTerminalAPI(tab) {
  try {
    // Проверяем не зарегистрировано ли уже расширение для этой вкладки
    if (registeredTabs.has(tab.id)) {
      console.log('✅ EdickExt: Already registered for tab', tab.id);
      return;
    }

    console.log('🔍 Checking terminal API for tab', tab.id);

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: checkForTerminal,
      world: 'MAIN'
    });

    if (results[0].result.found) {
      console.log('✅ Terminal API found for tab', tab.id);
      await registerExtension(tab);
    } else {
      console.log('❌ Terminal API not found for tab', tab.id + ', retrying...');
      setTimeout(() => retryTerminalCheck(tab), 5000);
    }

  } catch (error) {
    console.error('❌ Check error for tab', tab.id + ':', error);
  }
}

// Повторная проверка с несколькими попытками
async function retryTerminalCheck(tab) {
  // Если уже зарегистрированы, выходим
  if (registeredTabs.has(tab.id)) {
    return;
  }

  let attempts = 0;
  const maxAttempts = 12; // Увеличил количество попыток

  const checkInterval = setInterval(async () => {
    // Если зарегистрировались в другом месте, выходим
    if (registeredTabs.has(tab.id)) {
      clearInterval(checkInterval);
      return;
    }

    attempts++;
    console.log(`🔄 Attempt ${attempts}/${maxAttempts} for tab ${tab.id}`);

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: checkForTerminal,
        world: 'MAIN'
      });

      if (results[0].result.found) {
        clearInterval(checkInterval);
        console.log('✅ Terminal API found on attempt', attempts, 'for tab', tab.id);
        await registerExtension(tab);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.log('❌ Terminal API not found after', maxAttempts, 'attempts for tab', tab.id);
      }
    } catch (error) {
      console.error('❌ Check attempt failed for tab', tab.id + ':', error);
      if (attempts >= maxAttempts) clearInterval(checkInterval);
    }
  }, 1000);
}

// Функция которая выполняется в контексте страницы
function checkForTerminal() {
  console.log('🔍 EdickExt: Auto-checking window.terminal in PAGE context...');

  // Более тщательная проверка Terminal API
  const terminal = window.terminal;
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
}

// Функция регистрации расширения
async function registerExtension(tab) {
  try {
    // Помечаем вкладку как обрабатываемую
    registeredTabs.add(tab.id);
    
    console.log('🚀 EdickExt: Auto-registering extension for tab', tab.id);

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: registerInPageContext,
      world: 'MAIN'
    });

    console.log('📡 EdickExt: Auto-registration results for tab', tab.id + ':', results);

    if (results[0].result.success) {
      await showNotification(tab, 'EdickExt: Автоматически зарегистрирован! 🎉');
      console.log('✅ EdickExt: Successfully registered for tab', tab.id);
    } else {
      console.log('❌ EdickExt: Auto-registration failed for tab', tab.id + ':', results[0].result.error);
      // Если регистрация не удалась, разрешаем повторную попытку
      registeredTabs.delete(tab.id);
    }

  } catch (error) {
    console.error('❌ EdickExt: Auto-registration error for tab', tab.id + ':', error);
    // При ошибке разрешаем повторную попытку
    registeredTabs.delete(tab.id);
  }
}

// Функция регистрации в контексте страницы
function registerInPageContext() {
  return new Promise((resolve) => { // ⚡ ОБЕРНУЛИ В PROMISE
    try {
      console.log('🎯 EdickExt: Registering with NEW API...');

      if (!window.terminal?.registerExtension) {
        resolve({ success: false, error: 'Terminal API not available' });
        return;
      }

      // ТОЛЬКО НОВЫЙ API
      window.terminal.registerExtension({
        extensionName: 'EDICK_EXTENSION',
        displayName: 'EdickExt - Аналитика'
      }).then(extension => {

        console.log("Etension:", extension);

        // console.log(extension.getWidgetTypes());

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
            fullscreenAllowed: true,        // ⚡ ДОБАВИЛ
            isSymbolResettingWithGroup: false, // ⚡ ДОБАВИЛ
            useSymbolInTitle: false,
            pinnable: true
          },
          menu: {
            icon: 'chart',
            label: 'Облигации EdickExt',
            order: 1,                       // ⚡ ДОБАВИЛ
            hint: 'Анализ облигаций'        // ⚡ ДОБАВИЛ
          },
          // ПРАВИЛЬНЫЕ handlers
          handlers: {
            mount: (widget) => {
              console.log(widget);

              console.log('Настройки:', widget.getCommonSettings?.());

              // БЕЗОПАСНЫЙ подход - используем requestAnimationFrame и проверки
              const safeRender = () => {
                try {
                  // Ищем контейнер безопасно
                  let container = widget.contentRef || widget.container;

                  if (!container) {
                    console.warn('❌ Container not found, retrying...');
                    setTimeout(safeRender, 100);
                    return;
                  }

                  // Проверяем что контейнер все еще в DOM
                  if (!document.body.contains(container)) {
                    console.warn('❌ Container not in DOM');
                    return;
                  }

                  // СОЗДАЕМ новый элемент вместо innerHTML
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
                    <p style="margin: 0; font-size: 12px; opacity: 0.8;">Безопасный рендеринг!</p>
                  `;

                  // ОЧИСТКА через безопасный метод
                  while (container.firstChild) {
                    container.removeChild(container.firstChild);
                  }

                  // ДОБАВЛЯЕМ новый контент
                  container.appendChild(newContent);

                  console.log('✅ Widget content rendered safely');

                } catch (error) {
                  console.error('❌ Safe render error:', error);
                }
              };

              // Запускаем с задержкой чтобы DOM успел стабилизироваться
              setTimeout(safeRender, 50);
            },

            unmount: (widget) => {
              console.log('🔧 Widget unmounted:', widget);
              // Безопасная очистка
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
            },

            tickerChange: (widget, oldTicker) => {
              console.log(widget);
              
              console.log('🔧 Ticker changed:', oldTicker, '->', widget.ticker);
            },
            groupChange: (widget, oldGroup) => {
              console.log('🎯 Group changed:', oldGroup, '→', widget.group);
            },
            onCurrencyChange: (widget, oldCurrency) => {
              console.log('🎯 Currency changed:', oldCurrency, '→', widget.currency);
            }
          }

        });

        console.log('✅ EdickExt: Successfully registered with new API');

        resolve({ success: true }); // ⚡ RESOLVE PROMISE

      }).catch(error => {
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
      resolve({ success: false, error: error.message });
    }
  });
}

// Функция показа уведомления
async function showNotification(tab, message) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (msg) => {
        const div = document.createElement('div');
        div.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: #4caf50;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          font-family: Arial, sans-serif;
          z-index: 10000;
          font-size: 14px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        div.textContent = msg;
        document.body.appendChild(div);

        setTimeout(() => div.remove(), 5000);
      },
      args: [message]
    });
  } catch (error) {
    console.log('Could not show notification:', error);
  }
}