import {
  useMemo,
  useState,
} from 'react';

import styles from './Table.module.css';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  getRowKey: (row: T) => string | number;
  sortable?: boolean;
  className?: string;
}

export function Table<T extends Record<string, unknown>>({ data, columns, getRowKey, sortable = false, className = '' }: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    const column = columns.find((col) => col.key === columnKey);
    if (!column || !column.sortable) return;

    if (sortColumn === columnKey) {
      // Циклическая сортировка: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const { regularRows, totalRow } = useMemo(() => {
    const regular: T[] = [];
    let total: T | null = null;

    const processedKeys = new Set<string | number>();

    data.forEach((row) => {
      const rowKey = getRowKey(row);

      // Пропускаем дубликаты
      if (processedKeys.has(rowKey)) {
        return;
      }
      processedKeys.add(rowKey);

      const ticker = (row as Record<string, unknown>).ticker as string | undefined;
      if (ticker === 'Всего' || ticker === 'Total' || ticker === 'Итого') {
        total = row;
      } else {
        regular.push(row);
      }
    });

    return { regularRows: regular, totalRow: total };
  }, [data]);

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return regularRows;
    }

    const dataToSort = [...regularRows];

    dataToSort.sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Специальная обработка времени в формате HH:MM
      if (sortColumn === 'lastTrade' && typeof aValue === 'string' && typeof bValue === 'string') {
        const parseTime = (timeStr: string): number => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          return (hours || 0) * 60 + (minutes || 0);
        };
        const aTime = parseTime(aValue);
        const bTime = parseTime(bValue);
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
      }

      // Числовая сортировка
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Строковая сортировка
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return dataToSort;
  }, [regularRows, sortColumn, sortDirection]);

  const getSortIcon = (columnKey: string) => {
    if (!sortable) return null;
    const column = columns.find((col) => col.key === columnKey);
    if (!column || !column.sortable) return null;

    // Показываем иконку только для активной колонки сортировки
    if (sortColumn !== columnKey) {
      return null;
    }

    if (sortDirection === 'asc') {
      return <span className={styles.sortIcon}>↑</span>;
    } else if (sortDirection === 'desc') {
      return <span className={styles.sortIcon}>↓</span>;
    }

    return null;
  };

  return (
    <div className={`${styles.tableWrapper} ${className}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${styles.tableHeader} ${column.sortable && sortable ? styles.sortable : ''}`}
                style={{ textAlign: column.align || 'left' }}
                onClick={() => column.sortable && sortable && handleSort(column.key)}
              >
                <div className={styles.headerContent}>
                  {getSortIcon(column.key)}
                  <span>{column.label}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {totalRow && (
            <tr key={getRowKey(totalRow)} className={`${styles.tableRow} ${styles.totalRow}`}>
              {columns.map((column) => {
                const value = totalRow[column.key];
                const content = column.render ? column.render(value, totalRow) : (value as React.ReactNode);
                return (
                  <td key={column.key} className={styles.tableCell} style={{ textAlign: column.align || 'left' }}>
                    {content}
                  </td>
                );
              })}
            </tr>
          )}
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.emptyCell}>
                Нет данных
              </td>
            </tr>
          ) : (
            sortedData.map((row) => (
              <tr key={getRowKey(row)} className={styles.tableRow}>
                {columns.map((column) => {
                  const value = row[column.key];
                  const content = column.render ? column.render(value, row) : (value as React.ReactNode);
                  return (
                    <td key={column.key} className={styles.tableCell} style={{ textAlign: column.align || 'left' }}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
