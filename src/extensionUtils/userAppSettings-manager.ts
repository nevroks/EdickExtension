import { CHROME_STORAGE_KEYS, defaultUserAppSettings } from "@/utils/consts/appConsts";
import type { UserAppSettings } from "@/utils/types";

export class UserAppSettingsManager {
    private userAppSettings: UserAppSettings = defaultUserAppSettings;

    constructor() {
        this.initialize();
    }

    private initialize() {
        this.loadUserAppSettingsFromStorage();
        this.setupStorageListener();
    }

    private loadUserAppSettingsFromStorage() {
        chrome.storage.local.get([CHROME_STORAGE_KEYS["userAppSettings"]], (result: any) => {
            const settings: UserAppSettings = result[CHROME_STORAGE_KEYS["userAppSettings"]];
            if (settings) {
                this.userAppSettings = settings;
            } else {
                this.userAppSettings = defaultUserAppSettings;
            }
        });
    }

    private setupStorageListener() {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local' && changes[CHROME_STORAGE_KEYS["userAppSettings"]]) {
                const newSettings: UserAppSettings = changes[CHROME_STORAGE_KEYS["userAppSettings"]].newValue;
                if (newSettings) {
                    this.userAppSettings = newSettings;
                    console.log('UserAppSettingsManager: Settings updated from storage changes');
                }
            }
        });
    }
    
    public getUserAppSettings(): UserAppSettings {
        return this.userAppSettings;
    }
}