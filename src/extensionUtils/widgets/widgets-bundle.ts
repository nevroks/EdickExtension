// Главный файл бандла виджетов
import React from 'react';
import { createRoot } from 'react-dom/client';


import { WIDGET_REGISTRY  } from '.';


// Импорты остальных виджетов...

// Регистрируем в глобальной области
if (typeof window !== 'undefined') {


  (window as any).EdickExtWidgets = {
    // Реестр компонентов
    components: WIDGET_REGISTRY,

    // Утилиты
    getWidgetComponent: (widgetId: string) => {
      return (window as any).EdickExtWidgets.components[widgetId];
    },

    renderWidget: (widgetId: string, container: HTMLElement, props: any) => {
      const WidgetComponent = (window as any).EdickExtWidgets.getWidgetComponent(widgetId);
      if (!WidgetComponent) {
        throw new Error(`Widget ${widgetId} not found`);
      }

      // Проверяем, что компонент является функцией
      if (typeof WidgetComponent !== 'function') {
        console.error('Widget component is not a function:', WidgetComponent);
        throw new Error(`Widget ${widgetId} is not a valid React component`);
      }

      // React теперь включен в бандл, используем импортированные модули
      try {
        const root = createRoot(container);
        root.render(React.createElement(WidgetComponent, props));
        (container as any).__edickExtRoot = root;
      } catch (error) {
        console.error('Error rendering widget:', error);
        throw error;
      }
    },

    unmountWidget: (container: HTMLElement) => {
      const root = (container as any).__edickExtRoot;
      if (root) {
        root.unmount();
        delete (container as any).__edickExtRoot;
      }
    },

    // Для отладки
    debug: () => {
      console.log('Available widgets:', Object.keys((window as any).EdickExtWidgets.components));
    }
  };
}