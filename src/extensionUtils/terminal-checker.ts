import { TERMINAL_CHECK_DELAY, MAX_RETRY_ATTEMPTS, RETRY_INTERVAL } from "./extensionConsts";
import type { TabInfo, TerminalCheckResult } from "./extensionTypes";
import { isTerminalUrl, logInfo, logError, logSuccess } from "./helpers";
import { RegistrationService } from "./registration-manager";
import { TabManager } from "./tab-manager";

export class TerminalChecker {
  private tabManager: TabManager;
  private registrationService: RegistrationService;

  constructor() {
    this.tabManager = new TabManager();
    this.registrationService = new RegistrationService();
  }

  async checkAllTerminalTabs(): Promise<void> {
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (isTerminalUrl(tab.url)) {
          logInfo('Checking existing terminal tab:', tab.url);
          setTimeout(() => this.checkTerminalAPI(tab as TabInfo), TERMINAL_CHECK_DELAY);
        }
      }
    } catch (error) {
      logError('Error checking all tabs:', error);
    }
  }

  async checkTerminalAPI(tab: TabInfo): Promise<void> {
    try {
      if (this.tabManager.hasTab(tab.id!)) {
        logSuccess('Already registered for tab', tab.id);
        return;
      }

      logInfo('Checking terminal API for tab', tab.id);
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: this.checkForTerminal,
        world: 'MAIN'
      });

      const result = results[0].result as TerminalCheckResult;
      if (result.found) {
        logSuccess('Terminal API found for tab', tab.id);
        await this.registrationService.registerExtension(tab);
      } else {
        logError('Terminal API not found, retrying...');
        this.retryTerminalCheck(tab);
      }
    } catch (error) {
      logError(`Check error for tab ${tab.id}:`, error);
    }
  }

  private async retryTerminalCheck(tab: TabInfo): Promise<void> {
    if (this.tabManager.hasTab(tab.id!)) return;

    let attempts = 0;

    const checkInterval = setInterval(async () => {
      if (this.tabManager.hasTab(tab.id!)) {
        clearInterval(checkInterval);
        return;
      }

      attempts++;
      logInfo(`Attempt ${attempts}/${MAX_RETRY_ATTEMPTS} for tab ${tab.id}`);

      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          func: this.checkForTerminal,
          world: 'MAIN'
        });

        const result = results[0].result as TerminalCheckResult;
        if (result.found) {
          clearInterval(checkInterval);
          logSuccess(`Terminal API found on attempt ${attempts}`);
          await this.registrationService.registerExtension(tab);
        } else if (attempts >= MAX_RETRY_ATTEMPTS) {
          clearInterval(checkInterval);
          logError(`Terminal API not found after ${MAX_RETRY_ATTEMPTS} attempts`);
        }
      } catch (error) {
        logError('Check attempt failed:', error);
        if (attempts >= MAX_RETRY_ATTEMPTS) clearInterval(checkInterval);
      }
    }, RETRY_INTERVAL);
  }

  private checkForTerminal(): TerminalCheckResult {
    console.log('🔍 EdickExt: Auto-checking window.terminal in PAGE context...');
    
    const terminal = window.terminal;
    if (terminal && typeof terminal.registerExtension === 'function') {
      console.log('✅ Terminal API available in auto-check!');
      return {
        found: true,
        terminal: '[Object]',
        keys: Object.keys(terminal),
        hasRegisterExtension: true
      };
    } else {
      console.log('❌ No terminal API found in auto-check');
      return {
        found: false,
        reason: 'window.terminal is undefined or missing registerExtension'
      };
    }
  }
}