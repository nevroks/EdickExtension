import { useMutation } from '@tanstack/react-query'
import { AuthApi, type LoginDto, type RegisterDto } from '../api/authApi/AuthApi'


// Создаем экземпляр API
const authApi = new AuthApi()

export const useAuthApi = () => {
    const login = useMutation({
        mutationFn: (dto: LoginDto) => authApi.login(dto)
    })

    const register = useMutation({
        mutationFn: (dto: RegisterDto) => authApi.register(dto)
    })


    return {
        queries: {

        },
        mutations: {
            login,
            register
        }

    }
}

export default useAuthApi