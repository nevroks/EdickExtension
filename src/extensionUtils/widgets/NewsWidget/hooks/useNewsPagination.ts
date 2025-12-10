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
}: UseNewsPaginationProps) => {
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const lastNewsCardRef = useRef<HTMLDivElement | null>(null);

  const loadMoreNews = useCallback(async () => {
    if (isLoadingMore || !hasNextPage) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const response = await newsApiRef.current.getNews(
        NEWS_LIMIT,
        currentOffset,
        formattedTicker,
        debouncedSearch || undefined
      );

      if (response?.data && response.data.length > 0) {
        const filteredData = filterNews(response.data, ticker, debouncedSearch);

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

  return {
    isLoadingMore,
    lastNewsCardRef,
  };
};

