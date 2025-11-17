import { APP_BACKEND_URL } from "@/utils/consts/appConsts";
import type { AxiosInstance } from "axios";
import axios from "axios";

type LoginDto = {
    email: string,
    password: string
}

type LoginResponse = {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        firstName: string;
        email: string;
    };
}

type RegisterDto = {
    firstName: string,
    email: string,
    password: string
}

export class AuthApi {
    private api: AxiosInstance


    constructor() {
        this.api = axios.create({
            baseURL: `${APP_BACKEND_URL}/auth`
        })
    }


    async login(dto: LoginDto) {
        try {
            const { data } = await this.api.post<LoginResponse>(`/login`, {
                email: dto.email,
                password: dto.password
            })
            return data
        } catch (error) {
            throw error
        }
    }
    async register() {
        try {
            const { data } = await this.api.post(`/register`, {})
            return data
        } catch (error) {
            throw error
        }
    }
}