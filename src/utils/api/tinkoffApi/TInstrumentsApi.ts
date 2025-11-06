import { TINKOFF_API_URL } from "@/utils/consts/appConsts"
import type { AxiosInstance } from "axios"
import axios from "axios"
import { tinkoffSecuredAxiosApi } from "../tinkoffSecuredAxiosApi"


export type InstrumentStatusType = "INSTRUMENT_STATUS_UNSPECIFIED" | "INSTRUMENT_STATUS_BASE" | "INSTRUMENT_STATUS_ALL"
export type InstrumentExchangeType = "INSTRUMENT_EXCHANGE_UNSPECIFIED" | "INSTRUMENT_EXCHANGE_DEALER"


export class TInstrumentsApi {
  private api: AxiosInstance

  constructor() {
    this.api = tinkoffSecuredAxiosApi({
      api: axios.create({
        baseURL: `${TINKOFF_API_URL}/tinkoff.public.invest.api.contract.v1.InstrumentsService`
      })
    })
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
}