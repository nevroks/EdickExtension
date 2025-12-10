import styles from '../NewsWidget.module.css';

interface NewsLoadingStateProps {
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
}

export const NewsLoadingState = ({
  isLoading,
  error,
  isEmpty,
}: NewsLoadingStateProps) => {
  if (isLoading) {
    return (
      <div className={styles.loading}>
        Загрузка новостей...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        Ошибка загрузки новостей:{' '}
        {error instanceof Error ? error.message : 'Неизвестная ошибка'}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={styles.empty}>
        Новости не найдены
      </div>
    );
  }

  return null;
};

