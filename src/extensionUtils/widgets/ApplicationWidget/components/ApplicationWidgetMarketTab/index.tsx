import type { findInstrumentResponse } from '@/utils/api/tinkoffApi/TInstrumentsApi';
import styles from './style.module.css';
import CounterInput from '@/extensionUtils/widgets/shared/CounterInput';

import { useState } from 'react';
import classNames from 'classnames';
import { TinkoffPriceMath } from '@/utils/helpers';

type ApplicationWidgetMarketTabProps = {
    price: {
        units: string,
        nano: number
    } | null,
    instrumentInfo: findInstrumentResponse | null,
    dayPriceDifference: {
        percentageDifference: string
        absoluteDifference: string
    }
}

const ApplicationWidgetMarketTab = ({ price, instrumentInfo, dayPriceDifference }: ApplicationWidgetMarketTabProps) => {



    const [inputValue, setInputValue] = useState(1);

    return (
        <div className={styles['ApplicationWidgetMarketTab']}>
            <div className={styles['ApplicationWidgetMarketTab-actions']}>
                <div className={styles['ApplicationWidgetMarketTab-actions-inputs']}>
                    <div className={styles['ApplicationWidgetMarketTab-actions-inputs-item']}>
                        <p>Цена исполнения</p>
                        <CounterInput placeholder='Рыночная' isInputDisabled={true} additionalInputElement={<span>₽</span>} startValue={1} minValue={1} maxValue={1000000} stepBy={100} />
                    </div>
                    <div className={styles['ApplicationWidgetMarketTab-actions-inputs-item']}>
                        <p>Количество</p>
                        <CounterInput additionalInputElement={<span>x1</span>} onChange={value => { setInputValue(value) }} startValue={1} minValue={1} maxValue={5000} stepBy={1} />
                    </div>
                </div>
                <div className={styles['ApplicationWidgetMarketTab-actions-prices']}>
                    <p>Примерная стоимость</p>
                    <p>{TinkoffPriceMath.toString(TinkoffPriceMath.multiplyByNumber(price!, inputValue))}&nbsp;₽</p>
                </div>

            </div>
        </div>
    );
}

export default ApplicationWidgetMarketTab;
