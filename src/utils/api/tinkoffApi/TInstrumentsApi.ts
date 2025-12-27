import { TINKOFF_API_URL } from "@/utils/consts/appConsts"
import type { AxiosInstance } from "axios"
import axios from "axios"
import { TinkoffAppGuard } from "../TinkoffAppGuard"



export type InstrumentStatusType = "INSTRUMENT_STATUS_UNSPECIFIED" | "INSTRUMENT_STATUS_BASE" | "INSTRUMENT_STATUS_ALL"
export type InstrumentExchangeType = "INSTRUMENT_EXCHANGE_UNSPECIFIED" | "INSTRUMENT_EXCHANGE_DEALER"


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
}


@TinkoffAppGuard
export class TinkoffAppSecuredTTInstrumentsApi extends TInstrumentsApi {
  constructor() {
    super(`${TINKOFF_API_URL}/tinkoff.public.invest.api.contract.v1.InstrumentsService`);
  }
}