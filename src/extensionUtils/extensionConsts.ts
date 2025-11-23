

export const TERMINAL_CHECK_DELAY = 3000;
export const MAX_RETRY_ATTEMPTS = 12;
export const RETRY_INTERVAL = 1000;
export const NOTIFICATION_DISPLAY_TIME = 5000;

export const TERMINAL_URL_PATTERNS = [
  'tinkoff.ru/terminal',
  'tbank.ru/terminal', 
  'tinkoff.ru/invest/',
  /https:\/\/(www\.)?tinkoff\.ru\/invest\/[^\/]+\/terminal/
];

export const DEFAULT_WIDGET_CONFIG = {
  layout: {
    width: 400,
    height: 300
  },
  settings: {
    title: 'Анализ облигаций',
    searchable: true,
    symbolRequired: false,
    noGroup: false,
    fullscreenAllowed: true,
    isSymbolResettingWithGroup: false,
    useSymbolInTitle: false,
    pinnable: true
  },
  menu: {
    icon: 'chart' as const,
    label: 'Облигации EdickExt',
    order: 1,
    hint: 'Анализ облигаций'
  }
};