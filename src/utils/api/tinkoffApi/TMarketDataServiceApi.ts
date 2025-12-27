import type { AxiosInstance } from "axios"
import axios from "axios"
import { TINKOFF_API_URL } from "@/utils/consts/appConsts"
import type { InstrumentStatusType } from "./TInstrumentsApi"
import { TinkoffAppGuard } from "../TinkoffAppGuard"
import { TinkoffExtensionGuard } from "../TinkoffExtensionGuard"




export type InstrumentIdType = string // вот эта хуйня равна figi, instrument_uid или ticker + '_' + class_code 
export type LastPriceType = 'LAST_PRICE_UNSPECIFIED' | 'LAST_PRICE_EXCHANGE' | 'LAST_PRICE_DEALER'
// LAST_PRICE_UNSPECIFIED: Не определен.
// LAST_PRICE_EXCHANGE: Цена биржи.
// LAST_PRICE_DEALER: Цена дилера



export type GetLastPricesRequest = {
    instrumentId: InstrumentIdType[],
    lastPriceType?: LastPriceType
    instrumentStatus?: InstrumentStatusType,
}
export type GetLastPricesResponse = {
    lastPrices: {
        classCode: string,
        figi: string,
        instrumentUid: string,
        lastPriceType: string,
        price: {
            nano: number,
            units: string
        },
        ticker: string,
        time: string
    }[]
}

class TMarketDataServiceApi {
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

    async getLastPrices(requestBody: GetLastPricesRequest) {
        const { data } = await this.api.post<GetLastPricesResponse>(`/GetLastPrices`, {
            instrumentId: requestBody.instrumentId,
            lastPriceType: requestBody.lastPriceType || 'LAST_PRICE_UNSPECIFIED',
            instrumentStatus: requestBody.instrumentStatus || 'INSTRUMENT_STATUS_UNSPECIFIED'
        });
        return data;
    }
}

@TinkoffAppGuard
export class TinkoffAppSecuredTMarketDataServiceApi extends TMarketDataServiceApi {
    constructor() {
        super(`${TINKOFF_API_URL}/tinkoff.public.invest.api.contract.v1.MarketDataService`);
    }
}

@TinkoffExtensionGuard
export class TinkoffExtensionSecuredTMarketDataServiceApi extends TMarketDataServiceApi {
    constructor() {
        super(`${TINKOFF_API_URL}/tinkoff.public.invest.api.contract.v1.MarketDataService`);
    }
}