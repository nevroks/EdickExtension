import type { findInstrumentResponse } from '@/utils/api/tinkoffApi/TInstrumentsApi';
import styles from './style.module.css';
import CounterInput from '@/extensionUtils/widgets/shared/CounterInput';
import { convertPriceFromNano } from '@/utils/helpers';
import { useState } from 'react';
import classNames from 'classnames';

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

    const convertedPrice = convertPriceFromNano(price || { units: "0", nano: 0 });
    const [showDifferenceIn, setShowDifferenceIn] = useState<"percentage" | "currency">("currency")

    const isPriceDifferenceNegative = dayPriceDifference.absoluteDifference[0] === "-";

    return (
        <div className={styles['ApplicationWidgetMarketTab']}>

            <div className={styles['ApplicationWidgetMarketTab-ticket']}>
                {instrumentInfo ? <>
                    <div className={styles['ApplicationWidgetMarketTab-ticket-name']}>
                        <p>{instrumentInfo.instruments[0].name}</p>
                        <p>Наличие в портфеле</p>
                    </div>
                    <div className={styles['ApplicationWidgetMarketTab-ticket-price']}>
                        <p className={classNames(styles['ApplicationWidgetMarketTab-ticket-price-value'])}>{convertedPrice}</p>
                        <p
                            className={classNames(styles['ApplicationWidgetMarketTab-ticket-price-difference'], {
                                [styles['negative']]: isPriceDifferenceNegative
                            })}
                            onClick={() => {
                                if (showDifferenceIn === "percentage") {
                                    setShowDifferenceIn("currency")
                                } else {
                                    setShowDifferenceIn("percentage")
                                }
                            }}>
                                ≈
                            {showDifferenceIn === "percentage" ? dayPriceDifference.percentageDifference : dayPriceDifference.absoluteDifference}
                            {showDifferenceIn === "percentage" ? "%" : "Rub"}
                        </p>
                    </div>

                </>
                    :
                    <p>Выберите инструмент</p>
                }

            </div>
            <div className={styles['ApplicationWidgetMarketTab-actions']}>
                <div className={styles['ApplicationWidgetMarketTab-actions-inputs']}>
                    <div className={styles['ApplicationWidgetMarketTab-actions-inputs-item']}>
                        <p>Цена исполнения</p>
                        <CounterInput isInputDisabled={true} additionalInputElement={<span>Rub</span>} startValue={1} minValue={1} maxValue={1000000} stepBy={100} />
                    </div>
                    <div className={styles['ApplicationWidgetMarketTab-actions-inputs-item']}>
                        <p>Количество</p>
                        <CounterInput additionalInputElement={<span>x1</span>} startValue={1} minValue={1} maxValue={5000} stepBy={1} />
                    </div>

                </div>

            </div>
        </div>
    );
}

export default ApplicationWidgetMarketTab;
