import type { WidgetId } from '@/extensionUtils/widgets';
import type { UserAppSettings } from '../types';

export const TINKOFF_API_URL = 'https://invest-public-api.tinkoff.ru/rest';
export const CHROME_STORAGE_KEYS = {
  'T-key': 'T-key',
  'jwt-tokens': 'jwt-tokens',
  isAuth: 'isAuth',
  'ws-news': 'ws-news',
  'news-ticker-binding-enabled': 'news-ticker-binding-enabled',
  userAppSettings: 'userAppSettings',
};

// Тип конфигурации виджета
export type WidgetConfigItem = {
  widgetId: WidgetId;
  label: string;
  defaultValue?: boolean;
  disabled?: boolean;
};

// Единый источник правды для конфигурации виджетов
// При добавлении нового виджета достаточно добавить его сюда
export const WIDGETS_CONFIG: Record<string, WidgetConfigItem> = {
  // Активные виджеты (настраиваемые)
  newsWidget: {
    widgetId: 'news',
    label: 'Новости виджет',
    defaultValue: true,
  },
  applicationWidget: {
    widgetId: 'application',
    label: 'Заявки виджет',
    defaultValue: true,
  },
  robotsWidget: {
    widgetId: 'robots',
    label: 'Роботы виджет',
    defaultValue: true,
  },
  pastuhWidget: {
    widgetId: 'pastuh',
    label: 'Пастухи виджет',
    defaultValue: true,
  },
  // Отключенные виджеты (не настраиваемые)
  rsiWidget: {
    widgetId: 'rsi',
    label: 'RSI виджет',
    disabled: true,
  },
  marusyaWidget: {
    widgetId: 'marusya',
    label: 'Маруся блять какая-то',
    disabled: true,
  },
  emaWidget: {
    widgetId: 'ema',
    label: 'Ема виджет',
    disabled: true,
  },
  sharpChangesWidget: {
    widgetId: 'sharp-changes',
    label: 'Резкие изменения виджет',
    disabled: true,
  },
  largeLimitsWidget: {
    widgetId: 'large-limits',
    label: 'Крупные лимитки виджет',
    disabled: true,
  },
  heatMapsWidget: {
    widgetId: 'heat-maps',
    label: 'Тепловые карты виджет',
    disabled: true,
  },
  openPositionsWidget: {
    widgetId: 'open-positions',
    label: 'Открытые позиции виджет',
    disabled: true,
  },
} as const;

const ACTIVE_WIDGETS_CONFIG = Object.entries(WIDGETS_CONFIG).filter(([_, config]) => !config.disabled) as Array<[keyof UserAppSettings, WidgetConfigItem]>;

export const defaultUserAppSettings: UserAppSettings = ACTIVE_WIDGETS_CONFIG.reduce((acc, [key, config]) => {
  if (config.defaultValue !== undefined) {
    acc[key] = config.defaultValue;
  }
  return acc;
}, {} as UserAppSettings);

export const WIDGET_SETTINGS_MAP: Record<keyof UserAppSettings, string> = ACTIVE_WIDGETS_CONFIG.reduce(
  (acc, [key, config]) => {
    acc[key] = config.widgetId;
    return acc;
  },
  {} as Record<keyof UserAppSettings, string>,
);

export const WIDGET_SETTINGS_KEYS: Array<keyof UserAppSettings> = ACTIVE_WIDGETS_CONFIG.map(([key]) => key);

export const APP_BACKEND_URL = 'https://extension.api.askerovgroup.ru';
