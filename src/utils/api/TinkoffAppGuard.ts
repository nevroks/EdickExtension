import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { CHROME_STORAGE_KEYS } from "../consts/appConsts";

// Интерфейс с учетом protected свойства
interface IApiService {
    api: AxiosInstance; // Убираем public/private - TypeScript сам определит
}

// Декоратор с более гибкой типизацией
export function TinkoffAppGuard<T extends new(...args: any[]) => any>(constructor: T) {
    return class extends constructor implements IApiService {
        // Явно объявляем свойство
        declare api: AxiosInstance;
        
        constructor(...args: any[]) {
            super(...args);
            
            // Применяем интерцептор
            this.api.interceptors.request.use(
                async (config: InternalAxiosRequestConfig) => {
                    const token = await this.getTinkoffToken();
                    if (token) config.headers.Authorization = `Bearer ${token}`;
                    return config;
                }
            );
        }

        protected async getTinkoffToken(): Promise<string | null> {
            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                const result = await chrome.storage.local.get([CHROME_STORAGE_KEYS["T-key"]]);
                return result[CHROME_STORAGE_KEYS["T-key"]] || null;
            }
            return null;
        }
    };
}