import type { NewsItem } from '@/utils/api/newsApi/NewsApi';

import styles from '../NewsWidget.module.css';
import { NewsCard } from './NewsCard';

interface NewsListProps {
  news: NewsItem[];
  isLoadingMore: boolean;
  lastNewsCardRef: React.RefObject<HTMLDivElement | null>;
  onTickerClick?: (ticker: string) => void;
}

export const NewsList = ({
  news,
  isLoadingMore,
  lastNewsCardRef,
  onTickerClick,
}: NewsListProps) => {
  if (news.length === 0) {
    if (isLoadingMore) {
      return null;
    }
    return (
      <div className={styles.empty}>
        Пока нет новостей
      </div>
    );
  }

  return (
    <div className={styles.newsList}>
      {news.map((item, index) => (
        <div
          key={item.id}
          ref={index === news.length - 1 ? lastNewsCardRef : null}
        >
          <NewsCard item={item} onTickerClick={onTickerClick} />
        </div>
      ))}
      {isLoadingMore && (
        <div className={styles.loading}>
          Загрузка дополнительных новостей...
        </div>
      )}
    </div>
  );
};

