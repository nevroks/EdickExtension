import { useQuery } from '@tanstack/react-query'


import { TInstrumentsApi, type InstrumentExchangeType, type InstrumentStatusType } from '../api/tinkoffApi/TInstrumentsApi'

// Создаем экземпляр API
const instrumentsApi = new TInstrumentsApi()

export const useTInstrumentsApi = () => {
    // Хук для получения облигаций
    const getBonds = (
        instrumentStatus: InstrumentStatusType = 'INSTRUMENT_STATUS_BASE',
        instrumentExchange: InstrumentExchangeType = 'INSTRUMENT_EXCHANGE_DEALER'
    ) => {
        return useQuery({
            queryKey: ['tinkoff', 'bonds', instrumentStatus, instrumentExchange],
            queryFn: () => instrumentsApi.getBonds(instrumentStatus, instrumentExchange),
            staleTime: 5 * 60 * 1000, // 5 минут - данные редко меняются
            gcTime: 30 * 60 * 1000, // 30 минут
        })
    }

    return {
        queries: {
            getBonds
        }

    }
}

export default useTInstrumentsApi