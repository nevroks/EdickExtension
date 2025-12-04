import { useEffect, useRef } from 'react';

export function useUpdateEffect(callback: () => void, dependencies: any[]) {
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    if (isFirstRender.current) {
      // Пропускаем первый рендер
      isFirstRender.current = false;
      return;
    }
    
    // Вызываем callback при изменении зависимостей
    return callback();
  }, dependencies);
}