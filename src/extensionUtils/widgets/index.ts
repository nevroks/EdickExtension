import type { WidgetConfig } from '../extensionTypes';
import ApplicationWidget, { type ApplicationWidgetProps } from './ApplicationWidget';
import { BondAnalyzerWidget, type BondAnalyzerWidgetProps } from './BondAnalyzerWidget/BondAnalyzerWidget';
import { NewsWidget, type NewsWidgetProps } from './NewsWidget/NewsWidget';
import { SummaryWidget, type SummaryWidgetProps } from './SummaryWidget';


type WidgetProps = Record<string, any>;

// Тип для функций виджетов с пропсами
type WidgetComponent<P extends WidgetProps = WidgetProps> = (props: P) => React.ReactElement;

// Union тип для идентификаторов виджетов
export type WidgetId = 'bond-analyzer' | 'news' | 'application' | 'summary' | 'open-positions' | 'heat-maps' | 'large-limits' | 'sharp-changes' | 'ema' | 'marusya' | 'rsi' | 'pastuh' | 'robots';

export type widgetsRegistry = {
    'bond-analyzer': WidgetComponent<BondAnalyzerWidgetProps>,
    'news': WidgetComponent<NewsWidgetProps>,
    'application': WidgetComponent<ApplicationWidgetProps>,
    'summary': WidgetComponent<SummaryWidgetProps>,
}

// Реестр всех доступных виджетов
export const WIDGET_REGISTRY: widgetsRegistry = {
    'bond-analyzer': BondAnalyzerWidget,
    'news': NewsWidget,
    'application': ApplicationWidget,
    'summary': SummaryWidget,
    // 'portfolio-viewer': portfolioViewerWidget,
    // 'market-scanner': marketScannerWidget,
};

// Утилиты для работы с реестром
// export const getWidgetConfig = (widgetId: string): WidgetConfig | undefined => {
//     return WIDGET_REGISTRY[widgetId];
// };

// export const getAllWidgetConfigs = (): WidgetConfig[] => {
//     return Object.values(WIDGET_REGISTRY);
// };

export const getWidgetComponent = (widgetId: string) => {
    // @ts-expect-error - component property may not exist on WidgetConfig
    return WIDGET_REGISTRY[widgetId]?.component;
};