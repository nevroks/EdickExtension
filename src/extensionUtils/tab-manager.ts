export class TabManager {
  private registeredTabs: Set<number> = new Set();
  private currentTabId: number | null = null;

  constructor() {
    this.setupCurrentTabListener();
  }

  private setupCurrentTabListener(): void {
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.currentTabId = activeInfo.tabId;
      console.log(`🎯 Current tab changed to ${this.currentTabId}`);
    });

    // Инициализация текущей вкладки при старте
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        this.currentTabId = tabs[0].id;
        console.log(`🎯 Initial current tab: ${this.currentTabId}`);
      }
    });
  }
  addTab(tabId: number): void {
    this.registeredTabs.add(tabId);
    console.log(`📌 Tab ${tabId} added to registered tabs`);
  }
  getCurrentTabId(): number | null {
    return this.currentTabId;
  }
  isCurrentTab(tabId: number): boolean {
    return this.currentTabId === tabId;
  }
  removeTab(tabId: number): void {
    const wasRemoved = this.registeredTabs.delete(tabId);

    if (this.isCurrentTab(tabId)) {
      this.currentTabId = null;
      console.log(`🗑️ Current tab ${tabId} was removed`);
    }

    if (wasRemoved) {
      console.log(`🗑️ Tab ${tabId} removed from registered tabs`);
    }
  }

  hasTab(tabId: number): boolean {
    return this.registeredTabs.has(tabId);
  }

  getRegisteredTabs(): number[] {
    return Array.from(this.registeredTabs);
  }

  clear(): void {
    console.log(`🧹 Clearing all ${this.registeredTabs.size} registered tabs`);
    this.registeredTabs.clear();
    this.currentTabId = null;
  }

  get size(): number {
    return this.registeredTabs.size;
  }
}