import { TERMINAL_URL_PATTERNS } from "./extensionConsts";
import type { TabInfo } from "./extensionTypes";

export function isTerminalUrl(url?: string): boolean {
  if (!url) return false;
  return TERMINAL_URL_PATTERNS.some(pattern => 
    typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url)
  );
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function isValidTab(tab: TabInfo): boolean {
  return !!(tab && tab.id && tab.url);
}

export function logInfo(message: string, ...args: any[]): void {
  console.log(`ℹ️ EdickExt: ${message}`, ...args);
}

export function logError(message: string, ...args: any[]): void {
  console.error(`❌ EdickExt: ${message}`, ...args);
}

export function logSuccess(message: string, ...args: any[]): void {
  console.log(`✅ EdickExt: ${message}`, ...args);
}

export async function showNotification(tab: TabInfo, message: string): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: (msg: string) => {
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

/**
 * Находит React Fiber для элемента DOM
 * Используется для доступа к React props и методам компонентов
 */
export function findReactFiber(element: HTMLElement | null): any {
  if (!element) return null;
  
  for (let key in element) {
    if (key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')) {
      return element[key];
    }
  }
  
  return null;
}