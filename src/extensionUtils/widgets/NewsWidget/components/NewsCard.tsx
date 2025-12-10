import type { NewsItem } from '@/utils/api/newsApi/NewsApi';

import styles from '../NewsWidget.module.css';

interface NewsCardProps {
  item: NewsItem;
  onTickerClick?: (ticker: string) => void;
}

export const NewsCard = ({ item, onTickerClick }: NewsCardProps) => {
  return (
    <div className={styles.newsCard}>
      {item.source && (
        <div className={styles.source}>
          {item.source}
        </div>
      )}

      <p className={styles.text}>
        {item.text}
      </p>

      {item.tikers && item.tikers.length > 0 && (
        <div className={styles.tickersContainer}>
          {item.tikers.map((ticker, index) => (
            <span
              key={`${ticker}-${index}`}
              onClick={() => onTickerClick?.(ticker)}
              className={styles.ticker}
            >
              #{ticker}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

