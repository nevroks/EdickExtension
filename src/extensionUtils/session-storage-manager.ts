// extensionUtils/session-storage-manager.ts
import { TabManager } from './tab-manager';
import { logInfo } from './helpers';

export class SessionStorageManager {
  private tabManager: TabManager;
  private tabData: Map<number, Record<string, string | null>> = new Map();

  constructor(tabManager: TabManager) {
    this.tabManager = tabManager;
  }

  /**
   * Обновить данные для вкладки
   */
  updateTabData(tabId: number, data: Record<string, string | null>): void {
    this.tabData.set(tabId, { ...data });
    logInfo(`SessionStorageManager: Updated data for tab ${tabId}`, Object.keys(data));
  }

  /**
   * Получить данные вкладки
   */
  getTabData(tabId: number): Record<string, string | null> | null {
    return this.tabData.get(tabId) || null;
  }

  /**
   * Получить конкретное значение для вкладки
   */
  getTabValue(tabId: number, key: string): string | null {
    const data = this.tabData.get(tabId);
    return data?.[key] || null;
  }

  /**
   * Получить данные текущей вкладки
   */
  getCurrentTabData(): Record<string, string | null> | null {
    const currentTabId = this.tabManager.getCurrentTabId();
    return currentTabId ? this.getTabData(currentTabId) : null;
  }

  /**
   * Получить значение из текущей вкладки
   */
  getCurrentTabValue(key: string): string | null {
    const currentTabId = this.tabManager.getCurrentTabId();
    return currentTabId ? this.getTabValue(currentTabId, key) : null;
  }

  /**
   * Удалить данные вкладки
   */
  removeTabData(tabId: number): void {
    this.tabData.delete(tabId);
    logInfo(`SessionStorageManager: Removed data for tab ${tabId}`);
  }

  /**
   * Проверить есть ли данные для вкладки
   */
  hasTabData(tabId: number): boolean {
    return this.tabData.has(tabId);
  }

  /**
   * Получить все вкладки с данными
   */
  getAllTabsWithData(): number[] {
    return Array.from(this.tabData.keys());
  }
}