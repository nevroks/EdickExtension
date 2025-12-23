import {
  useEffect,
  useRef,
  useState,
} from 'react';

import type { NewsItem } from '@/utils/api/newsApi/NewsApi';

import styles from '../NewsWidget.module.css';

interface NewsCardProps {
  item: NewsItem;
  onTickerClick?: (ticker: string) => void;
}

export const NewsCard = ({ item, onTickerClick }: NewsCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current && !needsExpansion) {
      const lineHeight = parseFloat(getComputedStyle(textRef.current).lineHeight);
      const maxHeight = lineHeight * 2;
      if (textRef.current.scrollHeight > maxHeight) {
        setNeedsExpansion(true);
      }
    }
  }, [item.text, needsExpansion]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.newsCard}>
      {item.source && (
        <div className={styles.newsCardHead}>
          <div className={styles.source}>
            {item.source}
          </div>
          {item.tikers && item.tikers.length > 0 && (
            <div className={styles.tickersContainer}>
              {item.tikers.map((ticker, index) => (
                <span
                  key={`${ticker}-${index}`}
                  onClick={() => onTickerClick?.(ticker.replace('$', ''))}
                  className={styles.ticker}
                >
                  #{ticker.replace('$', '')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.textContainer}>
        <p
          ref={textRef}
          className={`${styles.text} ${!isExpanded && needsExpansion ? styles.textCollapsed : ''}`}
        >
          {item.text}
        </p>
        {needsExpansion && (
          <button
            onClick={toggleExpanded}
            className={styles.expandButton}
          >
            {isExpanded ? 'закрыть ↑' : 'открыть полностью ↓'}
          </button>
        )}
      </div>

      
    </div>
  );
};

