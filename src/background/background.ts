import type { TabInfo } from "../extensionUtils/extensionTypes";
import { isTerminalUrl, logInfo } from "../extensionUtils/helpers";
import { RegistrationService } from "../extensionUtils/registration-manager";
import { TabManager } from "../extensionUtils/tab-manager";
import { TerminalChecker } from "../extensionUtils/terminal-checker";



console.log('EdickExt: Background script loaded');

const tabManager = new TabManager();
const terminalChecker = new TerminalChecker(tabManager);
const registrationService = new RegistrationService(tabManager);

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


    logInfo(`Terminal API available for tab ${tabId}, proceeding with registration`);
    await registrationService.registerExtension(tab as TabInfo);
  }
});

chrome.tabs.onRemoved.addListener((_tabId: number) => {
  tabManager.removeTab(_tabId);
});