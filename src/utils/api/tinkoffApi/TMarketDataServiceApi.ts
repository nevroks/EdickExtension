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
export type TinkoffPrice = {
    nano: number,
    units: string
}
export type GetLastPricesResponse = {
    lastPrices: {
        classCode: string,
        figi: string,
        instrumentUid: string,
        lastPriceType: string,
        price: TinkoffPrice,
        ticker: string,
        time: string
    }[]
}

export type GetClosePricesRequest = {
    instrumentId: InstrumentIdType[],
    instrumentStatus?: InstrumentStatusType
}
type GetClosePricesResponse = {
    closePrices: {
        classCode: string
        eveningSessionPrice: TinkoffPrice
        eveningSessionPriceTime: string
        figi: string
        instrumentUid: string
        price: TinkoffPrice
        ticker: string
        time: string
    }[]
}

export type GetOrderBookRequest = {
    depth?: number,
    instrumentId: InstrumentIdType,
}
export type BidsAsks = {
    price: TinkoffPrice
    quantity: string
}
type GetOrderBookResponse = {
    figi: string
    depth: number
    bids: BidsAsks[]
    asks: BidsAsks[]
    lastPrice: TinkoffPrice,
    limitUp: TinkoffPrice,
    limitDown: TinkoffPrice
    instrumentUid: string
    // ещё пару полей не описал, нах надо впринцепе
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

    // нет смысла использовать, getOrderBook имеет те же данные + свои
    async getLastPrices(requestBody: GetLastPricesRequest) {
        const { data } = await this.api.post<GetLastPricesResponse>(`/GetLastPrices`, {
            instrumentId: requestBody.instrumentId,
            lastPriceType: requestBody.lastPriceType || 'LAST_PRICE_UNSPECIFIED',
            instrumentStatus: requestBody.instrumentStatus || 'INSTRUMENT_STATUS_UNSPECIFIED'
        });
        return data;
    }
    async getClosePrices(requestBody: GetClosePricesRequest) {
        const { data } = await this.api.post<GetClosePricesResponse>(`/GetClosePrices`, {
            instruments: requestBody.instrumentId.map((id) => ({ instrumentId: id })),
            instrumentStatus: requestBody.instrumentStatus || 'INSTRUMENT_STATUS_UNSPECIFIED'
        });
        return data;
    }
    async getOrderBook(requestBody: GetOrderBookRequest) {
        const { data } = await this.api.post<GetOrderBookResponse>(`/GetOrderBook`, {
            instrumentId: requestBody.instrumentId,
            depth: requestBody.depth || 1
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