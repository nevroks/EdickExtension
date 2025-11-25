export interface WidgetsCheckResult {
    available: boolean;
    widgetsCount?: number;
    widgetIds?: string[];
    hasRenderWidget?: boolean;
    hasGetWidgetComponent?: boolean;
    reason?: string;
}

export interface TabInfo {
  id: number;
  url?: string;
  title?: string;
  status?: string;
}

export interface TerminalCheckResult {
  found: boolean;
  terminal?: string;
  keys?: string[];
  hasRegisterExtension?: boolean;
  reason?: string;
}

export interface RegistrationResult {
  success: boolean;
  error?: string;
  alreadyRegistered?: boolean;
}

export interface WidgetHandlers {
  mount: (widget: Widget) => void;
  unmount: (widget: Widget) => void;
  tickerChange: (widget: Widget, oldTicker: string) => void;
  groupChange: (widget: Widget, oldGroup: string) => void;
  onCurrencyChange: (widget: Widget, oldCurrency: string) => void;
}

export interface Widget {
  contentRef?: HTMLElement;
  container?: HTMLElement;
  ticker?: string;
  group?: string;
  currency?: string;
  getCommonSettings?: () => any;
}

export interface TerminalExtension {
  registerExtension(config: ExtensionConfig): Promise<ExtensionAPI>;
}

export interface ExtensionConfig {
  extensionName: string;
  displayName: string;
}

export interface ExtensionAPI {
  registerWidgetType: (type: string, config: WidgetConfig) => void;
  getWidgetTypes?: () => string[];
}

export interface WidgetConfig {
  layout: {
    width: number;
    height: number;
  };
  settings: {
    title: string;
    searchable: boolean;
    symbolRequired: boolean;
    noGroup: boolean;
    fullscreenAllowed: boolean;
    isSymbolResettingWithGroup: boolean;
    useSymbolInTitle: boolean;
    pinnable: boolean;
  };
  menu: {
    icon: string;
    label: string;
    order: number;
    hint: string;
  };
  handlers: WidgetHandlers;
}

declare global {
  interface Window {
    terminal?: TerminalExtension;
  }
}