import styles from '../NewsWidget.module.css';

interface NewsHeaderProps {
  ticker?: string;
  isRefetching: boolean;
}

export const NewsHeader = ({ ticker, isRefetching }: NewsHeaderProps) => {
  return (
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
  );
};

