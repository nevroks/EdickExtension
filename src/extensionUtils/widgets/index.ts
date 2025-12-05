import type { WidgetConfig } from '../extensionTypes';
import { BondAnalyzerWidget } from './BondAnalyzerWidget/BondAnalyzerWidget';
import { NewsWidget } from './NewsWidget/NewsWidget';

// Реестр всех доступных виджетов
export const WIDGET_REGISTRY: Record<string, WidgetConfig> = {
    // @ts-expect-error - WidgetConfig type may not match component type
    'bond-analyzer': BondAnalyzerWidget,
    // @ts-expect-error - WidgetConfig type may not match component type
    'news': NewsWidget,
    // 'portfolio-viewer': portfolioViewerWidget,
    // 'market-scanner': marketScannerWidget,
};

// Утилиты для работы с реестром
export const getWidgetConfig = (widgetId: string): WidgetConfig | undefined => {
    return WIDGET_REGISTRY[widgetId];
};

export const getAllWidgetConfigs = (): WidgetConfig[] => {
    return Object.values(WIDGET_REGISTRY);
};

export const getWidgetComponent = (widgetId: string) => {
    // @ts-expect-error - component property may not exist on WidgetConfig
    return WIDGET_REGISTRY[widgetId]?.component;
};