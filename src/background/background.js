// Background script for EdickExt
console.log('EdickExt: Background script loaded');

// Обработчик установки
chrome.runtime.onInstalled.addListener(() => {
  console.log('EdickExt: Extension installed');
  // При установке проверяем все открытые вкладки с терминалом
  checkAllTerminalTabs();
});

// Автоматическая проверка при обновлении вкладки
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && isTerminalUrl(tab.url)) {
    console.log('🔍 EdickExt: Terminal page loaded automatically checking...', tab.url);

    // Даем странице время на загрузку

    checkTerminalAPI(tab);

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
    console.log('🔍 EdickExt: Auto-checking terminal API for tab:', tab.url);

    // Выполняем код в контексте страницы
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: checkForTerminal,
      world: 'MAIN'
    });

    console.log('📡 EdickExt: Auto-check results:', results);

    if (results[0].result.found) {
      console.log('✅ EdickExt: Terminal API found automatically!');
      await registerExtension(tab);
    } else {
      console.log('❌ EdickExt: Terminal API not found in auto-check');
      // Пробуем еще раз через 5 секунд (на случай медленной загрузки)
      setTimeout(async () => {
        console.log('🔄 EdickExt: Retrying auto-check...');
        await retryTerminalCheck(tab);
      }, 5000);
    }

  } catch (error) {
    console.error('❌ EdickExt: Auto-check error:', error);
  }
}

// Повторная проверка с несколькими попытками
async function retryTerminalCheck(tab) {
  let attempts = 0;
  const maxAttempts = 10;

  const checkInterval = setInterval(async () => {
    attempts++;
    console.log(`🔄 EdickExt: Auto-check attempt ${attempts}/${maxAttempts}`);

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: checkForTerminal,
        world: 'MAIN'
      });

      if (results[0].result.found) {
        clearInterval(checkInterval);
        console.log('✅ EdickExt: Terminal API found on attempt', attempts);
        await registerExtension(tab);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.log('❌ EdickExt: Terminal API not found after', maxAttempts, 'attempts');
      }
    } catch (error) {
      console.error('❌ EdickExt: Auto-check attempt failed:', error);
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
      }
    }
  }, 1000);
}

// Функция которая выполняется в контексте страницы
function checkForTerminal() {
  console.log('🔍 EdickExt: Auto-checking window.terminal in PAGE context...');

  if (window.terminal) {
    console.log('✅ Terminal API available in auto-check!');
    return {
      found: true,
      terminal: '[Object]', // Не отправляем весь объект чтобы избежать ошибок
      keys: Object.keys(window.terminal),
      hasRegisterExtension: typeof window.terminal.registerExtension === 'function'
    };
  } else {
    console.log('❌ No terminal API found in auto-check');
    return {
      found: false,
      reason: 'window.terminal is undefined'
    };
  }
}

// Функция регистрации расширения
async function registerExtension(tab) {
  try {
    console.log('🚀 EdickExt: Auto-registering extension...');

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: registerInPageContext,
      world: 'MAIN'
    });

    console.log('📡 EdickExt: Auto-registration results:', results);

    if (results[0].result.success) {
      await showNotification(tab, 'EdickExt: Автоматически зарегистрирован! 🎉');
    } else {
      console.log('❌ EdickExt: Auto-registration failed:', results[0].result.error);
    }

  } catch (error) {
    console.error('❌ EdickExt: Auto-registration error:', error);
  }
}

// Функция регистрации в контексте страницы
function registerInPageContext() {
  try {
    console.log('🎯 EdickExt: Registering with NEW API...');

    if (!window.terminal?.registerExtension) {
      return { success: false, error: 'Terminal API not available' };
    }
    console.log(window.terminal);

    // Глобальная проверка чтобы не регистрировать дважды
    if (window._edickExtRegistered) {
      console.log('✅ EdickExt: Already registered');
      return { success: true, alreadyRegistered: true };
    }

    // ТОЛЬКО НОВЫЙ API
    window.terminal.registerExtension({
      extensionName: 'EDICK_EXTENSION',
      displayName: 'EdickExt - Аналитика'
    }).then(extension => {
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
          icon: '💰',
          label: 'Облигации EdickExt',
          order: 1,                       // ⚡ ДОБАВИЛ
          hint: 'Анализ облигаций'        // ⚡ ДОБАВИЛ
        },
        // ПРАВИЛЬНЫЕ handlers
        handlers: {
          mount: (widget) => {
            console.log('🔧 Widget mounted:', widget);
            widget.container.innerHTML = `
            <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; height: 100%;">
              <h3 style="margin: 0 0 12px 0;">💰 EdickExt</h3>
              <p style="margin: 0 0 8px 0;">Анализ облигаций</p>
              <p style="margin: 0; font-size: 12px; opacity: 0.8;">Новый API работает!</p>
            </div>
          `;
          },
          unmount: (widget) => {
            console.log('🔧 Widget unmounted:', widget);
          },
          tickerChange: (widget, oldTicker) => {
            console.log('🔧 Ticker changed:', oldTicker, '->', widget.ticker);
          }
        }
      });
    });

    console.log('✅ EdickExt: Successfully registered with new API');

    window._edickExtRegistered = true;
    return { success: true };

  } catch (error) {
    if (error.message.includes('already registered')) {
      console.log('✅ EdickExt: Already registered (caught)');
      window._edickExtRegistered = true;
      return { success: true, alreadyRegistered: true };
    }

    console.error('❌ Registration failed:', error);
    return { success: false, error: error.message };
  }
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