import type {
  SummaryApiResponse,
  SummaryData,
  SummaryPeriod,
} from './types';

/**
 * Преобразует ответ от API бекенда в формат, используемый виджетом
 *
 * @param apiResponse - Ответ от API бекенда
 * @returns Данные в формате SummaryData
 */
export const transformApiResponseToSummaryData = (apiResponse: SummaryApiResponse): SummaryData => {
  return {
    period: apiResponse.period,
    rows: apiResponse.rows,
    total: {
      ticker: 'Всего',
      ...apiResponse.total,
    },
  };
};

// Генерация случайных данных для моков
const generateMockRows = (count: number): SummaryData['rows'] => {
  const tickers = ['IMOEXF', 'LKON', 'SBER', 'GAZP', 'YNDX', 'TCSG', 'VTBR', 'ALRS', 'NVTK', 'GMKN', 'MTSS', 'CHMF', 'PLZL', 'POLY', 'AFKS'];
  const rows: SummaryData['rows'] = [];

  for (let i = 0; i < count; i++) {
    // Выбираем случайный тикер для разнообразия данных
    const ticker = tickers[Math.floor(Math.random() * tickers.length)];
    const profit = Math.random() * 50000 - 10000; // От -10000 до 40000
    const commission = Math.random() * 1000;
    const tradesBuy = Math.floor(Math.random() * 100) + 10;
    const tradesSell = Math.floor(Math.random() * 50) + 5;
    const amountBuy = Math.floor(Math.random() * 500000) + 10000;
    const amountSell = Math.floor(Math.random() * 300000) + 5000;
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    const lastTrade = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    rows.push({
      ticker,
      profit: Math.round(profit * 100) / 100,
      commission: Math.round(commission * 100) / 100,
      tradesBuy,
      tradesSell,
      amountBuy,
      amountSell,
      lastTrade,
    });
  }

  return rows;
};

const calculateTotal = (rows: SummaryData['rows']): SummaryApiResponse['total'] => {
  const total = rows.reduce(
    (acc, row) => ({
      profit: acc.profit + row.profit,
      commission: acc.commission + row.commission,
      tradesBuy: acc.tradesBuy + row.tradesBuy,
      tradesSell: acc.tradesSell + row.tradesSell,
      amountBuy: acc.amountBuy + row.amountBuy,
      amountSell: acc.amountSell + row.amountSell,
    }),
    {
      profit: 0,
      commission: 0,
      tradesBuy: 0,
      tradesSell: 0,
      amountBuy: 0,
      amountSell: 0,
    },
  );

  // Находим последнее время сделки
  const lastTradeTimes = rows
    .map((row) => {
      const [hours, minutes] = row.lastTrade.split(':').map(Number);
      return hours * 60 + minutes;
    })
    .sort((a, b) => b - a);

  const latestTime = lastTradeTimes[0] || 0;
  const latestHour = Math.floor(latestTime / 60);
  const latestMinute = latestTime % 60;
  const lastTrade = `${latestHour.toString().padStart(2, '0')}:${latestMinute.toString().padStart(2, '0')}`;

  return {
    profit: Math.round(total.profit * 100) / 100,
    commission: Math.round(total.commission * 100) / 100,
    tradesBuy: total.tradesBuy,
    tradesSell: total.tradesSell,
    amountBuy: total.amountBuy,
    amountSell: total.amountSell,
    lastTrade,
  };
};

/**
 * Генерирует моковые данные в формате, который должен возвращать бекенд
 *
 * @param period - Период для генерации данных
 * @returns Данные в формате SummaryApiResponse (как от бекенда)
 *
 * @example
 * ```json
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
 *     }
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
 * ```
 */
export const getMockApiResponse = (period: SummaryPeriod): SummaryApiResponse => {
  const rowCount = period === 'today' ? 20 : period === 'week' ? 15 : period === 'month' ? 25 : 30;
  const rows = generateMockRows(rowCount);
  const total = calculateTotal(rows);

  return {
    period,
    rows,
    total,
  };
};

/**
 * Генерирует моковые данные для виджета (используется для разработки)
 * Преобразует формат API в формат виджета
 *
 * @param period - Период для генерации данных
 * @returns Данные в формате SummaryData
 */
export const getMockSummaryData = (period: SummaryPeriod): SummaryData => {
  const apiResponse = getMockApiResponse(period);
  return transformApiResponseToSummaryData(apiResponse);
};
