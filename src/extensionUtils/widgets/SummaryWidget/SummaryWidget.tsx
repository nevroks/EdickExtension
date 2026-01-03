import {
  useMemo,
  useState,
} from 'react';

import { useLocalStorage } from '@/utils/hooks/useLocalStorage';

import { ActionButtons } from '../shared/ActionButtons/ActionButtons';
import {
  Table,
  type TableColumn,
} from '../shared/Table/Table';
import { SummarySettingsModal } from './components/SummarySettingsModal';
import { getMockSummaryData } from './mockData';
import styles from './SummaryWidget.module.css';
import type {
  SummaryColumnConfig,
  SummaryData,
  SummaryPeriod,
  SummaryRow,
} from './types';

export interface SummaryWidgetProps {
  terminalWidgetId?: string;
}

const PERIOD_TABS: Array<{ key: SummaryPeriod; label: string }> = [
  { key: 'today', label: 'Сегодня' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
  { key: 'year', label: 'Год' },
];

const DEFAULT_COLUMN_CONFIG: SummaryColumnConfig = {
  ticker: true,
  profit: true,
  commission: true,
  trades: true,
  amount: true,
  lastTrade: true,
};

export const SummaryWidget = ({ terminalWidgetId }: SummaryWidgetProps) => {
  const [activePeriod, setActivePeriod] = useState<SummaryPeriod>('today');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [columnConfig, setColumnConfig] = useLocalStorage<SummaryColumnConfig>('summary-widget-column-config', DEFAULT_COLUMN_CONFIG);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Получение данных (пока моковые, потом будет API)
  const summaryData: SummaryData = useMemo(() => {
    return getMockSummaryData(activePeriod);
  }, [activePeriod]);

  const handleTickerClick = (ticker: string) => {
    console.log('Ticker clicked:', ticker);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Имитация обновления данных
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Формирование колонок таблицы на основе конфигурации
  const columns: TableColumn<SummaryRow | SummaryData['total']>[] = useMemo(() => {
    const cols: TableColumn<SummaryRow | SummaryData['total']>[] = [];

    if (columnConfig.ticker) {
      cols.push({
        key: 'ticker',
        label: 'Тикер',
        sortable: true,
        render: (value: string, row) => {
          if (row.ticker === 'Всего') {
            return <span className={styles.totalTicker}>{value}</span>;
          }
          return (
            <button type="button" className={styles.tickerButton} onClick={() => handleTickerClick(value)}>
              {value}
            </button>
          );
        },
      });
    }

    if (columnConfig.profit) {
      cols.push({
        key: 'profit',
        label: 'Профит',
        sortable: true,
        align: 'right',
        render: (value: number) => {
          const isPositive = value >= 0;
          return <span className={isPositive ? styles.profitPositive : styles.profitNegative}>{value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
        },
      });
    }

    if (columnConfig.commission) {
      cols.push({
        key: 'commission',
        label: 'Комиссия',
        sortable: true,
        align: 'right',
        render: (value: number) => {
          return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },
      });
    }

    if (columnConfig.trades) {
      cols.push({
        key: 'trades',
        label: 'Сделок пок./пр.',
        sortable: false,
        align: 'center',
        render: (_value: any, row) => {
          return `${row.tradesBuy}/${row.tradesSell}`;
        },
      });
    }

    if (columnConfig.amount) {
      cols.push({
        key: 'amount',
        label: 'Сумма пок./пр.',
        sortable: false,
        align: 'right',
        render: (_value: any, row) => {
          return `${row.amountBuy.toLocaleString('ru-RU')}/${row.amountSell.toLocaleString('ru-RU')}`;
        },
      });
    }

    if (columnConfig.lastTrade) {
      cols.push({
        key: 'lastTrade',
        label: 'Посл. сделка',
        sortable: true,
        align: 'center',
      });
    }

    return cols;
  }, [columnConfig]);

  // Объединение данных: сначала строки, потом итог
  const tableData = useMemo(() => {
    return [...summaryData.rows, summaryData.total];
  }, [summaryData.rows, summaryData.total]);

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={styles.header}>{isRefreshing && <span className={styles.refreshing}>Обновление...</span>}</div>
        <ActionButtons onRefresh={handleRefresh} onSettings={() => setIsSettingsModalOpen(true)} isRefreshing={isRefreshing} />
      </div>

      <div className={styles.tabsContainer}>
        {PERIOD_TABS.map((tab) => (
          <button key={tab.key} type="button" className={`${styles.tab} ${activePeriod === tab.key ? styles.tabActive : ''}`} onClick={() => setActivePeriod(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tableContainer}>
        <Table data={tableData} columns={columns} getRowKey={(row) => row.ticker} sortable={true} />
      </div>

      <SummarySettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} columnConfig={columnConfig} onColumnConfigChange={setColumnConfig} />
    </div>
  );
};
