import type { AxiosInstance } from 'axios';
import axios from 'axios';

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
    private accessToken: string | null = null;

    constructor(accessToken?: string) {
        this.api = axios.create({
            baseURL: APP_BACKEND_URL
        })

        if (accessToken) {
            this.accessToken = accessToken;
        }

        this.setupAuthInterceptor();
    }

    setAccessToken(accessToken: string) {
        this.accessToken = accessToken;
    }

    private setupAuthInterceptor() {
        this.api.interceptors.request.use(
            (config) => {
                if (this.accessToken) {
                    config.headers.Authorization = `Bearer ${this.accessToken}`;
                } else {
                    console.warn('📡 NewsApi: JWT token not available');
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

