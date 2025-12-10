import { useEffect } from 'react';
import type { NewsItem } from '@/utils/api/newsApi/NewsApi';
import { newsMatchesSearch, newsMatchesTicker } from '../utils/newsFilters';

const MESSAGE_TARGET = 'EDICK_EXT_CONTENT_SCRIPT';

interface UseNewsWebSocketProps {
  ticker?: string;
  debouncedSearch: string;
  addNewsIfNotExists: (newsItem: NewsItem, onNewNewsAdded?: () => void) => void;
  onNewNewsAdded?: () => void;
}

export const useNewsWebSocket = ({
  ticker,
  debouncedSearch,
  addNewsIfNotExists,
  onNewNewsAdded,
}: UseNewsWebSocketProps) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.source !== MESSAGE_TARGET) {
        return;
      }

      if (event.data.type === 'WS_NEWS_UPDATE') {
        const newsItem = event.data.news as NewsItem | undefined;
        if (newsItem) {
          const matchesTicker = !ticker || newsMatchesTicker(newsItem, ticker);
          const matchesSearch = newsMatchesSearch(newsItem, debouncedSearch);

          if (matchesTicker && matchesSearch) {
            addNewsIfNotExists(newsItem, onNewNewsAdded);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [ticker, debouncedSearch, addNewsIfNotExists, onNewNewsAdded]);
};

