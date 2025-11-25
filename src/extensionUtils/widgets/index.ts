

import type { WidgetConfig } from '../extensionTypes';
import { BondAnalyzerWidget } from './BondAnalyzerWidget/BondAnalyzerWidget';

// Реестр всех доступных виджетов
export const WIDGET_REGISTRY: Record<string, WidgetConfig> = {
    // @ts-ignore
    'bond-analyzer': BondAnalyzerWidget,
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
    // @ts-ignore
    return WIDGET_REGISTRY[widgetId]?.component;
};