import { io, type Socket } from "socket.io-client";
import { logInfo, logError, logSuccess } from "./helpers";
import type { JwtManager } from "./jwt-manager";
import type { NewsItem } from "@/utils/api/newsApi/NewsApi";
import type { TabManager } from "./tab-manager";

export class WebSocketManager {
    private socket: Socket | null = null;
    private jwtManager: JwtManager;
    private tabManager: TabManager;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectTimeout: NodeJS.Timeout | null = null;

    constructor(jwtManager: JwtManager, tabManager: TabManager) {
        this.jwtManager = jwtManager;
        this.tabManager = tabManager;

        // Автоматически пытаемся подключиться при создании
        this.attemptAutoConnect();
    }

    private attemptAutoConnect() {
        // Даем немного времени JwtManager на загрузку токенов из storage
        setTimeout(() => {
            const tokens = this.jwtManager.getTokens();
            if (tokens?.accessToken) {
                console.log('WebSocketManager: Auto-connecting with stored tokens');
                this.connect();
            } else {
                console.log('WebSocketManager: No tokens available for auto-connect');
            }
        }, 1000);
    }

    connect() {
        if (this.socket) {
            this.socket.disconnect();
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        try {
            this.socket = io('https://extension.api.askerovgroup.ru', {
                transports: ['websocket', 'polling'],
                auth: {
                    token: this.jwtManager.getTokens()!.accessToken
                },
                // timeout: 5000
            });

            this.setupEventHandlers();
        } catch (error) {
            logError('WebSocket connection failed:', error);
            this.handleReconnect();
        }
    }

    private setupEventHandlers() {
        // заглушка для ts
        if (!this.socket) return;

        this.socket.on('connect', () => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            logSuccess('WebSocket connected');
        });

        this.socket.on('disconnect', (reason: string) => {
            this.isConnected = false;
            logError('WebSocket disconnected:', reason);

            // ✅ РАЗЛИЧАЕМ ПРИЧИНЫ ОТКЛЮЧЕНИЯ
            if (reason === 'io server disconnect') {
                // Сервер явно отключил нас - вероятно проблемы с аутентификацией
                logError('Server disconnected us - likely authentication issue');
                this.handleAuthError();
            } else {
                // Другие причины (network issues etc)
                this.handleReconnect();
            }
        });

        this.socket.on('connect_error', (error: Error) => {
            logError('WebSocket connection error:', error);

            // ✅ ПРОВЕРЯЕМ ТИП ОШИБКИ
            if (error.message.includes('auth') || error.message.includes('401')) {
                this.handleAuthError();
            } else {
                this.handleReconnect();
            }
        });

        this.socket.on('auth_error', () => {
            logError('JWT authentication failed');
            this.handleAuthError();
        });

        // Обработка бизнес-событий
        this.socket.on('new_news', (data: NewsItem) => {
            this.handleNewsUpdate(data);
        });
    }
    private async handleNewsUpdate(data: NewsItem) {
        logInfo('Received news update:', data);

        // Отправляем новость во все зарегистрированные вкладки терминала
        const registeredTabs = this.tabManager.getRegisteredTabs();
        for (const tabId of registeredTabs) {
            try {
                await chrome.tabs.sendMessage(tabId, {
                    type: 'WS_NEWS_UPDATE',
                    news: data
                });
                logInfo(`News sent to tab ${tabId}`);
            } catch (error) {
                logError(`Failed to send news to tab ${tabId}:`, error);
            }
        }

        // Создаем уведомление
        chrome.notifications.create({
            type: 'basic',
            iconUrl: '/notification-icon.png',
            title: data.source,
            message: data.text,
            contextMessage: 'EdickExt', // источник внизу уведомления
            priority: 2 // нормальный приоритет
        });
    }

    private async handleAuthError() {
        logInfo('Handling authentication error...');

        // ✅ ПРЕКРАЩАЕМ ПЕРЕПОДКЛЮЧЕНИЯ ПРИ ОШИБКАХ АУТЕНТИФИКАЦИИ
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        const success = await this.jwtManager.refreshTokens();
        if (success) {
            logInfo('Tokens refreshed, reconnecting...');
            this.reconnect();
        } else {
            logError('Token refresh failed, stopping reconnection attempts');
            this.disconnect();
            // Можно также очистить токены
            this.jwtManager.resetTokens();
        }
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

            logInfo(`Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            logError('Max reconnection attempts reached');
        }
    }

    reconnect() {
        this.reconnectAttempts = 0;
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        this.connect();
    }

    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }

        this.reconnectAttempts = 0;
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }
}
