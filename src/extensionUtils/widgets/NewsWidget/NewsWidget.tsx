import {
  useCallback,
  useRef,
} from 'react';

import { NewsApi } from '@/utils/api/newsApi/NewsApi';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { NewNewsBanner } from './components/NewNewsBanner';
import { NewsHeader } from './components/NewsHeader';
import { NewsList } from './components/NewsList';
import { NewsLoadingState } from './components/NewsLoadingState';
import { SearchInput } from './components/SearchInput';
import { useNewsPagination } from './hooks/useNewsPagination';
import { useNewsScroll } from './hooks/useNewsScroll';
import { useNewsState } from './hooks/useNewsState';
import { useNewsWebSocket } from './hooks/useNewsWebSocket';
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
  const newsApiRef = useRef<NewsApi>(new NewsApi());
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
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
  } = useNewsState({ ticker, newsApiRef });

  const {
    isScrolledDown,
    newNewsCount,
    handleNewNewsClick,
    incrementNewNewsCount,
  } = useNewsScroll({ containerRef, ticker, debouncedSearch });

  useNewsWebSocket({
    ticker,
    debouncedSearch,
    addNewsIfNotExists,
    onNewNewsAdded: incrementNewNewsCount,
  });

  const { isLoadingMore, lastNewsCardRef } = useNewsPagination({
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
  });

  const handleTickerClick = useCallback((tickerValue: string) => {
    console.log('Ticker clicked:', tickerValue);
    // Можно добавить логику для открытия инструмента
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      {newNewsCount > 0 && isScrolledDown && (
        <NewNewsBanner
          count={newNewsCount}
          onClick={handleNewNewsClick}
        />
      )}

      <NewsHeader ticker={ticker} isRefetching={isRefetching} />

      <SearchInput value={searchQuery} onChange={setSearchQuery} />

      <NewsLoadingState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && allNews.length === 0}
      />

      {!isLoading && !error && allNews.length > 0 && (
        <NewsList
          news={allNews}
          isLoadingMore={isLoadingMore}
          lastNewsCardRef={lastNewsCardRef}
          onTickerClick={handleTickerClick}
        />
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
