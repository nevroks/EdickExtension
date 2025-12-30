import { TinkoffExtensionSecuredTOperationsServiceApi, type getPortfolioRequest } from '@/utils/api/tinkoffApi/TOperationsServiceApi'
import { useQuery } from '@tanstack/react-query'




// Создаем экземпляр API
const TOperationsServiceApi = new TinkoffExtensionSecuredTOperationsServiceApi()

export const useTOperationsServiceApi = () => {

    const getPortfolio = (requestBody: getPortfolioRequest) => {
        return useQuery({
            queryKey: ['tinkoff', 'portfolio', requestBody.accountId, requestBody.currency || "RUB"],
            queryFn: () => TOperationsServiceApi.getPortfolio(requestBody),
            staleTime: 10000,
            refetchInterval: 20000,
            enabled: Boolean(requestBody.accountId),
        })
    }

    return {
        queries: {
            getPortfolio
        }

    }
}

export default useTOperationsServiceApi