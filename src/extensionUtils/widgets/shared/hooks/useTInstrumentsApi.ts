import { TinkoffExtensionSecuredTTInstrumentsApi, type findInstrumentRequest } from '@/utils/api/tinkoffApi/TInstrumentsApi'
import { useQuery } from '@tanstack/react-query'




// Создаем экземпляр API
const instrumentsApi = new TinkoffExtensionSecuredTTInstrumentsApi()

export const useTInstrumentsApi = () => {
   
    const getInstrument = (
        request: findInstrumentRequest
    ) => {
        return useQuery({
            queryKey: ['tinkoff', 'instrument', request.instrumentUid],
            queryFn: () => instrumentsApi.findInstrument(request),
            staleTime: 10 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            enabled: Boolean(request.instrumentUid),
        })
    }

    return {
        queries: {
            getInstrument
        }

    }
}

export default useTInstrumentsApi