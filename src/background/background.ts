import { UserAppSettingsManager } from '@/extensionUtils/userAppSettings-manager';

import type { TabInfo } from '../extensionUtils/extensionTypes';
import {
  isTerminalUrl,
  logInfo,
} from '../extensionUtils/helpers';
import { JwtManager } from '../extensionUtils/jwt-manager';
import { ReactChecker } from '../extensionUtils/react-checker';
import { RegistrationService } from '../extensionUtils/registration-service';
import { TabManager } from '../extensionUtils/tab-manager';
import { TerminalChecker } from '../extensionUtils/terminal-checker';
import { WebSocketManager } from '../extensionUtils/websocket-manager';
import { WidgetsChecker } from '../extensionUtils/widgets-checker';

console.log('EdickExt: Background script loaded');



const jwtManager = new JwtManager();
const tabManager = new TabManager();
const userAppSettingsManager = new UserAppSettingsManager();
const terminalChecker = new TerminalChecker(tabManager);
const reactChecker = new ReactChecker(tabManager);
const widgetsChecker = new WidgetsChecker(tabManager);
const registrationService = new RegistrationService(tabManager, userAppSettingsManager);
const websocketManager = new WebSocketManager(jwtManager, tabManager);

chrome.runtime.onInstalled.addListener(() => {
  logInfo('Extension installed');
  terminalChecker.checkAllTerminalTabs();
});

// @ts-ignore
chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
  if (changeInfo.status === 'complete' && isTerminalUrl(tab.url)) {
    logInfo('Terminal page loaded, checking...', tab.url);

    // проверяем Terminal API
    const isTerminalAvailable = await terminalChecker.checkTerminalAPI(tab as TabInfo);
    if (!isTerminalAvailable) {
      logInfo(`Terminal API not available for tab ${tabId}, skipping registration`);
      return;
    }
    // проверяем React
    const isReactAvailable = await reactChecker.checkReactAvailability(tab as TabInfo);
    if (!isReactAvailable) {
      logInfo(`React not available for tab ${tabId}, skipping registration`);
      return;
    }

    const isWidgetsAvailable = await widgetsChecker.checkWidgetsAvailability(tab as TabInfo);
    if (!isWidgetsAvailable) {
      logInfo(`Widgets not available for tab ${tabId}, skipping registration`);
      return;
    }

    logInfo(`Terminal API available for tab ${tabId}, proceeding with registration`);
    await registrationService.registerExtension(tab as TabInfo);
  }
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request.type) {
    case 'GET_ACCESS_TOKEN': {
      // Возвращаем accessToken из JwtManager
      const tokens = jwtManager.getTokens();
      sendResponse({ accessToken: tokens?.accessToken || null });
      return true; // Указываем, что ответ будет асинхронным
    }
    

    case 'REFRESH_TOKENS': {
      jwtManager.refreshTokens().then((success) => {
        if (success) {
          const tokens = jwtManager.getTokens();
          sendResponse({ tokens: tokens || null });
        } else {
          sendResponse({ tokens: null });
        }
      }).catch((error) => {
        console.error('Background: Error refreshing tokens:', error);
        sendResponse({ tokens: null });
      });
      return true;
    }

    case 'WS_RECONNECT': {
      websocketManager.reconnect();
      sendResponse({ success: true });
      return true;
    }
  }
});

chrome.runtime.onSuspend.addListener(() => {
  terminalChecker.cleanup();
  // reactChecker.cleanup();
  widgetsChecker.cleanup();
});

chrome.tabs.onRemoved.addListener((_tabId: number) => {
  tabManager.removeTab(_tabId);
});
