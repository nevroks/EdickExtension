export type SummaryPeriod = 'today' | 'week' | 'month' | 'year';

export interface SummaryRow {
  ticker: string;
  profit: number;
  commission: number;
  tradesBuy: number;
  tradesSell: number;
  amountBuy: number;
  amountSell: number;
  lastTrade: string; // Время последней сделки в формате HH:MM
}

export interface SummaryData {
  period: SummaryPeriod;
  rows: SummaryRow[];
  total: Omit<SummaryRow, 'ticker' | 'lastTrade'> & {
    ticker: 'Всего';
    lastTrade: string;
  };
}

export interface SummaryColumnConfig {
  ticker: boolean;
  profit: boolean;
  commission: boolean;
  trades: boolean;
  amount: boolean;
  lastTrade: boolean;
}

// ============================================================================
// Типы для API бекенда
// ============================================================================

/**
 * Запрос к API для получения сводки
 */
export interface SummaryApiRequest {
  period: SummaryPeriod;
}

/**
 * Ответ от API бекенда для одной строки сводки
 * 
 * Пример JSON:
 * {
 *   "ticker": "SBER",
 *   "profit": 12345.67,
 *   "commission": 432.50,
 *   "tradesBuy": 46,
 *   "tradesSell": 12,
 *   "amountBuy": 33242.00,
 *   "amountSell": 4324.00,
 *   "lastTrade": "14:32"
 * }
 */
export interface SummaryApiRow {
  /** Тикер инструмента */
  ticker: string;
  /** Прибыль/убыток (может быть отрицательным) */
  profit: number;
  /** Комиссия */
  commission: number;
  /** Количество сделок на покупку */
  tradesBuy: number;
  /** Количество сделок на продажу */
  tradesSell: number;
  /** Сумма покупок */
  amountBuy: number;
  /** Сумма продаж */
  amountSell: number;
  /** Время последней сделки в формате HH:MM (24-часовой формат) */
  lastTrade: string;
}

/**
 * Ответ от API бекенда для сводки
 * 
 * Пример JSON:
 * {
 *   "period": "today",
 *   "rows": [
 *     {
 *       "ticker": "SBER",
 *       "profit": 12345.67,
 *       "commission": 432.50,
 *       "tradesBuy": 46,
 *       "tradesSell": 12,
 *       "amountBuy": 33242.00,
 *       "amountSell": 4324.00,
 *       "lastTrade": "14:32"
 *     },
 *     ...
 *   ],
 *   "total": {
 *     "profit": 132453.32,
 *     "commission": 4323.52,
 *     "tradesBuy": 487,
 *     "tradesSell": 32,
 *     "amountBuy": 3243242.00,
 *     "amountSell": 432453.00,
 *     "lastTrade": "13:32"
 *   }
 * }
 */
export interface SummaryApiResponse {
  /** Период, за который предоставлены данные */
  period: SummaryPeriod;
  /** Массив строк с данными по каждому тикеру */
  rows: SummaryApiRow[];
  /** Итоговые значения (без тикера, так как это сумма по всем) */
  total: {
    profit: number;
    commission: number;
    tradesBuy: number;
    tradesSell: number;
    amountBuy: number;
    amountSell: number;
    lastTrade: string;
  };
}

