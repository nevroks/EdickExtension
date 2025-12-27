import { TINKOFF_API_URL } from "@/utils/consts/appConsts"
import type { AxiosInstance } from "axios"
import axios from "axios"
import { TinkoffAppGuard } from "../TinkoffAppGuard"
import { TinkoffExtensionGuard } from "../TinkoffExtensionGuard"


export type getPortfolioRequest = {
    accountId: string,
    currency?: "RUB" | "USD" | "EUR"

}
export type getPortfolioResponse = {
    // обьект описан ваще нихуя не полностью
    totalAmountShares: {},
    totalAmountBonds: {},
    totalAmountEtf: {},
    totalAmountFutures: {},
    totalAmountCurrencies: {},
    expectedYield: {},
    positions: {
        figi: string,
        instrumentType: string,
        quantity: {
            units: string,
            nano: number
        },
        averagePositionPrice: {
            currency: string,
            units: string,
            nano: number
        },
        expectedYield: {
            units: string,
            nano: number
        },
        averagePositionPricePt: {
            units: string,
            nano: number
        },
        currentPrice: {
            currency: string,
            units: string,
            nano: number
        },
        averagePositionPriceFifo: {
            currency: string,
            units: string,
            nano: number
        },
        quantityLots: {
            units: string,
            nano: number
        },
        blocked: boolean,
        blockedLots: {
            units: string,
            nano: number
        },
        positionUid: string,
        instrumentUid: string,
        varMargin:{
            currency: string,
            units: string,
            nano: number
        },
        expectedYieldFifo:{
            units: string,
            nano: number
        },
        dailyYield:{
            currency: string,
            units: string,
            nano: number
        },
        ticker: string,
        classCode: string
    }[]
}

class TOperationsServiceApi {
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

    async getPortfolio(requestBody: getPortfolioRequest) {
        try {
            const { data } = await this.api.post<getPortfolioResponse>(`/GetPortfolio`, {
                accountId: requestBody.accountId,
                currency: requestBody.currency || "RUB"
            })
            return data
        } catch (error) {
            throw error
        }
    }
}


@TinkoffAppGuard
export class TinkoffAppSecuredTOperationsServiceApi extends TOperationsServiceApi {
    constructor() {
        super(`${TINKOFF_API_URL}/tinkoff.public.invest.api.contract.v1.OperationsService`);
    }
}

@TinkoffExtensionGuard
export class TinkoffExtensionSecuredTOperationsServiceApi extends TOperationsServiceApi {
    constructor() {
        super(`${TINKOFF_API_URL}/tinkoff.public.invest.api.contract.v1.OperationsService`);
    }
}