import styles from '../NewsWidget.module.css';

interface NewNewsBannerProps {
  count: number;
  onClick: () => void;
}

export const NewNewsBanner = ({ count, onClick }: NewNewsBannerProps) => {
  if (count === 0) {
    return null;
  }

  return (
    <div className={styles.newNewsBanner} onClick={onClick}>
      Новые новости (+{count})
    </div>
  );
};

