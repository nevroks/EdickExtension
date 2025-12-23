import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NewsApi, type NewsItem } from '@/utils/api/newsApi/NewsApi';
import { useDebounce } from '@/utils/hooks/useDebounce';
import { filterNews, newsMatchesTicker } from '../utils/newsFilters';

const NEWS_LIMIT = 10;
const NEWS_OFFSET = 0;
const SEARCH_DEBOUNCE_DELAY = 300;

interface UseNewsStateProps {
  ticker?: string;
  newsApiRef: React.MutableRefObject<NewsApi>;
  tickerBindingEnabled?: boolean;
}

export const useNewsState = ({ ticker, newsApiRef, tickerBindingEnabled = false }: UseNewsStateProps) => {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [tickerFilteredNews, setTickerFilteredNews] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, SEARCH_DEBOUNCE_DELAY);
  const prevDebouncedSearchRef = useRef<string>('');
  const queryClient = useQueryClient();
  const [currentOffset, setCurrentOffset] = useState<number>(NEWS_OFFSET);
  const [tickerCurrentOffset, setTickerCurrentOffset] = useState<number>(NEWS_OFFSET);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [tickerHasNextPage, setTickerHasNextPage] = useState<boolean>(true);

  const formattedTicker = useMemo(
    () => (ticker ? `$${ticker}` : undefined),
    [ticker]
  );

  // Запрос для нефильтрованных новостей (используется когда tickerBindingEnabled включено)
  const { data: unfilteredData, isLoading: isLoadingUnfiltered, error: errorUnfiltered, isRefetching: isRefetchingUnfiltered } = useQuery({
    queryKey: ['news', NEWS_LIMIT, NEWS_OFFSET, undefined, debouncedSearch || undefined, 'unfiltered'],
    queryFn: () =>
      newsApiRef.current.getNews(
        NEWS_LIMIT,
        NEWS_OFFSET,
        undefined, // без тикера
        debouncedSearch || undefined
      ),
    refetchInterval: false,
    staleTime: Infinity,
    enabled: tickerBindingEnabled && !!ticker, // только когда включено и есть тикер
  });

  // Запрос для отфильтрованных по тикеру новостей
  const { data: tickerFilteredData, isLoading: isLoadingTickerFiltered, error: errorTickerFiltered, isRefetching: isRefetchingTickerFiltered } = useQuery({
    queryKey: ['news', NEWS_LIMIT, NEWS_OFFSET, formattedTicker, debouncedSearch || undefined, 'ticker-filtered'],
    queryFn: () =>
      newsApiRef.current.getNews(
        NEWS_LIMIT,
        NEWS_OFFSET,
        formattedTicker,
        debouncedSearch || undefined
      ),
    refetchInterval: false,
    staleTime: Infinity,
    enabled: tickerBindingEnabled && !!ticker, // только когда включено и есть тикер
  });

  // Обычный запрос (когда tickerBindingEnabled выключено)
  const { data, isLoading: isLoadingNormal, error: errorNormal, isRefetching: isRefetchingNormal } = useQuery({
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
    enabled: !tickerBindingEnabled || !ticker, // только когда выключено или нет тикера
  });

  // Очищаем новости при смене тикера или поиска
  useEffect(() => {
    setAllNews([]);
    setTickerFilteredNews([]);
    setCurrentOffset(NEWS_OFFSET);
    setTickerCurrentOffset(NEWS_OFFSET);
    setHasNextPage(true);
    setTickerHasNextPage(true);
  }, [ticker, debouncedSearch, tickerBindingEnabled]);

  // При очистке поиска - актуализируем через API для получения всех пропущенных новостей
  useEffect(() => {
    if (prevDebouncedSearchRef.current && !debouncedSearch) {
      if (tickerBindingEnabled && ticker) {
        queryClient.invalidateQueries({
          queryKey: ['news', NEWS_LIMIT, NEWS_OFFSET, undefined, undefined, 'unfiltered'],
        });
        queryClient.invalidateQueries({
          queryKey: ['news', NEWS_LIMIT, NEWS_OFFSET, formattedTicker, undefined, 'ticker-filtered'],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ['news', NEWS_LIMIT, NEWS_OFFSET, formattedTicker, undefined],
        });
      }
    }
    prevDebouncedSearchRef.current = debouncedSearch;
  }, [debouncedSearch, formattedTicker, queryClient, tickerBindingEnabled, ticker]);

  // Обновление из API при загрузке данных (обычный режим)
  useEffect(() => {
    if (!tickerBindingEnabled || !ticker) {
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
    }
  }, [data, ticker, debouncedSearch, tickerBindingEnabled]);

  // Обновление нефильтрованных новостей (режим tickerBindingEnabled)
  useEffect(() => {
    if (tickerBindingEnabled && ticker) {
      if (unfilteredData?.data && unfilteredData.data.length > 0) {
        // Фильтруем только по поиску, но исключаем новости с нужным тикером
        const filteredData = unfilteredData.data.filter(item => {
          const matchesSearch = !debouncedSearch || filterNews([item], undefined, debouncedSearch).length > 0;
          const hasTicker = newsMatchesTicker(item, ticker);
          return matchesSearch && !hasTicker; // исключаем новости с тикером
        });

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

        if (unfilteredData.nextPage !== null && unfilteredData.nextPage !== undefined) {
          setHasNextPage(true);
          setCurrentOffset(unfilteredData.nextPage);
        } else {
          setHasNextPage(false);
        }
      } else if (unfilteredData && unfilteredData.data.length === 0) {
        setHasNextPage(false);
      }
    }
  }, [unfilteredData, ticker, debouncedSearch, tickerBindingEnabled]);

  // Обновление отфильтрованных по тикеру новостей (режим tickerBindingEnabled)
  useEffect(() => {
    if (tickerBindingEnabled && ticker) {
      if (tickerFilteredData?.data && tickerFilteredData.data.length > 0) {
        const filteredData = filterNews(tickerFilteredData.data, ticker, debouncedSearch);

        setTickerFilteredNews(prevNews => {
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

        if (tickerFilteredData.nextPage !== null && tickerFilteredData.nextPage !== undefined) {
          setTickerHasNextPage(true);
          setTickerCurrentOffset(tickerFilteredData.nextPage);
        } else {
          setTickerHasNextPage(false);
        }
      } else if (tickerFilteredData && tickerFilteredData.data.length === 0) {
        setTickerHasNextPage(false);
      }
    }
  }, [tickerFilteredData, ticker, debouncedSearch, tickerBindingEnabled]);

  const addNewsIfNotExists = useCallback(
    (newsItem: NewsItem, onNewNewsAdded?: () => void) => {
      if (tickerBindingEnabled && ticker) {
        // В режиме tickerBindingEnabled добавляем в соответствующий список
        const hasTicker = newsMatchesTicker(newsItem, ticker);
        if (hasTicker) {
          setTickerFilteredNews(prevNews => {
            const existingIds = new Set(prevNews.map(item => item.id));
            if (!existingIds.has(newsItem.id)) {
              onNewNewsAdded?.();
              return [newsItem, ...prevNews];
            }
            return prevNews;
          });
        } else {
          setAllNews(prevNews => {
            const existingIds = new Set(prevNews.map(item => item.id));
            if (!existingIds.has(newsItem.id)) {
              onNewNewsAdded?.();
              return [newsItem, ...prevNews];
            }
            return prevNews;
          });
        }
      } else {
        setAllNews(prevNews => {
          const existingIds = new Set(prevNews.map(item => item.id));
          if (!existingIds.has(newsItem.id)) {
            onNewNewsAdded?.();
            return [newsItem, ...prevNews];
          }
          return prevNews;
        });
      }
    },
    [tickerBindingEnabled, ticker]
  );

  // Объединяем состояния загрузки и ошибок
  const isLoading = tickerBindingEnabled && ticker 
    ? isLoadingUnfiltered || isLoadingTickerFiltered 
    : isLoadingNormal;
  const error = tickerBindingEnabled && ticker 
    ? errorUnfiltered || errorTickerFiltered 
    : errorNormal;
  const isRefetching = tickerBindingEnabled && ticker 
    ? isRefetchingUnfiltered || isRefetchingTickerFiltered 
    : isRefetchingNormal;

  return {
    allNews,
    setAllNews,
    tickerFilteredNews,
    setTickerFilteredNews,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    isLoading,
    error,
    isRefetching,
    currentOffset,
    setCurrentOffset,
    tickerCurrentOffset,
    setTickerCurrentOffset,
    hasNextPage,
    setHasNextPage,
    tickerHasNextPage,
    setTickerHasNextPage,
    formattedTicker,
    addNewsIfNotExists,
  };
};

