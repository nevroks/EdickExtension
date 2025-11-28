import { io, type Socket } from "socket.io-client";
import { logInfo, logError, logSuccess } from "./helpers";
import type { JwtManager } from "./jwt-manager";

export class WebSocketManager {
    private socket: Socket | null = null;
    private jwtManager: JwtManager;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    constructor(jwtManager: JwtManager) {
        this.jwtManager = jwtManager;

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

        try {
            this.socket = io('wss://extension.api.askerovgroup.ru/news', {
                transports: ['websocket'],
                auth: {
                    token: this.jwtManager.getTokens()!.accessToken
                }
            });

            this.setupEventHandlers();
        } catch (error) {
            logError('WebSocket connection failed:', error);
            this.handleReconnect();
        }
    }

    private setupEventHandlers() {
        this.socket!.on('connect', () => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            logSuccess('WebSocket connected');
        });

        this.socket!.on('disconnect', (reason: string) => {
            this.isConnected = false;
            logError('WebSocket disconnected:', reason);
            this.handleReconnect();
        });

        this.socket!.on('connect_error', (error: Error) => {
            logError('WebSocket connection error:', error);
            this.handleReconnect();
        });

        this.socket!.on('auth_error', () => {
            logError('JWT authentication failed');
            this.handleAuthError();
        });

        // Обработка бизнес-событий
        this.socket!.on('new_news', (data: any) => {
            this.handleNewsUpdate(data);
        });
    }
    private handleNewsUpdate(data: any) {
        logInfo('Received news update:', data);
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon-48.png',
            title: data.source,
            message: data.text
        });
    }

    private async handleAuthError() {
        // Запрашиваем новый JWT токен
        const success = await this.jwtManager.refreshTokens();
        if (success) {
            this.reconnect(); // переподключаемся с новыми токенами
        } else {
            console.error('WebSocketManager: Token refresh failed, disconnecting...');
            this.disconnect();
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
        this.connect();
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
        }
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }
}