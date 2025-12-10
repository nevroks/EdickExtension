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

  if (!newsApiRef.current) {
    newsApiRef.current = new NewsApi();
  }

  // Форматируем тикер для API: добавляем $ в начало (например, SBER -> $SBER)
  const formattedTicker = ticker ? `$${ticker}` : undefined;

  // Функция для проверки, содержит ли новость нужный тикер
  const newsMatchesTicker = (newsItem: NewsItem, targetTicker: string): boolean => {
    if (!targetTicker) return true; // Если тикер не выбран, показываем все новости
    // Проверяем, есть ли тикер в массиве tikers (без учета регистра)
    return newsItem.tikers?.some(t => 
      t.toLowerCase() === targetTicker.toLowerCase() || 
      t.toLowerCase() === `$${targetTicker.toLowerCase()}`
    ) ?? false;
  };

  // Начальная загрузка через API с фильтром по тикеру
  const { data, isLoading, error, isRefetching } = useQuery({
    queryKey: ['news', 5, 0, formattedTicker],
    queryFn: () => newsApiRef.current!.getNews(5, 0, formattedTicker),
    refetchInterval: false,
    staleTime: Infinity,
  });

  // Очищаем новости при смене тикера
  useEffect(() => {
    setAllNews([]);
  }, [ticker]);

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
          // Фильтруем новости по тикеру, если он выбран
          if (!ticker || newsMatchesTicker(newsItem, ticker)) {
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
  }, [ticker]);

  // Обновление из API при загрузке данных
  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      // Фильтруем новости по тикеру, если он выбран (на случай, если API не фильтрует)
      const filteredData = ticker 
        ? data.data.filter(item => newsMatchesTicker(item, ticker))
        : data.data;

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
  }, [data, ticker]);


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

