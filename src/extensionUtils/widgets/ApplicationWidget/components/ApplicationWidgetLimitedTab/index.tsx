import { useSessionStorageWatcher } from '@/extensionUtils/widgets/shared/hooks/useSessionStorageWatcher';
import type { findInstrumentResponse } from '@/utils/api/tinkoffApi/TInstrumentsApi';
import styles from './style.module.css';
import CounterInput from '@/extensionUtils/widgets/shared/CounterInput';
import { useState } from 'react';
import useTMarketDataServiceApi from '@/extensionUtils/widgets/shared/hooks/useTMarketDataServiceApi';
import { TinkoffPriceMath } from '@/utils/helpers';
import type { TinkoffPrice } from '@/utils/api/tinkoffApi/TMarketDataServiceApi';
type ApplicationWidgetLimitedTabProps = {
  instrumentInfo: findInstrumentResponse
  limits: {
    up: TinkoffPrice
    down: TinkoffPrice
  }
}

const ApplicationWidgetLimitedTab = ({ instrumentInfo, limits }: ApplicationWidgetLimitedTabProps) => {

  const [inputValue, setInputValue] = useState({
    marketPrice: 0,
    quantity: 1
  });
  console.log("marketPrice", inputValue.marketPrice);

  return (
    <div>
      <div className={styles['ApplicationWidgetMarketTab-actions-inputs-item']}>
        <p>Цена исполнения</p>
        <CounterInput
          allowDecimal={true}
          value={inputValue.marketPrice}
          onChange={value => { setInputValue({ ...inputValue, marketPrice: value }) }}
          additionalInputElement={<span>₽</span>}
          startValue={0}
          minValue={TinkoffPriceMath.toNumber(limits.down)}
          maxValue={TinkoffPriceMath.toNumber(limits.up)}
          stepBy={100} />
      </div>
      <div className={styles['ApplicationWidgetMarketTab-actions-inputs-item']}>
        <p>Количество</p>
        <CounterInput additionalInputElement={<span>x1</span>} value={inputValue.quantity} onChange={value => { setInputValue({ ...inputValue, quantity: value }) }} startValue={1} minValue={1} maxValue={5000} stepBy={1} />
      </div>
      <p>Доступна цена от {TinkoffPriceMath.toString(limits.down)} до {TinkoffPriceMath.toString(limits.up)}</p>
      <p>Примерная стоимость {inputValue.marketPrice * inputValue.quantity}</p>
    </div>
  );
};

export default ApplicationWidgetLimitedTab;
