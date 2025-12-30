/**
 * Функция для инжекции SessionStorageWatcher в основном контексте
 * Должна быть отдельной функцией для сериализации через chrome.scripting.executeScript
 */

export type watchedKeys = 'nonShared' | 'другой ключ';

export function injectSessionStorageWatcher() {
  'use strict';

  // Проверка, не инициализирован ли уже watcher
  if ((window as Window & { EdickExtSessionWatcher?: unknown }).EdickExtSessionWatcher) {
    return;
  }

  // Проверка URL терминала (используем те же паттерны, что и в TERMINAL_URL_PATTERNS)
  // Дублируем здесь, так как функция должна быть сериализуемой для executeScript
  function isTerminalUrl(url: string): boolean {
    if (!url) return false;
    const patterns: (string | RegExp)[] = ['tinkoff.ru/terminal', 'tbank.ru/terminal', 'tinkoff.ru/invest/', /https:\/\/(www\.)?tinkoff\.ru\/invest\/[^/]+\/terminal/];
    return patterns.some((pattern) => (typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url)));
  }

  if (!isTerminalUrl(window.location.href)) {
    return;
  }

  class SessionStorageWatcher {
    private watchedKeys: watchedKeys[] = ['nonShared'];
    private values: Map<string, string | null> = new Map();
    private isActive = false;
    private handlers: Set<(change: { key: string; oldValue: string | null; newValue: string | null; type: string }) => void> = new Set();

    constructor() {
      this.init();
      this.initializeValues();
      this.isActive = true;
    }

    private initializeValues(): void {
      this.watchedKeys.forEach((key) => {
        const value = sessionStorage.getItem(key);
        this.values.set(key, value);
      });
    }

    private init(): void {
      const originalSetItem = sessionStorage.setItem.bind(sessionStorage);
      const originalRemoveItem = sessionStorage.removeItem.bind(sessionStorage);
      const originalClear = sessionStorage.clear.bind(sessionStorage);

      sessionStorage.setItem = (key: watchedKeys, value: string): void => {
        try {
          const oldValue = sessionStorage.getItem(key);
          originalSetItem(key, value);
          // Перехватываем только отслеживаемые ключи
          if (this.watchedKeys.includes(key)) {
            this.handleChange({ key, oldValue, newValue: value, type: 'set' });
          }
        } catch (error) {
          console.error('SessionStorageWatcher: Error in setItem interceptor:', error);
          throw error;
        }
      };

      sessionStorage.removeItem = (key: watchedKeys): void => {
        try {
          const oldValue = sessionStorage.getItem(key);
          originalRemoveItem(key);

          if (this.watchedKeys.includes(key)) {
            this.handleChange({ key, oldValue, newValue: null, type: 'remove' });
          }
        } catch (error) {
          console.error('SessionStorageWatcher: Error in removeItem interceptor:', error);
          throw error;
        }
      };

      sessionStorage.clear = (): void => {
        try {
          const oldValues = new Map<string, string | null>();
          this.watchedKeys.forEach((key) => {
            oldValues.set(key, sessionStorage.getItem(key));
          });
          originalClear();
          this.watchedKeys.forEach((key) => {
            this.handleChange({
              key,
              oldValue: oldValues.get(key) || null,
              newValue: null,
              type: 'clear',
            });
          });
        } catch (error) {
          console.error('SessionStorageWatcher: Error in clear interceptor:', error);
          throw error;
        }
      };
    }

    private handleChange(change: { key: watchedKeys; oldValue: string | null; newValue: string | null; type: string }): void {
      const { key } = change;
      if (!this.watchedKeys.includes(key)) {
        return;
      }

      try {
        this.values.set(key, change.newValue);
        this.notify(change);
        try {
          window.postMessage(
            {
              source: 'EDICK_EXT_SESSION_STORAGE_WATCHER',
              type: 'SESSION_STORAGE_CHANGE',
              payload: {
                key: change.key,
                oldValue: change.oldValue,
                newValue: change.newValue,
                allValues: Object.fromEntries(this.values),
              },
            },
            '*',
          );
        } catch (error) {
          console.error('SessionStorageWatcher: Error sending postMessage:', error);
        }
      } catch (error) {
        console.error('SessionStorageWatcher: Error in handleChange:', error);
      }
    }

    private notify(change: { key: string; oldValue: string | null; newValue: string | null; type: string }): void {
      this.handlers.forEach((handler) => {
        try {
          handler(change);
        } catch (error) {
          console.error('SessionStorageWatcher: Error in handler:', error);
        }
      });
    }

    public subscribe(callback: (change: { key: string; oldValue: string | null; newValue: string | null; type: string }) => void): () => void {
      this.handlers.add(callback);
      return () => this.handlers.delete(callback);
    }

    public getValue(key: string): string | null {
      if (this.values.has(key)) {
        return this.values.get(key) ?? null;
      }
      const directValue = sessionStorage.getItem(key);
      if (directValue !== null) {
        this.values.set(key, directValue);
      }
      return directValue;
    }

    public getAllValues(): Record<string, string | null> {
      return Object.fromEntries(this.values);
    }

    public watchKey(key: watchedKeys): void {
      if (!this.watchedKeys.includes(key)) {
        this.watchedKeys.push(key);
        const value = sessionStorage.getItem(key);
        this.values.set(key, value);
      }
    }

    public isWatching(): boolean {
      return this.isActive;
    }

    public getWatchedKeys(): string[] {
      return [...this.watchedKeys];
    }
  }

  // Инициализация
  const sessionWatcher = new SessionStorageWatcher();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).EdickExtSessionWatcher = sessionWatcher;

  // Отправляем сообщение о готовности в content script для пересылки в background
  window.postMessage(
    {
      source: 'EDICK_EXT_SESSION_STORAGE_WATCHER',
      type: 'SESSION_WATCHER_READY',
      payload: {
        watchedKeys: sessionWatcher.getWatchedKeys(),
        values: sessionWatcher.getAllValues(),
      },
    },
    '*',
  );
}
