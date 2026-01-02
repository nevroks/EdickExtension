import type { TinkoffPrice } from "../api/tinkoffApi/TMarketDataServiceApi";

class TinkoffPriceCalculator {
  private static readonly NANO_DIVISOR = 1000000000n; // 1_000_000_000 без подчеркиваний

  /**
   * Конвертирует TinkoffPrice в BigInt (нано)
   */
  private static toNano(price: TinkoffPrice): bigint {
    const units = BigInt(price.units);
    const nano = BigInt(price.nano);
    return units * this.NANO_DIVISOR + nano;
  }

  /**
   * Конвертирует BigInt (нано) обратно в TinkoffPrice
   */
  private static fromNano(totalNano: bigint): TinkoffPrice {
    const units = (totalNano / this.NANO_DIVISOR).toString();
    const nano = Number(totalNano % this.NANO_DIVISOR);

    return { units, nano };
  }

  /**
   * Сложение двух цен
   */
  static add(a: TinkoffPrice, b: TinkoffPrice): TinkoffPrice {
    const aNano = this.toNano(a);
    const bNano = this.toNano(b);
    const resultNano = aNano + bNano;

    return this.fromNano(resultNano);
  }

  /**
   * Вычитание цен
   */
  static subtract(a: TinkoffPrice, b: TinkoffPrice): TinkoffPrice {
    const aNano = this.toNano(a);
    const bNano = this.toNano(b);
    const resultNano = aNano - bNano;

    return this.fromNano(resultNano);
  }

  /**
   * Умножение цены на число
   */
  static multiply(price: TinkoffPrice, multiplier: number): TinkoffPrice {
    const priceNano = this.toNano(price);

    // Для умножения на число с плавающей точкой используем округление
    const resultNano = BigInt(Math.round(Number(priceNano) * multiplier));

    return this.fromNano(resultNano);
  }

  /**
   * Деление цены на число
   */
  static divide(price: TinkoffPrice, divisor: number): TinkoffPrice {
    if (divisor === 0) {
      throw new Error('Division by zero');
    }

    const priceNano = this.toNano(price);
    const resultNano = BigInt(Math.round(Number(priceNano) / divisor));

    return this.fromNano(resultNano);
  }

  /**
   * Умножение двух цен (получаем площадь)
   */
  static multiplyPrices(a: TinkoffPrice, b: TinkoffPrice): TinkoffPrice {
    const aNano = this.toNano(a);
    const bNano = this.toNano(b);

    // Умножение больших чисел - переводим в квадратные нано
    const resultNano = aNano * bNano / this.NANO_DIVISOR;

    return this.fromNano(resultNano);
  }

  /**
   * Деление двух цен (получаем коэффициент)
   */
  static dividePrices(a: TinkoffPrice, b: TinkoffPrice): number {
    const bNano = this.toNano(b);
    if (bNano === 0n) {
      throw new Error('Division by zero');
    }

    const aNano = this.toNano(a);
    return Number(aNano) / Number(bNano);
  }

  /**
   * Сравнение цен
   */
  static compare(a: TinkoffPrice, b: TinkoffPrice): number {
    const aNano = this.toNano(a);
    const bNano = this.toNano(b);

    if (aNano > bNano) return 1;
    if (aNano < bNano) return -1;
    return 0;
  }

  /**
   * Абсолютное значение
   */
  static abs(price: TinkoffPrice): TinkoffPrice {
    // Проверяем отрицательные значения
    const unitsNum = parseInt(price.units, 10);
    const isNegative = unitsNum < 0 || price.nano < 0;

    if (!isNegative) {
      return price;
    }

    const units = Math.abs(unitsNum).toString();
    const nano = Math.abs(price.nano);

    return { units, nano };
  }

  /**
   * Сумма массива цен
   */
  static sum(prices: TinkoffPrice[]): TinkoffPrice {
    if (prices.length === 0) {
      return { units: "0", nano: 0 };
    }

    return prices.reduce((acc, price) => this.add(acc, price), {
      units: "0",
      nano: 0
    });
  }

  /**
   * Среднее значение массива цен
   */
  static average(prices: TinkoffPrice[]): TinkoffPrice {
    if (prices.length === 0) {
      return { units: "0", nano: 0 };
    }

    const total = this.sum(prices);
    return this.divide(total, prices.length);
  }

