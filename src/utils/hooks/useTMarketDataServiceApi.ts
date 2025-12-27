import { useQuery } from '@tanstack/react-query'



import { TinkoffAppSecuredTMarketDataServiceApi, type GetLastPricesRequest } from '../api/tinkoffApi/TMarketDataServiceApi'

// Создаем экземпляр API
const marketDataServiceApi = new TinkoffAppSecuredTMarketDataServiceApi()

export const useTMarketDataServiceApi = () => {
    // Хук для получения последней цены по инструменту
    const getLastPrice = (
        requestBody: GetLastPricesRequest
    ) => {
        return useQuery({
            queryKey: ['tinkoff', 'lastPrice', JSON.stringify([...requestBody.instrumentId]), requestBody.lastPriceType, requestBody.instrumentStatus],
            queryFn: () => marketDataServiceApi.getLastPrices(requestBody),
            refetchInterval: 2000, // 1 секунда
            // @ts-ignore
            enabled: Boolean(requestBody.instrumentId) && !requestBody.instrumentId.includes(undefined),
            refetchIntervalInBackground: true, // Продолжать обновлять даже когда вкладка неактивна
            refetchOnWindowFocus: false, // Не обновлять при фокусе окна (у нас свой интервал)
            staleTime: 500, // Данные считаются устаревшими через 500ms
        })
    }

    return {
        queries: {
            getLastPrice
        }

    }
}

export default useTMarketDataServiceApi