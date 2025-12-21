import { useCallback, useEffect, useRef, useState } from 'react';
import { NewsApi, type NewsItem } from '@/utils/api/newsApi/NewsApi';
import { filterNews } from '../utils/newsFilters';

const NEWS_LIMIT = 10;

interface UseNewsPaginationProps {
  newsApiRef: React.MutableRefObject<NewsApi>;
  ticker?: string;
  debouncedSearch: string;
  formattedTicker?: string;
  currentOffset: number;
  setCurrentOffset: (offset: number) => void;
  hasNextPage: boolean;
  setHasNextPage: (hasNext: boolean) => void;
  setAllNews: React.Dispatch<React.SetStateAction<NewsItem[]>>;
  isLoading: boolean;
  tickerBindingEnabled?: boolean;
  tickerCurrentOffset?: number;
  setTickerCurrentOffset?: (offset: number) => void;
  tickerHasNextPage?: boolean;
  setTickerHasNextPage?: (hasNext: boolean) => void;
  setTickerFilteredNews?: React.Dispatch<React.SetStateAction<NewsItem[]>>;
}

export const useNewsPagination = ({
  newsApiRef,
  ticker,
  debouncedSearch,
  formattedTicker,
  currentOffset,
  setCurrentOffset,
  hasNextPage,
  setHasNextPage,
  setAllNews,
  isLoading,
  tickerBindingEnabled = false,
  tickerCurrentOffset,
  setTickerCurrentOffset,
  tickerHasNextPage,
  setTickerHasNextPage,
  setTickerFilteredNews,
}: UseNewsPaginationProps) => {
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isLoadingMoreTicker, setIsLoadingMoreTicker] = useState<boolean>(false);
  const lastNewsCardRef = useRef<HTMLDivElement | null>(null);
  const lastTickerNewsCardRef = useRef<HTMLDivElement | null>(null);

  const loadMoreNews = useCallback(async () => {
    if (isLoadingMore || !hasNextPage) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const response = await newsApiRef.current.getNews(
        NEWS_LIMIT,
        currentOffset,
        tickerBindingEnabled && ticker ? undefined : formattedTicker, // без тикера в режиме tickerBindingEnabled
        debouncedSearch || undefined
      );

      if (response?.data && response.data.length > 0) {
        let filteredData;
        if (tickerBindingEnabled && ticker) {
          // Исключаем новости с тикером
          filteredData = response.data.filter(item => {
            const matchesSearch = !debouncedSearch || filterNews([item], undefined, debouncedSearch).length > 0;
            const hasTicker = item.tikers?.some(t => 
              t.toLowerCase() === ticker.toLowerCase() || 
              t.toLowerCase() === `$${ticker.toLowerCase()}`
            ) ?? false;
            return matchesSearch && !hasTicker;
          });
        } else {
          filteredData = filterNews(response.data, ticker, debouncedSearch);
        }

        setAllNews(prevNews => {
          const existingIds = new Set(prevNews.map(item => item.id));
          const newItems = filteredData.filter(item => !existingIds.has(item.id));

          if (newItems.length > 0) {
            return [...prevNews, ...newItems];
          }
          return prevNews;
        });

        if (response.nextPage !== null && response.nextPage !== undefined) {
          setHasNextPage(true);
          setCurrentOffset(response.nextPage);
        } else {
          setHasNextPage(false);
        }
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error('Ошибка загрузки дополнительных новостей:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    hasNextPage,
    currentOffset,
    formattedTicker,
    debouncedSearch,
    ticker,
    newsApiRef,
    setAllNews,
    setHasNextPage,
    setCurrentOffset,
    tickerBindingEnabled,
  ]);

  const loadMoreTickerNews = useCallback(async () => {
    if (!tickerBindingEnabled || !ticker || !setTickerCurrentOffset || !setTickerHasNextPage || !setTickerFilteredNews) {
      return;
    }

    if (isLoadingMoreTicker || !tickerHasNextPage || !tickerCurrentOffset) {
      return;
    }

    setIsLoadingMoreTicker(true);
    try {
      const response = await newsApiRef.current.getNews(
        NEWS_LIMIT,
        tickerCurrentOffset,
        formattedTicker,
        debouncedSearch || undefined
      );

      if (response?.data && response.data.length > 0) {
        const filteredData = filterNews(response.data, ticker, debouncedSearch);

        setTickerFilteredNews(prevNews => {
          const existingIds = new Set(prevNews.map(item => item.id));
          const newItems = filteredData.filter(item => !existingIds.has(item.id));

          if (newItems.length > 0) {
            return [...prevNews, ...newItems];
          }
          return prevNews;
        });

        if (response.nextPage !== null && response.nextPage !== undefined) {
          setTickerHasNextPage(true);
          setTickerCurrentOffset(response.nextPage);
        } else {
          setTickerHasNextPage(false);
        }
      } else {
        setTickerHasNextPage(false);
      }
    } catch (error) {
      console.error('Ошибка загрузки дополнительных новостей по тикеру:', error);
    } finally {
      setIsLoadingMoreTicker(false);
    }
  }, [
    isLoadingMoreTicker,
    tickerHasNextPage,
    tickerCurrentOffset,
    formattedTicker,
    debouncedSearch,
    ticker,
    newsApiRef,
    setTickerFilteredNews,
    setTickerHasNextPage,
    setTickerCurrentOffset,
    tickerBindingEnabled,
  ]);

  useEffect(() => {
    if (!hasNextPage || isLoadingMore || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const lastEntry = entries[0];
        if (lastEntry.isIntersecting && hasNextPage && !isLoadingMore && !isLoading) {
          loadMoreNews();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    const currentLastCard = lastNewsCardRef.current;
    if (currentLastCard) {
      observer.observe(currentLastCard);
    }

    return () => {
      if (currentLastCard) {
        observer.unobserve(currentLastCard);
      }
    };
  }, [hasNextPage, isLoadingMore, isLoading, loadMoreNews]);

  useEffect(() => {
    if (!tickerBindingEnabled || !ticker || !tickerHasNextPage || !tickerCurrentOffset || isLoadingMoreTicker || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const lastEntry = entries[0];
        if (lastEntry.isIntersecting && tickerHasNextPage && !isLoadingMoreTicker && !isLoading) {
          loadMoreTickerNews();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    const currentLastCard = lastTickerNewsCardRef.current;
    if (currentLastCard) {
      observer.observe(currentLastCard);
    }

    return () => {
      if (currentLastCard) {
        observer.unobserve(currentLastCard);
      }
    };
  }, [tickerHasNextPage, isLoadingMoreTicker, isLoading, loadMoreTickerNews, tickerBindingEnabled, ticker, tickerCurrentOffset]);

  return {
    isLoadingMore,
    lastNewsCardRef,
    isLoadingMoreTicker,
    lastTickerNewsCardRef,
  };
};

