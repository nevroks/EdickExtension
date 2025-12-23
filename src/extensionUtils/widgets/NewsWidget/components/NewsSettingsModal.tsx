import {
  useEffect,
  useState,
} from 'react';

import { Modal } from '../../shared/Modal/Modal';
import { Switch } from '../../shared/Switch/Switch';
import styles from './NewsSettingsModal.module.css';

interface NewsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickerBindingEnabled: boolean;
  onTickerBindingChange: (enabled: boolean) => void;
}

export const NewsSettingsModal = ({
  isOpen,
  onClose,
  tickerBindingEnabled,
  onTickerBindingChange,
}: NewsSettingsModalProps) => {
  const [localTickerBinding, setLocalTickerBinding] = useState(tickerBindingEnabled);

  useEffect(() => {
    setLocalTickerBinding(tickerBindingEnabled);
  }, [tickerBindingEnabled]);

  const handleTickerBindingChange = (checked: boolean) => {
    setLocalTickerBinding(checked);
    onTickerBindingChange(checked);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.settingsContent}>
        <Switch
          checked={localTickerBinding}
          onChange={handleTickerBindingChange}
          label="Привязка новостей по тикеру"
        />
      </div>
    </Modal>
  );
};

