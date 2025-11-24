export class TabManager {
  private registeredTabs: Set<number> = new Set();

  addTab(tabId: number): void {
    this.registeredTabs.add(tabId);
    console.log(`📌 Tab ${tabId} added to registered tabs`);
  }

  removeTab(tabId: number): void {
    const wasRemoved = this.registeredTabs.delete(tabId);
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
  }

  get size(): number {
    return this.registeredTabs.size;
  }
}