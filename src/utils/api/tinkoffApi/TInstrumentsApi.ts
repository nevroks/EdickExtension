import { TINKOFF_API_URL } from "@/utils/consts/appConsts"
import type { AxiosInstance } from "axios"
import axios from "axios"
import { TinkoffAppGuard } from "../TinkoffAppGuard"
import { TinkoffExtensionGuard } from "../TinkoffExtensionGuard"



export type InstrumentStatusType = "INSTRUMENT_STATUS_UNSPECIFIED" | "INSTRUMENT_STATUS_BASE" | "INSTRUMENT_STATUS_ALL"
export type InstrumentExchangeType = "INSTRUMENT_EXCHANGE_UNSPECIFIED" | "INSTRUMENT_EXCHANGE_DEALER"
export type InstrumentKindType = "INSTRUMENT_TYPE_UNSPECIFIED" | "INSTRUMENT_TYPE_BOND" | "INSTRUMENT_TYPE_SHARE" | "INSTRUMENT_TYPE_CURRENCY" | "INSTRUMENT_TYPE_ETF" | "INSTRUMENT_TYPE_FUTURES" | "INSTRUMENT_TYPE_SP" | "INSTRUMENT_TYPE_OPTION" | "INSTRUMENT_TYPE_CLEARING_CERTIFICATE" | "INSTRUMENT_TYPE_INDEX" | "INSTRUMENT_TYPE_COMMODITY"
// INSTRUMENT_TYPE_BOND: Облигация.
// INSTRUMENT_TYPE_SHARE: Акция.
// INSTRUMENT_TYPE_CURRENCY: Валюта.
// INSTRUMENT_TYPE_ETF: Exchange-traded fund. Фонд.
// INSTRUMENT_TYPE_FUTURES: Фьючерс.
// INSTRUMENT_TYPE_SP: Структурная нота.
// INSTRUMENT_TYPE_OPTION: Опцион.
// INSTRUMENT_TYPE_CLEARING_CERTIFICATE: Clearing certificate.
// INSTRUMENT_TYPE_INDEX: Индекс.
// INSTRUMENT_TYPE_COMMODITY: Товар.

export type findInstrumentRequest = {
  instrumentUid: string
  instrumentKind?: string
  apiTradeAvailableFlag?: boolean
}
export type findInstrumentResponse = {
  instruments: {
    apiTradeAvailableFlag
    :
    boolean
    blockedTcaFlag
    :
    boolean
    classCode
    :
    string
    figi
    :
    string
    first1dayCandleDate
    :
    string
    first1minCandleDate
    :
    string
    forIisFlag
    :
    boolean
    forQualInvestorFlag
    :
    boolean
    instrumentKind
    :
    InstrumentKindType
    instrumentType
    :
    string
    isin
    :
    string
    lot
    :
    number
    name
    :
    string
    positionUid
    :
    string
    ticker
    :
    string
    uid
    :
    string
    weekendFlag
    :
    boolean
  }[]
}

class TInstrumentsApi {
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
  // Список Облигаций
  async getBonds(instrumentStatus: InstrumentStatusType, instrumentExchange: InstrumentExchangeType) {
    try {
      const { data } = await this.api.post(`/Bonds`, {
        instrumentStatus,
        instrumentExchange
      })
      return data
    } catch (error) {
      throw error
    }
  }

  async findInstrument(request: findInstrumentRequest) {
    try {
      const { data } = await this.api.post<findInstrumentResponse>(`/FindInstrument`, {
        query: request.instrumentUid,
        instrumentKind: request.instrumentKind || "INSTRUMENT_TYPE_UNSPECIFIED",
        apiTradeAvailableFlag: request.apiTradeAvailableFlag || false
      })
      return data
    } catch (error) {
      throw error
    }
  }
}


@TinkoffAppGuard
export class TinkoffAppSecuredTTInstrumentsApi extends TInstrumentsApi {
  constructor() {
    super(`${TINKOFF_API_URL}/tinkoff.public.invest.api.contract.v1.InstrumentsService`);
  }
}

@TinkoffExtensionGuard
export class TinkoffExtensionSecuredTTInstrumentsApi extends TInstrumentsApi {
  constructor() {
    super(`${TINKOFF_API_URL}/tinkoff.public.invest.api.contract.v1.InstrumentsService`);
  }
}