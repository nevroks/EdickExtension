class SessionStorageWatcher {
  private watchedKeys: string[] = [
    'nonShared', 
  ];
  
  private values: Map<string, string | null> = new Map();
  private isActive = false;

  constructor() {
    this.overrideStorageMethods();
    this.initializeValues();
    this.setupMutationObserver();
    this.isActive = true;
  }

  /**
   * Инициализация начальных значений
   */
  private initializeValues(): void {
    this.watchedKeys.forEach(key => {
      const value = sessionStorage.getItem(key);
      this.values.set(key, value);
      
      // Отправляем начальное значение
      if (value) {
        this.sendToBackground(key, null, value);
      }
    });
  }

  /**
   * Переопределяем методы sessionStorage для отслеживания изменений
   */
  private overrideStorageMethods(): void {
    const originalSetItem = sessionStorage.setItem;
    const originalRemoveItem = sessionStorage.removeItem;
    const originalClear = sessionStorage.clear;

    // Перехват setItem
    sessionStorage.setItem = (key: string, value: string): void => {
      const oldValue = sessionStorage.getItem(key);
      
      // Вызываем оригинальный метод
      originalSetItem.call(sessionStorage, key, value);
      
      // Если ключ в списке отслеживаемых - отправляем изменение
      if (this.watchedKeys.includes(key)) {
        this.values.set(key, value);
        this.sendToBackground(key, oldValue, value);
      }
    };

    // Перехват removeItem
    sessionStorage.removeItem = (key: string): void => {
      const oldValue = sessionStorage.getItem(key);
      
      // Вызываем оригинальный метод
      originalRemoveItem.call(sessionStorage, key);
      
      // Если ключ в списке отслеживаемых - отправляем изменение
      if (this.watchedKeys.includes(key)) {
        this.values.set(key, null);
        this.sendToBackground(key, oldValue, null);
      }
    };

    // Перехват clear
    sessionStorage.clear = (): void => {
      // Сохраняем старые значения для отслеживаемых ключей
      const oldValues = new Map<string, string | null>();
      this.watchedKeys.forEach(key => {
        oldValues.set(key, sessionStorage.getItem(key));
      });
      
      // Вызываем оригинальный метод
      originalClear.call(sessionStorage);
      
      // Отправляем изменения для всех отслеживаемых ключей
      this.watchedKeys.forEach(key => {
        this.values.set(key, null);
        this.sendToBackground(key, oldValues.get(key) || null, null);
      });
    };
  }

  /**
   * Настройка MutationObserver для случаев прямого доступа к sessionStorage
   */
  private setupMutationObserver(): void {
    // Создаем proxy для отслеживания прямого доступа через объект
    const sessionStorageProxy = new Proxy(sessionStorage, {
      set(target, prop, value) {
        const result = Reflect.set(target, prop, value);
        
        // Если это свойство (ключ), а не метод
        if (typeof prop === 'string' && !(prop in Storage.prototype)) {
          console.log('Direct sessionStorage access:', prop, value);
        }
        
        return result;
      },
      get(target, prop) {
        const value = Reflect.get(target, prop);
        
        // Если это свойство (ключ)
        if (typeof prop === 'string' && !(prop in Storage.prototype)) {
          console.log('Direct sessionStorage read:', prop, value);
        }
        
        return value;
      }
    });

    // Заменяем глобальный sessionStorage на proxy
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageProxy,
      writable: false,
      configurable: false
    });
  }

  /**
   * Отправка изменения в background script
   */
  private sendToBackground(key: string, oldValue: string | null, newValue: string | null): void {
    chrome.runtime.sendMessage({
      type: 'SESSION_STORAGE_CHANGE',
      payload: {
        key,
        oldValue,
        newValue,
        url: window.location.href,
        timestamp: Date.now(),
        allValues: Object.fromEntries(this.values)
      }
    });
  }

  /**
   * Получить текущее значение ключа
   */
  public getValue(key: string): string | null {
    return this.values.get(key) || null;
  }

  /**
   * Получить все значения
   */
  public getAllValues(): Record<string, string | null> {
    return Object.fromEntries(this.values);
  }

  /**
   * Добавить ключ для отслеживания
   */
  public watchKey(key: string): void {
    if (!this.watchedKeys.includes(key)) {
      this.watchedKeys.push(key);
      
      // Инициализируем значение
      const value = sessionStorage.getItem(key);
      this.values.set(key, value);
      
      if (value) {
        this.sendToBackground(key, null, value);
      }
    }
  }

  /**
   * Проверить активен ли watcher
   */
  public isWatching(): boolean {
    return this.isActive;
  }

  /**
   * Получить список отслеживаемых ключей
   */
  public getWatchedKeys(): string[] {
    return [...this.watchedKeys];
  }
}

// Инициализируем watcher только на страницах Тинькофф
if (window.location.hostname.includes('tinkoff.ru')) {
  console.log('🔍 SessionStorageWatcher: Initializing for Tinkoff page');
  
  // Создаем глобальный инстанс
  const sessionWatcher = new SessionStorageWatcher();
  
  // Экспортируем для доступа из других скриптов
  (window as any).EdickExtSessionWatcher = sessionWatcher;
  
  // Сообщаем о готовности
  chrome.runtime.sendMessage({ 
    type: 'SESSION_WATCHER_READY',
    payload: {
      watchedKeys: sessionWatcher.getWatchedKeys(),
      values: sessionWatcher.getAllValues()
    }
  });
  
  console.log('✅ SessionStorageWatcher: Ready and watching', sessionWatcher.getWatchedKeys());
}