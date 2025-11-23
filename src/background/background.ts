import type { TabInfo } from "../extensionUtils/extensionTypes";
import { isTerminalUrl, logInfo } from "../extensionUtils/helpers";
import { TerminalChecker } from "../extensionUtils/terminal-checker";



console.log('EdickExt: Background script loaded');

const terminalChecker = new TerminalChecker();

chrome.runtime.onInstalled.addListener(() => {
  logInfo('Extension installed');
  terminalChecker.checkAllTerminalTabs();
});
// @ts-ignore
chrome.tabs.onUpdated.addListener(async (_tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
  if (changeInfo.status === 'complete' && isTerminalUrl(tab.url)) {
    logInfo('Terminal page loaded, checking...', tab.url);
    setTimeout(() => terminalChecker.checkTerminalAPI(tab as TabInfo), 5000);
  }
});

// chrome.tabs.onRemoved.addListener((_tabId: number) => {
//   // TabManager будет обрабатывать это внутри TerminalChecker
// });