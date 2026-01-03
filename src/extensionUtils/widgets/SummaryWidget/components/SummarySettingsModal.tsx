import {
  useEffect,
  useState,
} from 'react';

import { Modal } from '../../shared/Modal/Modal';
import { Switch } from '../../shared/Switch/Switch';
import type { SummaryColumnConfig } from '../types';
import styles from './SummarySettingsModal.module.css';

interface SummarySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnConfig: SummaryColumnConfig;
  onColumnConfigChange: (config: SummaryColumnConfig) => void;
}

const COLUMN_LABELS: Record<keyof SummaryColumnConfig, string> = {
  ticker: 'Тикер',
  profit: 'Профит',
  commission: 'Комиссия',
  trades: 'Сделок пок./пр.',
  amount: 'Сумма пок./пр.',
  lastTrade: 'Посл. сделка',
};

export const SummarySettingsModal = ({ isOpen, onClose, columnConfig, onColumnConfigChange }: SummarySettingsModalProps) => {
  const [localConfig, setLocalConfig] = useState<SummaryColumnConfig>(columnConfig);

  useEffect(() => {
    setLocalConfig(columnConfig);
  }, [columnConfig]);

  const handleColumnToggle = (key: keyof SummaryColumnConfig) => {
    const newConfig = {
      ...localConfig,
      [key]: !localConfig[key],
    };
    setLocalConfig(newConfig);
    onColumnConfigChange(newConfig);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Настройки колонок">
      <div className={styles.settingsContent}>
        {Object.entries(COLUMN_LABELS).map(([key, label]) => (
          <Switch key={key} checked={localConfig[key as keyof SummaryColumnConfig]} onChange={() => handleColumnToggle(key as keyof SummaryColumnConfig)} label={label} />
        ))}
      </div>
    </Modal>
  );
};
