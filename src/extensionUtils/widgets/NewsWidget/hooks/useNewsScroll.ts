import { useCallback, useEffect, useRef, useState } from 'react';

interface UseNewsScrollProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  ticker?: string;
  debouncedSearch: string;
}

export const useNewsScroll = ({
  containerRef,
  ticker,
  debouncedSearch,
}: UseNewsScrollProps) => {
  const [isScrolledDown, setIsScrolledDown] = useState<boolean>(false);
  const [newNewsCount, setNewNewsCount] = useState<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const isDown = scrollTop > 100;

      setIsScrolledDown(isDown);

      if (!isDown) {
        setNewNewsCount(0);
      }
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef]);

  // Сбрасываем счетчик новых новостей при смене тикера или поиска
  useEffect(() => {
    setNewNewsCount(0);
    setIsScrolledDown(false);
  }, [ticker, debouncedSearch]);

  const handleNewNewsClick = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      setNewNewsCount(0);
    }
  }, [containerRef]);

  const incrementNewNewsCount = useCallback(() => {
    if (isScrolledDown) {
      setNewNewsCount(prev => prev + 1);
    }
  }, [isScrolledDown]);

  return {
    isScrolledDown,
    newNewsCount,
    handleNewNewsClick,
    incrementNewNewsCount,
  };
};

