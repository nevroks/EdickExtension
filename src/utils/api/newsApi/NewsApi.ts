import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';

import { JwtTokenProvider } from '@/extensionUtils/jwt-token-provider';
import { APP_BACKEND_URL } from '@/utils/consts/appConsts';

// Расширяем тип конфигурации для добавления флага _retry
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

export type NewsItem = {
    id: number;
    text: string;
    tikers: string[];
    source: string;
}

type NewsResponse = {
    data: NewsItem[];
    count: number;
    limit: number;
    offset: number;
    nextPage: number;
}

export class NewsApi {
    private api: AxiosInstance

    constructor() {
        this.api = axios.create({
            baseURL: APP_BACKEND_URL
        })

        this.setupAuthInterceptor();
    }

    private setupAuthInterceptor() {
        this.api.interceptors.request.use(
            async (config) => {
                try {
                    const accessToken = await JwtTokenProvider.getAccessToken();

                    if (accessToken) {
                        config.headers.Authorization = `Bearer ${accessToken}`;
                    } else {
                        console.warn('NewsApi: JWT token not available');
                    }
                } catch (error) {
                    console.error('NewsApi: Error getting token:', error);
                }

                return config;
            },
            error => Promise.reject(error)
        );

        this.api.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config as ExtendedAxiosRequestConfig | undefined;

                if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const tokens = await JwtTokenProvider.refreshTokens();

                        if (tokens && tokens.accessToken) {
                            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;

                            return this.api(originalRequest);
                        } else {
                            console.error('NewsApi: Token refresh failed');
                            if (typeof window !== 'undefined') {
                                // Можно добавить что-то
                            }
                            return Promise.reject(error);
                        }
                    } catch (refreshError) {
                        console.error('NewsApi: Error during token refresh:', refreshError);
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    async getNews(limit: number = 5, offset: number = 0, tiker?: string) {
        try {
            const params: Record<string, string | number> = {
                limit,
                offset
            };

            if (tiker) {
                params.tiker = tiker;
            }

            const { data } = await this.api.get<NewsResponse>(`/news`, {
                params
            })
            return data
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('📡 NewsApi: Error details:', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                    url: error.config?.url
                });
            }
            throw error
        }
    }
}

