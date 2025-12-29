import { useEffect, useMemo, useState } from 'react';

interface SessionStorageWatcher {
  getValue(key: string): string | null;
  subscribe(callback: (change: { key: string; oldValue: string | null; newValue: string | null; type: string }) => void): () => void;
}

const ApplicationWidgetLimitedTab = () => {
  const [nonSharedValue, setNonSharedValue] = useState<string | null>(null);

  useEffect(() => {
    const watcher = (window as Window & { EdickExtSessionWatcher?: SessionStorageWatcher }).EdickExtSessionWatcher;

    if (!watcher) {
      const value = sessionStorage.getItem('nonShared');
      setNonSharedValue(value);
      return;
    }

    const initialValue = watcher.getValue('nonShared');
    setNonSharedValue(initialValue);

    const unsubscribe = watcher.subscribe((change) => {
      if (change.key === 'nonShared') {
        setNonSharedValue(change.newValue);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const displayValue = useMemo(() => {
    if (!nonSharedValue) return null;

    try {
      const parsed = JSON.parse(nonSharedValue);
      return typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : String(parsed);
    } catch {
      return nonSharedValue;
    }
  }, [nonSharedValue]);

  if (!nonSharedValue || nonSharedValue === '') {
    return (
      <div>
        <h3>NonShared данные</h3>
        <p>Нет данных</p>
      </div>
    );
  }

  return (
    <div>
      <h3>NonShared данные</h3>
      <pre>
        {displayValue}
      </pre>
    </div>
  );
};

export default ApplicationWidgetLimitedTab;
