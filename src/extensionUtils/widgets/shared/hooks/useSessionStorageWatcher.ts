import { useState, useEffect, useMemo } from 'react';
import type { watchedKeys } from '../../../../content/session-storage-watcher-injector';

interface SessionStorageWatcher {
  getValue(key: watchedKeys): string | null;
  subscribe(callback: (change: { 
    key: string; 
    oldValue: string | null; 
    newValue: string | null; 
    type: string 
  }) => void): () => void;
}

interface UseSessionStorageWatcherResult<T = any> {
  parsedValue: T | null;
  unparsedValue: string | null;
}

export const useSessionStorageWatcher = <T = any>(key: watchedKeys): UseSessionStorageWatcherResult<T> => {
  const [unparsedValue, setUnparsedValue] = useState<string | null>(null);

  // Парсинг значения с указанным типом
  const parsedValue = useMemo((): T | null => {
    if (!unparsedValue) return null;

    try {
      return JSON.parse(unparsedValue) as T;
    } catch {
      // Если не JSON, возвращаем как есть с приведением типа
      return unparsedValue as unknown as T;
    }
  }, [unparsedValue]);

  // Форматирование для отображения
  

  // Подписка на изменения
  useEffect(() => {
    const watcher = (window as Window & { EdickExtSessionWatcher?: SessionStorageWatcher })
      .EdickExtSessionWatcher;

    let unsubscribe: (() => void) | undefined;

    if (watcher) {
      // Получаем начальное значение
      const initialValue = watcher.getValue(key);
      setUnparsedValue(initialValue);

      // Подписываемся на изменения
      unsubscribe = watcher.subscribe((change) => {
        if (change.key === key) {
          setUnparsedValue(change.newValue);
        }
      });
    } else {
      // Fallback
      const directValue = sessionStorage.getItem(key);
      setUnparsedValue(directValue);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [key]);

  return {
    parsedValue,
    unparsedValue,
  };
};