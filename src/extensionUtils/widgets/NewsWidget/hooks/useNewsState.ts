import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NewsApi, type NewsItem } from '@/utils/api/newsApi/NewsApi';
import { useDebounce } from '@/utils/hooks/useDebounce';
import { filterNews } from '../utils/newsFilters';

const NEWS_LIMIT = 10;
const NEWS_OFFSET = 0;
const SEARCH_DEBOUNCE_DELAY = 300;

interface UseNewsStateProps {
  ticker?: string;
  newsApiRef: React.MutableRefObject<NewsApi>;
}

export const useNewsState = ({ ticker, newsApiRef }: UseNewsStateProps) => {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, SEARCH_DEBOUNCE_DELAY);
  const prevDebouncedSearchRef = useRef<string>('');
  const queryClient = useQueryClient();
  const [currentOffset, setCurrentOffset] = useState<number>(NEWS_OFFSET);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  const formattedTicker = useMemo(
    () => (ticker ? `$${ticker}` : undefined),
    [ticker]
  );

  const { data, isLoading, error, isRefetching } = useQuery({
    queryKey: ['news', NEWS_LIMIT, NEWS_OFFSET, formattedTicker, debouncedSearch || undefined],
    queryFn: () =>
      newsApiRef.current.getNews(
        NEWS_LIMIT,
        NEWS_OFFSET,
        formattedTicker,
        debouncedSearch || undefined
      ),
    refetchInterval: false,
    staleTime: Infinity,
  });

  // Очищаем новости при смене тикера или поиска
  useEffect(() => {
    setAllNews([]);
    setCurrentOffset(NEWS_OFFSET);
    setHasNextPage(true);
  }, [ticker, debouncedSearch]);

  // При очистке поиска - актуализируем через API для получения всех пропущенных новостей
  useEffect(() => {
    if (prevDebouncedSearchRef.current && !debouncedSearch) {
      queryClient.invalidateQueries({
        queryKey: ['news', NEWS_LIMIT, NEWS_OFFSET, formattedTicker, undefined],
      });
    }
    prevDebouncedSearchRef.current = debouncedSearch;
  }, [debouncedSearch, formattedTicker, queryClient]);

  // Обновление из API при загрузке данных
  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      const filteredData = filterNews(data.data, ticker, debouncedSearch);

      setAllNews(prevNews => {
        if (prevNews.length > 0) {
          const existingIds = new Set(prevNews.map(item => item.id));
          const newItems = filteredData.filter(item => !existingIds.has(item.id));

          if (newItems.length > 0) {
            return [...newItems, ...prevNews];
          }
          return prevNews;
        }

        return filteredData;
      });

      if (data.nextPage !== null && data.nextPage !== undefined) {
        setHasNextPage(true);
        setCurrentOffset(data.nextPage);
      } else {
        setHasNextPage(false);
      }
    } else if (data && data.data.length === 0) {
      setHasNextPage(false);
    }
  }, [data, ticker, debouncedSearch]);

  const addNewsIfNotExists = useCallback(
    (newsItem: NewsItem, onNewNewsAdded?: () => void) => {
      setAllNews(prevNews => {
        const existingIds = new Set(prevNews.map(item => item.id));
        if (!existingIds.has(newsItem.id)) {
          onNewNewsAdded?.();
          return [newsItem, ...prevNews];
        }
        return prevNews;
      });
    },
    []
  );

  return {
    allNews,
    setAllNews,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    isLoading,
    error,
    isRefetching,
    currentOffset,
    setCurrentOffset,
    hasNextPage,
    setHasNextPage,
    formattedTicker,
    addNewsIfNotExists,
  };
};

