// Главный файл бандла виджетов
import { BondAnalyzerWidget } from "./BondAnalyzerWidget/BondAnalyzerWidget";


// Импорты остальных виджетов...

// Регистрируем в глобальной области
if (typeof window !== 'undefined') {
  (window as any).EdickExtWidgets = {
    // Реестр компонентов
    components: {
      'bond-analyzer': BondAnalyzerWidget,
    //   'portfolio-viewer': PortfolioViewerWidget,
      // ... остальные виджеты
    },
    
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
      
      const React = (window as any).React;
      const ReactDOM = (window as any).ReactDOM;
      
      if (!React || !ReactDOM) {
        throw new Error('React not available');
      }
      
      // Проверяем версию React
      const reactVersion = React.version;
      console.log('Using React version:', reactVersion);
      
      try {
        // Используем createRoot для React 18+ вместо устаревшего render
        if (typeof ReactDOM.createRoot === 'function') {
          const root = ReactDOM.createRoot(container);
          root.render(React.createElement(WidgetComponent, props));
          // Сохраняем root для возможности unmount в будущем
          (container as any).__edickExtRoot = root;
        } else {
          // Fallback для старых версий React
          console.warn('ReactDOM.createRoot not available, using legacy render');
          ReactDOM.render(React.createElement(WidgetComponent, props), container);
        }
      } catch (error) {
        console.error('Error rendering widget:', error);
        console.error('WidgetComponent type:', typeof WidgetComponent);
        console.error('WidgetComponent:', WidgetComponent);
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
  
  console.log('✅ EdickExt Widgets Bundle loaded');
}