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

  const { data, isLoading, error, isRefetching } = useQuery({
    queryKey: ['news', 5, 0],
    queryFn: () => newsApiRef.current!.getNews(5, 0),
    refetchInterval: 30000, // Обновление каждые 30 секунд
    staleTime: 10000, // Данные считаются свежими 10 секунд
  });



  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      setAllNews(prevNews => {
        const existingIds = new Set(prevNews.map(item => item.id));
        const newItems = data.data.filter(item => !existingIds.has(item.id));

        if (newItems.length > 0) {
          return [...newItems, ...prevNews];
        }

        if (prevNews.length === 0) {
          return data.data;
        }

        return prevNews;
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

