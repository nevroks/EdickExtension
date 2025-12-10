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

const NewsWidgetContent = () => {
  const newsApiRef = useRef<NewsApi | null>(null);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);

  if (!newsApiRef.current) {
    newsApiRef.current = new NewsApi();
  }

  // Начальная загрузка через API (только один раз)
  const { data, isLoading, error, isRefetching } = useQuery({
    queryKey: ['news', 5, 0],
    queryFn: () => newsApiRef.current!.getNews(5, 0),
    refetchInterval: false,
    staleTime: Infinity,
  });

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
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Обновление из API при первой загрузке
  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      setAllNews(prevNews => {
        // Если у нас уже есть новости из WebSocket, не перезаписываем их
        if (prevNews.length > 0) {
          const existingIds = new Set(prevNews.map(item => item.id));
          const newItems = data.data.filter(item => !existingIds.has(item.id));

          if (newItems.length > 0) {
            return [...newItems, ...prevNews];
          }
          return prevNews;
        }

        return data.data;
      });
    }
  }, [data]);


  return (
    <div className={styles.container}>
      <div className={styles.header}>
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

export const NewsWidget = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NewsWidgetContent />
    </QueryClientProvider>
  );
};

