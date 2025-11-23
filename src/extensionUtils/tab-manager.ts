export class TabManager {
  private registeredTabs: Set<number> = new Set();

  addTab(tabId: number): void {
    this.registeredTabs.add(tabId);
  }

  removeTab(tabId: number): void {
    this.registeredTabs.delete(tabId);
  }

  hasTab(tabId: number): boolean {
    return this.registeredTabs.has(tabId);
  }

  getRegisteredTabs(): number[] {
    return Array.from(this.registeredTabs);
  }

  clear(): void {
    this.registeredTabs.clear();
  }
}