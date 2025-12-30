
import { TinkoffExtensionSecuredTUsersServiceApi } from '@/utils/api/tinkoffApi/TUsersServiceApi'
import { useQuery } from '@tanstack/react-query'




// Создаем экземпляр API
const TUsersServiceApi = new TinkoffExtensionSecuredTUsersServiceApi()

export const useTUsersServiceApi = () => {
   
    const getInfo = () => {
        return useQuery({
            queryKey: ['tinkoff', 'userinfo'],
            queryFn: () => TUsersServiceApi.getInfo(),
            staleTime: 30 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
        })
    }

    return {
        queries: {
            getInfo
        }

    }
}

export default useTUsersServiceApi