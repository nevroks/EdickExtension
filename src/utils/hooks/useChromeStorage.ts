import { useState, useEffect } from 'react';
import type { CHROME_STORAGE_KEYS } from '../consts/appConsts';

export function useChromeStorage<T>(key: keyof typeof CHROME_STORAGE_KEYS, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const result = await chrome.storage.local.get([key]);
        if (result[key] !== undefined) {
          setValue(result[key]);
        }
      } catch (error) {
        console.error('Error loading from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();

    // слушаем изменения из других компонентов
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, namespace: string) => {
      if (namespace === 'local' && changes[key]) {
        console.log(`Storage changed for key ${key}:`, changes[key].newValue);
        setValue(changes[key].newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [key]);

  const setStoredValue = async (newValue: T) => {
    try {
      setValue(newValue); // Сначала обновляем локальное состояние
      await chrome.storage.local.set({ [key]: newValue }); // Потом сохраняем
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  return [value, setStoredValue, isLoading] as const;
}