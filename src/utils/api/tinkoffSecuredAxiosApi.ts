import type { AxiosInstance } from "axios"

type SecureAxiosApiProps = {
    api: AxiosInstance
}

export const tinkoffSecuredAxiosApi = ({ api }: SecureAxiosApiProps): AxiosInstance => {
    api.interceptors.request.use(
        async (config) => {
            try {
                // Асинхронно получаем токен из storage
                const result = await chrome.storage.local.get(["T-key"])
                const token = result["T-key"]

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`
                } else {
                    console.warn('Tinkoff token not found in storage')
                }
            } catch (error) {
                console.error('Error getting token from storage:', error)
            }

            return config
        },
        error => Promise.reject(error)
    )

    return api
}