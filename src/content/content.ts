// Content script для инициализации виджетов
console.log('🧩 EdickExt Content Script started');

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