  /**
   * Конвертирует в число с заданной точностью
   */
  static toNumber(price: TinkoffPrice, decimals: 0 | 1 | 2 | 3 | 4 = 2): number {
    const unitsNum = parseInt(price.units, 10);
    const value = unitsNum + (price.nano / 1000000000); // 1_000_000_000 без подчеркиваний

    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /**
   * Конвертирует в строку с заданной точностью
   */
  static toString(price: TinkoffPrice, decimals: 0 | 1 | 2 = 2): string {
    return this.toNumber(price, decimals).toFixed(decimals);
  }
}

// Функциональный подход
export const TinkoffPriceMath = {
  add: (a: TinkoffPrice, b: TinkoffPrice): TinkoffPrice => {
    return TinkoffPriceCalculator.add(a, b);
  },

  subtract: (a: TinkoffPrice, b: TinkoffPrice): TinkoffPrice => {
    return TinkoffPriceCalculator.subtract(a, b);
  },

  multiplyByNumber: (price: TinkoffPrice, multiplier: number): TinkoffPrice => {
    return TinkoffPriceCalculator.multiply(price, multiplier);
  },

  divide: (price: TinkoffPrice, divisor: number): TinkoffPrice => {
    return TinkoffPriceCalculator.divide(price, divisor);
  },

  toNumber: (price: TinkoffPrice, decimals?: 0 | 1 | 2 | 3 | 4): number => {
    return TinkoffPriceCalculator.toNumber(price, decimals);
  },

  toString: (price: TinkoffPrice, decimals: 0 | 1 | 2 = 2): string => {
    return TinkoffPriceCalculator.toString(price, decimals);
  }
};

// Декоратор для цепочных вычислений
// export class TinkoffPriceWrapper {
//   private price: TinkoffPrice;

//   constructor(price: TinkoffPrice) {
//     this.price = price;
//   }

//   add(other: TinkoffPrice | TinkoffPriceWrapper): TinkoffPriceWrapper {
//     const otherPrice = other instanceof TinkoffPriceWrapper ? other.price : other;
//     this.price = TinkoffPriceCalculator.add(this.price, otherPrice);
//     return this;
//   }

//   subtract(other: TinkoffPrice | TinkoffPriceWrapper): TinkoffPriceWrapper {
//     const otherPrice = other instanceof TinkoffPriceWrapper ? other.price : other;
//     this.price = TinkoffPriceCalculator.subtract(this.price, otherPrice);
//     return this;
//   }

//   multiply(multiplier: number): TinkoffPriceWrapper {
//     this.price = TinkoffPriceCalculator.multiply(this.price, multiplier);
//     return this;
//   }

//   divide(divisor: number): TinkoffPriceWrapper {
//     this.price = TinkoffPriceCalculator.divide(this.price, divisor);
//     return this;
//   }

//   toNumber(decimals?: 0 | 1 | 2 | 3 | 4): number {
//     return TinkoffPriceCalculator.toNumber(this.price, decimals);
//   }

//   toString(decimals: 0 | 1 | 2 = 2): string {
//     return TinkoffPriceCalculator.toString(this.price, decimals);
//   }

//   value(): TinkoffPrice {
//     return this.price;
//   }

//   // Фабричный метод
//   static from(price: TinkoffPrice): TinkoffPriceWrapper {
//     return new TinkoffPriceWrapper(price);
//   }

//   // Создание из обычного числа
//   static fromNumber(value: number): TinkoffPriceWrapper {
//     const units = Math.floor(value).toString();
//     const nano = Math.round((value - Math.floor(value)) * 1000000000); // 1_000_000_000 без подчеркиваний

//     return new TinkoffPriceWrapper({ units, nano });
//   }
// }

// Вспомогательные утилиты
// export const TinkoffPriceUtils = {
//   /**
//    * Проверка на равенство цен
//    */
//   equals: (a: TinkoffPrice, b: TinkoffPrice): boolean => {
//     return TinkoffPriceCalculator.compare(a, b) === 0;
//   },

//   /**
//    * Проверка, больше ли цена
//    */
//   isGreaterThan: (a: TinkoffPrice, b: TinkoffPrice): boolean => {
//     return TinkoffPriceCalculator.compare(a, b) > 0;
//   },

//   /**
//    * Проверка, меньше ли цена
//    */
//   isLessThan: (a: TinkoffPrice, b: TinkoffPrice): boolean => {
//     return TinkoffPriceCalculator.compare(a, b) < 0;
//   },

//   /**
//    * Создание цены из числа
//    */
//   fromNumber: (value: number): TinkoffPrice => {
//     const units = Math.floor(value).toString();
//     const nano = Math.round((value - Math.floor(value)) * 1000000000);

//     // Обработка отрицательных значений
//     if (value < 0 && nano > 0) {
//       return {
//         units: (-Math.abs(Math.floor(value))).toString(),
//         nano: -nano
//       };
//     }

//     return { units, nano };
//   },

//   /**
//    * Проверка на валидность
//    */
//   isValid: (price: TinkoffPrice): boolean => {
//     try {
//       // Проверяем что units можно распарсить
//       const unitsNum = parseInt(price.units, 10);
//       if (isNaN(unitsNum)) return false;

//       // Проверяем диапазон nano
//       if (price.nano < -1000000000 || price.nano > 1000000000) return false;

//       return true;
//     } catch {
//       return false;
//     }
//   }
// };