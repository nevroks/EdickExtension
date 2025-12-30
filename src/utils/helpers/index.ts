import type { TinkoffPrice } from "../api/tinkoffApi/TMarketDataServiceApi";


export function convertPriceFromNano(
  { units, nano }: TinkoffPrice, 
  decimals: 0 | 1 | 2 | undefined = 2
): string {
  const unitsNum = parseInt(units, 10);
  const value = unitsNum + (nano / 1_000_000_000);
  
  return value.toFixed(decimals);
}

// Использование:
// const price = { units: "71", nano: 900_000_000 };
// const result = convertPrice(price); // 71.9