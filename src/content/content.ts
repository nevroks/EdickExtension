// Content script для инициализации виджетов
console.log('🧩 EdickExt Content Script started');

const MESSAGE_SOURCE = 'EDICK_EXT_JWT_PROVIDER';
const MESSAGE_TARGET = 'EDICK_EXT_CONTENT_SCRIPT';

window.addEventListener('message', (event) => {
  if (event.data?.source !== MESSAGE_SOURCE) {
    return;
  }

  if (event.data.type === 'GET_ACCESS_TOKEN') {
    chrome.runtime.sendMessage(
      { type: 'GET_ACCESS_TOKEN' },
      (response) => {
        window.postMessage(
          {
            source: MESSAGE_TARGET,
            requestId: event.data.requestId,
            accessToken: response?.accessToken || null,
          },
          '*'
        );
      }
    );
  }

  if (event.data.type === 'REFRESH_TOKENS') {
    chrome.runtime.sendMessage(
      { type: 'REFRESH_TOKENS' },
      (response) => {
        window.postMessage(
          {
            source: MESSAGE_TARGET,
            requestId: event.data.requestId,
            tokens: response?.tokens || null,
          },
          '*'
        );
      }
    );
  }

});

// Слушаем сообщения от background script о новых новостях
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === 'WS_NEWS_UPDATE') {
    // Пересылаем новость в виджет через window.postMessage
    window.postMessage(
      {
        source: MESSAGE_TARGET,
        type: 'WS_NEWS_UPDATE',
        news: message.news,
      },
      '*'
    );
  }
});

// Функция для проверки загрузки виджетов
const checkWidgetsLoaded = () => {
  if ((window as any).EdickExtWidgets) {
    console.log('✅ EdickExtWidgets loaded successfully', {
      widgetsCount: Object.keys((window as any).EdickExtWidgets.components || {}).length,
      availableWidgets: Object.keys((window as any).EdickExtWidgets.components || {})
    });
    return true;
  } else {
    console.log('⏳ Waiting for EdickExtWidgets...');
    return false;
  }
};

// Периодически проверяем загрузку виджетов
let checkCount = 0;
const maxChecks = 50; // 5 секунд максимум

const waitForWidgets = () => {
  if (checkWidgetsLoaded() || checkCount >= maxChecks) {
    console.log(`🏁 Widgets check finished after ${checkCount} attempts`);
    return;
  }

  checkCount++;
  setTimeout(waitForWidgets, 100);
};

// Начинаем проверку
setTimeout(waitForWidgets, 100);

// Отладочная информация
setTimeout(() => {
  console.log('🔍 Debug - Available globals:', {
    React: !!(window as any).React,
    ReactDOM: !!(window as any).ReactDOM,
    EdickExtWidgets: !!(window as any).EdickExtWidgets,
    terminal: !!(window as any).terminal
  });
}, 2000);
