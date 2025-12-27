import { TINKOFF_API_URL } from "@/utils/consts/appConsts"
import type { AxiosInstance } from "axios"
import axios from "axios"
import { TinkoffAppGuard } from "../TinkoffAppGuard"
import { TinkoffExtensionGuard } from "../TinkoffExtensionGuard"



export type getInfoResponse = {
    premStatus: boolean
    qualStatus: boolean
    qualifiedForWorkWith: string[]
    tariff: string
    userId: string
    riskLevelCode: string
}

class TUsersServiceApi {
    protected api: AxiosInstance;

    constructor(baseURL: string) {
        this.api = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
    }

    async getInfo() {
        try {
            const { data } = await this.api.post<getInfoResponse>(`/GetInfo`, {
            })
            return data
        } catch (error) {
            throw error
        }
    }
    async getAccounts() {
        try {
            const { data } = await this.api.post<getInfoResponse>(`/GetAccounts`, {
                status: "ACCOUNT_STATUS_OPEN"
            })
            return data
        } catch (error) {
            throw error
        }
    }
}


@TinkoffAppGuard
export class TinkoffAppSecuredTUsersServiceApi extends TUsersServiceApi {
    constructor() {
        super(`${TINKOFF_API_URL}/tinkoff.public.invest.api.contract.v1.UsersService`);
    }
}

@TinkoffExtensionGuard
export class TinkoffExtensionSecuredTUsersServiceApi extends TUsersServiceApi {
    constructor() {
        super(`${TINKOFF_API_URL}/tinkoff.public.invest.api.contract.v1.UsersService`);
    }
}