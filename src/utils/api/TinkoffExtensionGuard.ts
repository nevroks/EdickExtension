import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";
import axios from "axios";

// Декоратор для Tinkoff API в расширении Chrome
export function TinkoffExtensionGuard<T extends new(...args: any[]) => any>(constructor: T) {
    // Внутренний класс с правильным объявлением статических свойств
    class GuardedApi extends constructor {
        // Явно объявляем свойство api
        declare api: AxiosInstance;
        
        // Статические свойства должны быть объявлены здесь
        static requestIdCounter = 0;
        static pendingRequests = new Map<number, (value: any) => void>();

        constructor(...args: any[]) {
            super(...args);
            
            // Инициализируем слушатель сообщений при первом создании экземпляра
            if (typeof window !== 'undefined' && GuardedApi.pendingRequests.size === 0) {
                this.initializeMessageListener();
            }
            
            // Применяем интерцептор для добавления Tinkoff токена
            this.api.interceptors.request.use(
                async (config: InternalAxiosRequestConfig) => {
                    const token = await this.getTinkoffToken();
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    } else {
                        console.warn('TinkoffExtensionGuard: Tinkoff token not found');
                    }
                    return config;
                },
                error => Promise.reject(error)
            );

            // Добавляем обработчик ошибок
            this.api.interceptors.response.use(
                response => response,
                (error: AxiosError) => {
                    // Обработка ошибок авторизации Tinkoff API
                    if (error.response?.status === 401) {
                        console.error('TinkoffExtensionGuard: Tinkoff API authentication error');
                        // Можно добавить логику, например, показать уведомление о необходимости обновить токен
                    }
                    return Promise.reject(error);
                }
            );
        }

        /**
         * Инициализирует слушатель сообщений от content script
         */
        private initializeMessageListener(): void {
            if (typeof window === 'undefined') return;

            window.addEventListener('message', (event: MessageEvent) => {
                // Проверяем, что сообщение от нашего content script
                if (event.data?.source === 'EDICK_EXT_CONTENT_SCRIPT' && 
                    event.data.requestId !== undefined) {
                    
                    const resolve = GuardedApi.pendingRequests.get(event.data.requestId);
                    if (resolve) {
                        GuardedApi.pendingRequests.delete(event.data.requestId);
                        
                        // Извлекаем T-ключ из ответа
                        let tKey: string | null = null;
                        
                        if (event.data.tKey !== undefined) {
                            tKey = event.data.tKey;
                        } else if (typeof event.data === 'string') {
                            tKey = event.data;
                        } else if (event.data?.data?.tKey) {
                            tKey = event.data.data.tKey;
                        }
                        
                        resolve(tKey);
                    }
                }
            });
        }

        /**
         * Отправляет сообщение в background script для получения T-ключа
         */
        private async requestTinkoffToken(): Promise<string | null> {
            if (typeof window === 'undefined') {
                console.warn('TinkoffExtensionGuard: window not available');
                return null;
            }

            const requestId = ++GuardedApi.requestIdCounter;

            return new Promise((resolve) => {
                // Сохраняем resolver для ответа
                GuardedApi.pendingRequests.set(requestId, resolve);

                // Отправляем сообщение в content script
                window.postMessage({
                    source: 'EDICK_EXT_JWT_PROVIDER',
                    type: 'GET_T_KEY',
                    requestId
                }, '*');

                // Таймаут на случай, если не придет ответ
                setTimeout(() => {
                    if (GuardedApi.pendingRequests.has(requestId)) {
                        GuardedApi.pendingRequests.delete(requestId);
                        console.warn('TinkoffExtensionGuard: T-key request timeout');
                        resolve(null);
                    }
                }, 5000); // 5 секунд таймаут
            });
        }

        /**
         * Получает Tinkoff токен из расширения
         */
        protected async getTinkoffToken(): Promise<string | null> {
            try {
                const token = await this.requestTinkoffToken();
                return token;
            } catch (error) {
                console.error('TinkoffExtensionGuard: Error getting Tinkoff token:', error);
                return null;
            }
        }

        /**
         * Утилита для обработки ошибок API
         */
        protected handleApiError(methodName: string, error: any): never {
            if (axios.isAxiosError(error)) {
                console.error(`📡 Tinkoff API [${methodName}]:`, {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                    url: error.config?.url
                });
            } else {
                console.error(`📡 Tinkoff API [${methodName}]: Unknown error:`, error);
            }
            throw error;
        }
    }

    return GuardedApi;
}