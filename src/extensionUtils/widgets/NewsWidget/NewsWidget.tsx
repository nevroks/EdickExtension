import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  NewsApi,
  type NewsItem,
} from '@/utils/api/newsApi/NewsApi';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import styles from './NewsWidget.module.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 10000,
    },
  },
});

interface NewsWidgetProps {
  ticker?: string;
  group?: string;
  currency?: string;
}

const NewsWidgetContent = ({ ticker }: NewsWidgetProps) => {
  const newsApiRef = useRef<NewsApi | null>(null);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevDebouncedSearchRef = useRef<string>('');
  const queryClient = useQueryClient();

  if (!newsApiRef.current) {
    newsApiRef.current = new NewsApi();
  }

  // Форматируем тикер для API: добавляем $ в начало (например, SBER -> $SBER)
  const formattedTicker = ticker ? `$${ticker}` : undefined;

  // Дебаунс для поискового запроса
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300); // 300ms дебаунс

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Функция для проверки, содержит ли новость нужный тикер
  const newsMatchesTicker = (newsItem: NewsItem, targetTicker: string): boolean => {
    if (!targetTicker) return true; // Если тикер не выбран, показываем все новости
    // Проверяем, есть ли тикер в массиве tikers (без учета регистра)
    return newsItem.tikers?.some(t => 
      t.toLowerCase() === targetTicker.toLowerCase() || 
      t.toLowerCase() === `$${targetTicker.toLowerCase()}`
    ) ?? false;
  };

  // Функция для проверки, соответствует ли новость поисковому запросу
  const newsMatchesSearch = (newsItem: NewsItem, search: string): boolean => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
      newsItem.text?.toLowerCase().includes(searchLower) ||
      newsItem.source?.toLowerCase().includes(searchLower) ||
      newsItem.tikers?.some(t => t.toLowerCase().includes(searchLower)) ||
      false
    );
  };

  // Начальная загрузка через API с фильтром по тикеру и поиску
  const { data, isLoading, error, isRefetching } = useQuery({
    queryKey: ['news', 5, 0, formattedTicker, debouncedSearch || undefined],
    queryFn: () => newsApiRef.current!.getNews(5, 0, formattedTicker, debouncedSearch || undefined),
    refetchInterval: false,
    staleTime: Infinity,
  });

  // Очищаем новости при смене тикера или поиска
  useEffect(() => {
    setAllNews([]);
  }, [ticker, debouncedSearch]);

  // При очистке поиска - актуализируем через API для получения всех пропущенных новостей
  useEffect(() => {
    // Если поиск был очищен (был непустой, стал пустым)
    if (prevDebouncedSearchRef.current && !debouncedSearch) {
      // Инвалидируем кеш и принудительно делаем запрос к API для получения всех новостей
      queryClient.invalidateQueries({
        queryKey: ['news', 5, 0, formattedTicker, undefined],
      });
    }
    prevDebouncedSearchRef.current = debouncedSearch;
  }, [debouncedSearch, formattedTicker, queryClient]);

  // Подписка на новости из WebSocket через window.postMessage
  useEffect(() => {
    const MESSAGE_TARGET = 'EDICK_EXT_CONTENT_SCRIPT';

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
            setAllNews(prevNews => {
              // Проверяем, нет ли уже такой новости
              const existingIds = new Set(prevNews.map(item => item.id));
              if (!existingIds.has(newsItem.id)) {
                return [newsItem, ...prevNews];
              }
              return prevNews;
            });
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [ticker, debouncedSearch]);

  // Обновление из API при загрузке данных
  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      // Фильтруем новости по тикеру и поиску (на случай, если API не фильтрует)
      let filteredData = data.data;
      
      if (ticker) {
        filteredData = filteredData.filter(item => newsMatchesTicker(item, ticker));
      }
      
      if (debouncedSearch) {
        filteredData = filteredData.filter(item => newsMatchesSearch(item, debouncedSearch));
      }

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
    }
  }, [data, ticker, debouncedSearch]);


  return (
    <div className={styles.container}>
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

      {/* Поисковый инпут */}
      <div className={styles.searchContainer}>
        <div className={styles.searchIcon}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M7.04762 12.0952C4.2599 12.0952 2 9.83534 2 7.04762C2 4.2599 4.2599 2 7.04762 2C9.83534 2 12.0952 4.2599 12.0952 7.04762C12.0952 8.09727 11.7748 9.07209 11.2265 9.87962L13.7211 12.3741C14.093 12.7461 14.093 13.3491 13.7211 13.721C13.3491 14.0929 12.7461 14.0929 12.3742 13.721L9.87966 11.2265C9.07212 11.7748 8.09729 12.0952 7.04762 12.0952ZM7.04759 10.4129C8.90607 10.4129 10.4127 8.90627 10.4127 7.04779C10.4127 5.1893 8.90607 3.68271 7.04759 3.68271C5.1891 3.68271 3.68251 5.1893 3.68251 7.04779C3.68251 8.90627 5.1891 10.4129 7.04759 10.4129Z" fill="rgb(var(--pro-icon-color))"></path>
          </svg>
        </div>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Поиск"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

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
          {allNews.map((item: NewsItem) => (
            <div
              key={item.id}
              className={styles.newsCard}
            >
              {/* Источник */}
              {item.source && (
                <div className={styles.source}>
                  {item.source}
                </div>
              )}

              {/* Текст новости */}
              <p className={styles.text}>
                {item.text}
              </p>

              {/* Тикеры в виде хештегов справа внизу */}
              {item.tikers && item.tikers.length > 0 && (
                <div className={styles.tickersContainer}>
                  {item.tikers.map((ticker, index) => (
                    <span
                      key={index}
                      onClick={() => {
                        // Обработка клика по тикеру
                        console.log('Ticker clicked:', ticker);
                        // Можно добавить логику для открытия инструмента
                      }}
                      className={styles.ticker}
                    >
                      #{ticker}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
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

