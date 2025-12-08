/**
 * Утилита для получения JWT токена в MAIN world (контекст страницы)
 * Использует window.postMessage для связи с content script, который пересылает запрос в background
 */

const MESSAGE_SOURCE = 'EDICK_EXT_JWT_PROVIDER';
const MESSAGE_TARGET = 'EDICK_EXT_CONTENT_SCRIPT';

export class JwtTokenProvider {
  private static requestIdCounter = 0;
  private static pendingRequests = new Map<number, (value: string | null) => void>();

  private static initializeListener(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('message', (event) => {
      if (event.data?.source !== MESSAGE_TARGET) {
        return;
      }

      const { requestId, accessToken, tokens } = event.data;
      if (requestId !== undefined && this.pendingRequests.has(requestId)) {
        const resolve = this.pendingRequests.get(requestId)!;
        this.pendingRequests.delete(requestId);
        resolve(tokens || accessToken || null);
      }
    });
  }

  static async getAccessToken(): Promise<string | null> {
    try {
      if (typeof window === 'undefined') {
        console.warn('📡 JwtTokenProvider: window not available');
        return null;
      }

      // Инициализируем слушатель при первом вызове
      if (this.pendingRequests.size === 0) {
        this.initializeListener();
      }

      const requestId = ++this.requestIdCounter;

      return new Promise((resolve) => {
        // Сохраняем resolver для ответа
        this.pendingRequests.set(requestId, resolve);

        window.postMessage(
          {
            source: MESSAGE_SOURCE,
            type: 'GET_ACCESS_TOKEN',
            requestId,
          },
          '*'
        );

        // Таймаут на случай, если content script не ответит
        setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
            this.pendingRequests.delete(requestId);
            console.warn('📡 JwtTokenProvider: Request timeout');
            resolve(null);
          }
        }, 5000);
      });
    } catch (error) {
      console.error('📡 JwtTokenProvider: Error:', error);
      return null;
    }
  }

  static async refreshTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      if (typeof window === 'undefined') {
        console.warn('📡 JwtTokenProvider: window not available');
        return null;
      }

      if (this.pendingRequests.size === 0) {
        this.initializeListener();
      }

      const requestId = ++this.requestIdCounter;

      return new Promise((resolve) => {
        this.pendingRequests.set(requestId, (value) => {
          resolve(value as { accessToken: string; refreshToken: string } | null);
        });

        window.postMessage(
          {
            source: MESSAGE_SOURCE,
            type: 'REFRESH_TOKENS',
            requestId,
          },
          '*'
        );

        setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
            this.pendingRequests.delete(requestId);
            console.warn('📡 JwtTokenProvider: Refresh tokens request timeout');
            resolve(null);
          }
        }, 10000);
      });
    } catch (error) {
      console.error('📡 JwtTokenProvider: Error refreshing tokens:', error);
      return null;
    }
  }
}

