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
      
      const React = (window as any).React;
      const ReactDOM = (window as any).ReactDOM;
      
      if (!React || !ReactDOM) {
        throw new Error('React not available');
      }
      
      ReactDOM.render(
        React.createElement(WidgetComponent, props),
        container
      );
    },
    
    // Для отладки
    debug: () => {
      console.log('Available widgets:', Object.keys((window as any).EdickExtWidgets.components));
    }
  };
  
  console.log('✅ EdickExt Widgets Bundle loaded');
}