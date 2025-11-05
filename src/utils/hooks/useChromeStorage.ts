import { useState, useEffect } from 'react';

export function useChromeStorage<T>(key: string, initialValue: T) {
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
  }, [key]);

  const setStoredValue = async (newValue: T) => {
    try {
      setValue(newValue);
      await chrome.storage.local.set({ [key]: newValue });
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  return [value, setStoredValue, isLoading] as const;
}