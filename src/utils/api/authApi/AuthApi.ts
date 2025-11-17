import { APP_BACKEND_URL } from "@/utils/consts/appConsts";
import type { AxiosInstance } from "axios";
import axios from "axios";

export type LoginDto = {
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

export type RegisterDto = {
    firstName: string,
    email: string,
    password: string
}

type RegisterResponse = {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        firstName: string;
        email: string;
    };
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
    async register(dto: RegisterDto) {
        try {
            const { data } = await this.api.post<RegisterResponse>(`/register`, {
                email: dto.email,
                password: dto.password,
                firstName: dto.firstName
            })
            return data
        } catch (error) {
            throw error
        }
    }
}