import { APP_BACKEND_URL, CHROME_STORAGE_KEYS } from "@/utils/consts/appConsts";

export class JwtManager {
    private tokens: { accessToken: string; refreshToken: string } | null = null;

    constructor() {
        this.initialize();
    }

    private initialize() {
        // Загружаем токены при создании экземпляра
        this.loadTokensFromStorage();

        // Слушаем изменения в storage (на случай обновления токенов из других частей расширения)
        this.setupStorageListener();
    }

    private loadTokensFromStorage() {
        chrome.storage.local.get([CHROME_STORAGE_KEYS["jwt-tokens"]], (result: any) => {
            const tokens = result[CHROME_STORAGE_KEYS["jwt-tokens"]];
            if (tokens && tokens.accessToken && tokens.refreshToken) {
                this.tokens = tokens;
                console.log('JwtManager: Tokens loaded automatically from storage');
            } else {
                console.log('JwtManager: No tokens found in storage');
            }
        });
    }

    private setupStorageListener() {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local' && changes[CHROME_STORAGE_KEYS["jwt-tokens"]]) {
                const newTokens = changes[CHROME_STORAGE_KEYS["jwt-tokens"]].newValue;
                if (newTokens) {
                    this.tokens = newTokens;
                    console.log('JwtManager: Tokens updated from storage changes');
                }
            }
        });
    }

    async refreshTokens() {
        const tokens = this.tokens;
        if (tokens) {
            const response = await fetch(`${APP_BACKEND_URL}/jwt-token/refreshToken`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: tokens.refreshToken })
            }).then(response => response.json());

            if (response.accessToken && response.refreshToken) {
                this.tokens = response;
                chrome.storage.local.set({ [CHROME_STORAGE_KEYS["jwt-tokens"]]: response });
                console.log('JwtManager: Tokens refreshed successfully');
                return true;
            } else {
                return false
            }
        } else {
            return false
        }

    }

    resetTokens() {
        this.tokens = null;
        chrome.storage.local.remove(CHROME_STORAGE_KEYS["jwt-tokens"]);
    }
    
    getTokens(): { accessToken: string; refreshToken: string } | null {
        return this.tokens;
    }

    hasValidTokens(): boolean {
        return !!(this.tokens?.accessToken && this.tokens?.refreshToken);
    }
}