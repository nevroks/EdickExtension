import type { Widget } from "./extensionTypes";

export function renderWidget(widget: Widget): void {
  const safeRender = (): void => {
    try {
      const container = widget.contentRef || widget.container;
      
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
        <p style="margin: 0; font-size: 12px; opacity: 0.8;">TypeScript версия!</p>
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
}

export function cleanupWidget(widget: Widget): void {
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
}