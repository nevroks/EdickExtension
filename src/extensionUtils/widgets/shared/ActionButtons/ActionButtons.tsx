import {
  RefreshIcon,
  SettingsIcon,
} from '../icons';
import iconStyles from '../icons/Icons.module.css';
import styles from './ActionButtons.module.css';

interface ActionButtonsProps {
  onRefresh?: () => void;
  onSettings?: () => void;
  isRefreshing?: boolean;
}

export const ActionButtons = ({ onRefresh, onSettings, isRefreshing = false }: ActionButtonsProps) => {
  return (
    <div className={styles.actionsContainer}>
      {onRefresh && (
        <button
          type="button"
          className={styles.actionButton}
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Обновить"
          title="Обновить список"
        >
          <RefreshIcon className={isRefreshing ? iconStyles.rotating : ''} />
        </button>
      )}
      {onSettings && (
        <button
          type="button"
          className={styles.actionButton}
          onClick={onSettings}
          aria-label="Настройки"
          title="Настройки"
        >
          <SettingsIcon />
        </button>
      )}
    </div>
  );
};

