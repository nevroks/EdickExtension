import { TinkoffExtensionSecuredTMarketDataServiceApi, type GetClosePricesRequest, type GetLastPricesRequest } from '@/utils/api/tinkoffApi/TMarketDataServiceApi'
import { useQuery } from '@tanstack/react-query'




// Создаем экземпляр API
const marketDataServiceApi = new TinkoffExtensionSecuredTMarketDataServiceApi()

export const useTMarketDataServiceApi = () => {
    // Хук для получения последней цены по инструменту
    const getLastPrice = (
        requestBody: GetLastPricesRequest
    ) => {
        return useQuery({
            queryKey: ['tinkoff', 'lastPrice', JSON.stringify([...requestBody.instrumentId]), requestBody.lastPriceType, requestBody.instrumentStatus],
            queryFn: () => marketDataServiceApi.getLastPrices(requestBody),
            refetchInterval: 2500, // сидел смотрел с какой скоростью работает тинёк, эта скорость оптимальная
            // @ts-ignore
            enabled: Boolean(requestBody.instrumentId) && !requestBody.instrumentId.includes(undefined),
            refetchIntervalInBackground: true, // Продолжать обновлять даже когда вкладка неактивна
            refetchOnWindowFocus: false, // Не обновлять при фокусе окна (у нас свой интервал)
            staleTime: 500, // Данные считаются устаревшими через 500ms
        })
    }

    const getClosePrices = (
        requestBody: GetClosePricesRequest
    ) => {
        return useQuery({
            queryKey: ['tinkoff', 'closePrice', JSON.stringify([...requestBody.instrumentId]), requestBody.instrumentStatus],
            queryFn: () => marketDataServiceApi.getClosePrices(requestBody),
            staleTime: 10 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            // @ts-ignore
            enabled: Boolean(requestBody.instrumentId) && !requestBody.instrumentId.includes(undefined),
        })
    }

    return {
        queries: {
            getLastPrice,
            getClosePrices
        }

    }
}

export default useTMarketDataServiceApi