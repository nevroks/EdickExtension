import { useState } from 'react';
import styles from './style.module.css';
import TakeProfitTabComponent from './TakeProfitTabComponent';
import type { TinkoffPrice } from '@/utils/api/tinkoffApi/TMarketDataServiceApi';
import classNames from 'classnames';
import StopLossTabComponent from './StopLossTabComponent';
import TrailingStopTabComponent from './TrailingStopTabComponent';
import type { findInstrumentResponse } from '@/utils/api/tinkoffApi/TInstrumentsApi';
import { TinkoffPriceMath } from '@/utils/helpers';

type ApplicationWidgetDelayedTabProps = {
    limits: {
        up: TinkoffPrice
        down: TinkoffPrice
    },
    lastPrice: TinkoffPrice
}

const ApplicationWidgetDelayedTab = ({ limits, lastPrice }: ApplicationWidgetDelayedTabProps) => {

    const [tabMode, setTabMode] = useState<"takeProfit" | "stopLoss" | "trailingStop">("takeProfit");



    return (
        <div className={styles['ApplicationWidgetDelayedTab']}>
            <div className={styles['ApplicationWidgetDelayedTab-nav']}>
                <div onClick={() => setTabMode("takeProfit")} className={classNames(styles['ApplicationWidgetDelayedTab-nav-item'], {
                    [styles['active']]: tabMode === "takeProfit"
                })}>
                    <p>Тейк-профит</p>
                </div>
                <div onClick={() => setTabMode("stopLoss")} className={classNames(styles['ApplicationWidgetDelayedTab-nav-item'], {
                    [styles['active']]: tabMode === "stopLoss"
                })}>
                    <p>Стоп-лосс</p>
                </div>
                <div onClick={() => setTabMode("trailingStop")} className={classNames(styles['ApplicationWidgetDelayedTab-nav-item'], {
                    [styles['active']]: tabMode === "trailingStop"
                })}>
                    <p>Трейлинг стоп</p>
                </div>
            </div>
            <div className={styles['ApplicationWidgetDelayedTab-content']}>
                {tabMode === "takeProfit" && <TakeProfitTabComponent limits={limits} />}
                {tabMode === "stopLoss" && <StopLossTabComponent />}
                {tabMode === "trailingStop" && <TrailingStopTabComponent price={lastPrice} />}
            </div>

        </div>
    );
}

export default ApplicationWidgetDelayedTab;
