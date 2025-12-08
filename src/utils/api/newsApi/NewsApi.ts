import type { AxiosInstance } from 'axios';
import axios from 'axios';

import { JwtTokenProvider } from '@/extensionUtils/jwt-token-provider';
import { APP_BACKEND_URL } from '@/utils/consts/appConsts';

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
    }

    async getNews(limit: number = 5, offset: number = 0) {
        try {
            const { data } = await this.api.get<NewsResponse>(`/news`, {
                params: {
                    limit,
                    offset
                }
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

