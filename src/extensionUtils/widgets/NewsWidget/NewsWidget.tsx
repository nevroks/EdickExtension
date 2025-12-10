import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  NewsApi,
  type NewsItem,
} from '@/utils/api/newsApi/NewsApi';
import { useDebounce } from '@/utils/hooks/useDebounce';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { NewsCard } from './components/NewsCard';
import { SearchInput } from './components/SearchInput';
import styles from './NewsWidget.module.css';
import {
  filterNews,
  newsMatchesSearch,
  newsMatchesTicker,
} from './utils/newsFilters';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 10000,
    },
  },
});

const NEWS_LIMIT = 10;
const NEWS_OFFSET = 0;
const SEARCH_DEBOUNCE_DELAY = 300;
const MESSAGE_TARGET = 'EDICK_EXT_CONTENT_SCRIPT';

interface NewsWidgetProps {
  ticker?: string;
  group?: string;
  currency?: string;
}

const NewsWidgetContent = ({ ticker }: NewsWidgetProps) => {
  const newsApiRef = useRef<NewsApi>(new NewsApi());
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, SEARCH_DEBOUNCE_DELAY);
  const prevDebouncedSearchRef = useRef<string>('');
  const queryClient = useQueryClient();
  const [currentOffset, setCurrentOffset] = useState<number>(NEWS_OFFSET);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const lastNewsCardRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [newNewsCount, setNewNewsCount] = useState<number>(0);
  const [isScrolledDown, setIsScrolledDown] = useState<boolean>(false);

  // Форматируем тикер для API: добавляем $ в начало (например, SBER -> $SBER)
  const formattedTicker = useMemo(() =>
    ticker ? `$${ticker}` : undefined,
    [ticker]
  );

  // Начальная загрузка через API с фильтром по тикеру и поиску
  const { data, isLoading, error, isRefetching } = useQuery({
    queryKey: ['news', NEWS_LIMIT, NEWS_OFFSET, formattedTicker, debouncedSearch || undefined],
    queryFn: () => newsApiRef.current.getNews(
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
    setNewNewsCount(0);
    setIsScrolledDown(false);
  }, [ticker, debouncedSearch]);

  // При очистке поиска - актуализируем через API для получения всех пропущенных новостей
  useEffect(() => {
    // Если поиск был очищен (был непустой, стал пустым)
    if (prevDebouncedSearchRef.current && !debouncedSearch) {
      // Инвалидируем кеш и принудительно делаем запрос к API для получения всех новостей
      queryClient.invalidateQueries({
        queryKey: ['news', NEWS_LIMIT, NEWS_OFFSET, formattedTicker, undefined],
      });
    }
    prevDebouncedSearchRef.current = debouncedSearch;
  }, [debouncedSearch, formattedTicker, queryClient]);

  // Функция для добавления новости с проверкой на дубликаты
  const addNewsIfNotExists = useCallback((newsItem: NewsItem) => {
    setAllNews(prevNews => {
      const existingIds = new Set(prevNews.map(item => item.id));
      if (!existingIds.has(newsItem.id)) {
        // Если пользователь проскроллил вниз, увеличиваем счётчик новых новостей
        if (isScrolledDown) {
          setNewNewsCount(prev => prev + 1);
        }
        return [newsItem, ...prevNews];
      }
      return prevNews;
    });
  }, [isScrolledDown]);

  // Подписка на новости из WebSocket через window.postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Проверяем источник сообщения
      if (event.data?.source !== MESSAGE_TARGET) {
        return;
      }

      if (event.data.type === 'WS_NEWS_UPDATE') {
        const newsItem = event.data.news as NewsItem | undefined;
        if (newsItem) {
          // Фильтруем новости по тикеру и поисковому запросу
          const matchesTicker = !ticker || newsMatchesTicker(newsItem, ticker);
          const matchesSearch = newsMatchesSearch(newsItem, debouncedSearch);

          if (matchesTicker && matchesSearch) {
            addNewsIfNotExists(newsItem);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [ticker, debouncedSearch, addNewsIfNotExists]);

  // Обновление из API при загрузке данных
  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      // Фильтруем новости по тикеру и поиску (на случай, если API не фильтрует)
      const filteredData = filterNews(data.data, ticker, debouncedSearch);

      setAllNews(prevNews => {
        // Если у нас уже есть новости из WebSocket, не перезаписываем их
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

      // Обновляем состояние пагинации
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

  // Функция для загрузки следующих новостей
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

        // Обновляем состояние пагинации
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
  }, [isLoadingMore, hasNextPage, currentOffset, formattedTicker, debouncedSearch, ticker]);

  // Intersection Observer для отслеживания последней карточки
  useEffect(() => {
    if (!hasNextPage || isLoadingMore || isLoading || allNews.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
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
  }, [hasNextPage, isLoadingMore, isLoading, allNews.length, loadMoreNews]);

  // Отслеживание скролла для определения, проскроллен ли пользователь вниз
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const isDown = scrollTop > 100; // Порог в 100px для определения, что пользователь проскроллил вниз
      
      setIsScrolledDown(isDown);
      
      // Если пользователь вернулся вверх, сбрасываем счётчик новых новостей
      if (!isDown) {
        setNewNewsCount(0);
      }
    };

    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Обработчик клика по плашке новых новостей
  const handleNewNewsClick = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      setNewNewsCount(0);
    }
  }, []);

  // Обработчик клика по тикеру
  const handleTickerClick = useCallback((tickerValue: string) => {
    console.log('Ticker clicked:', tickerValue);
    // Можно добавить логику для открытия инструмента
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      {newNewsCount > 0 && isScrolledDown && (
        <div className={styles.newNewsBanner} onClick={handleNewNewsClick}>
          Новые новости (+{newNewsCount})
        </div>
      )}
      <div className={styles.header}>
        {ticker && (
          <h3 className={styles.title}>
            Новости по тикеру: {ticker}
          </h3>
        )}
        {isRefetching && (
          <span className={styles.refreshing}>
            Обновление...
          </span>
        )}
      </div>

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
      />

      {isLoading && (
        <div className={styles.loading}>
          Загрузка новостей...
        </div>
      )}

      {error && (
        <div className={styles.error}>
          Ошибка загрузки новостей: {error instanceof Error ? error.message : 'Неизвестная ошибка'}
        </div>
      )}

      {!isLoading && !error && allNews.length > 0 && (
        <div className={styles.newsList}>
          {allNews.map((item, index) => (
            <div
              key={item.id}
              ref={index === allNews.length - 1 ? lastNewsCardRef : null}
            >
              <NewsCard
                item={item}
                onTickerClick={handleTickerClick}
              />
            </div>
          ))}
          {isLoadingMore && (
            <div className={styles.loading}>
              Загрузка дополнительных новостей...
            </div>
          )}
        </div>
      )}

      {!isLoading && !error && allNews.length === 0 && (
        <div className={styles.empty}>
          Новости не найдены
        </div>
      )}
    </div>
  );
};

export const NewsWidget = ({ ticker, group, currency }: NewsWidgetProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <NewsWidgetContent ticker={ticker} group={group} currency={currency} />
    </QueryClientProvider>
  );
};
