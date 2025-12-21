import {
  useCallback,
  useRef,
  useState,
} from 'react';

import { findReactFiber } from '@/extensionUtils/helpers';
import { NewsApi } from '@/utils/api/newsApi/NewsApi';
import { useLocalStorage } from '@/utils/hooks/useLocalStorage';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';

import { ActionButtons } from '../shared/ActionButtons/ActionButtons';
import { NewNewsBanner } from './components/NewNewsBanner';
import { NewsHeader } from './components/NewsHeader';
import { NewsList } from './components/NewsList';
import { NewsLoadingState } from './components/NewsLoadingState';
import { NewsSettingsModal } from './components/NewsSettingsModal';
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
  terminalWidgetId?: string;
}

const NewsWidgetContent = ({ ticker, terminalWidgetId }: NewsWidgetProps) => {
  const newsApiRef = useRef<NewsApi>(new NewsApi());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [tickerBindingEnabled, setTickerBindingEnabled] = useLocalStorage('news-ticker-binding-enabled', false);

  const {
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
  } = useNewsState({ ticker, newsApiRef, tickerBindingEnabled });

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

  const { isLoadingMore, lastNewsCardRef, isLoadingMoreTicker, lastTickerNewsCardRef } = useNewsPagination({
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
    tickerBindingEnabled,
    tickerCurrentOffset,
    setTickerCurrentOffset,
    tickerHasNextPage,
    setTickerHasNextPage,
    setTickerFilteredNews,
  });

  const handleTickerClick = useCallback((tickerValue: string) => {
    if (!terminalWidgetId) {
      console.warn('widgetId не найден, невозможно изменить тикер');
      return;
    }

    try {
      const widgetElement = document.querySelector(`[data-widget-id="${terminalWidgetId}"]`);
      if (widgetElement) {
        const reactFiber = findReactFiber(widgetElement as HTMLElement);
        const memoizedProps = reactFiber?.return?.return?.memoizedProps;
        if (memoizedProps && memoizedProps.selectSymbol) {
          memoizedProps.selectSymbol(tickerValue);
        } else {
          console.warn('Не удалось найти selectSymbol в React Fiber');
        }
      } else {
        console.warn(`Не удалось найти элемент виджета с data-widget-id="${terminalWidgetId}"`);
      }
    } catch (err) {
      console.error('Ошибка при изменении тикера:', err);
    }
  }, [terminalWidgetId]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['news'],
    });
  }, [queryClient]);

  const handleSettingsClick = useCallback(() => {
    setIsSettingsModalOpen(true);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, []);

  const handleTickerBindingChange = useCallback((enabled: boolean) => {
    setTickerBindingEnabled(enabled);
  }, [setTickerBindingEnabled]);

  return (
    <div 
      className={`${styles.container} ${tickerBindingEnabled && ticker ? styles.containerNoScroll : ''}`} 
      ref={containerRef}
    >
      {newNewsCount > 0 && isScrolledDown && (
        <NewNewsBanner
          count={newNewsCount}
          onClick={handleNewNewsClick}
        />
      )}

      <div className={styles.headerContainer}>
        {!tickerBindingEnabled && <NewsHeader ticker={ticker} isRefetching={isRefetching} />}
        <ActionButtons
          onRefresh={handleRefresh}
          onSettings={handleSettingsClick}
          isRefreshing={isRefetching}
        />
      </div>

      <SearchInput value={searchQuery} onChange={setSearchQuery} />

      {tickerBindingEnabled && ticker ? (
        <>
          <NewsLoadingState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && !error && allNews.length === 0 && tickerFilteredNews.length === 0}
          />

          <div className={styles.newsSectionsContainer}>
            <div className={styles.unfilteredNewsSection}>
              {!isLoading && !error && (
                <NewsList
                  news={allNews}
                  isLoadingMore={isLoadingMore}
                  lastNewsCardRef={lastNewsCardRef}
                  onTickerClick={handleTickerClick}
                />
              )}
            </div>

            {ticker && (
              <div className={styles.tickerFilteredNewsSection}>
                <div className={styles.tickerNewsHeader}>
                  Новости по тикеру: {ticker}
                </div>
                <div className={styles.tickerFilteredNewsList}>
                  {!isLoading && !error && (
                    <NewsList
                      news={tickerFilteredNews}
                      isLoadingMore={isLoadingMoreTicker}
                      lastNewsCardRef={lastTickerNewsCardRef}
                      onTickerClick={handleTickerClick}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
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
        </>
      )}

      <NewsSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleSettingsClose}
        tickerBindingEnabled={tickerBindingEnabled}
        onTickerBindingChange={handleTickerBindingChange}
      />
    </div>
  );
};

export const NewsWidget = ({ ticker, group, currency, terminalWidgetId }: NewsWidgetProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <NewsWidgetContent ticker={ticker} group={group} currency={currency} terminalWidgetId={terminalWidgetId} />
    </QueryClientProvider>
  );
};
