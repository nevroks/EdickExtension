import React, { useMemo } from 'react';
import styles from './style.module.css';
import { TinkoffPriceMath } from '@/utils/helpers';
import type { BidsAsks } from '@/utils/api/tinkoffApi/TMarketDataServiceApi';

type BidsAsksProps = {
    asks: BidsAsks
    bids: BidsAsks
}

const BidsAsksComponent = ({ bids, asks }: BidsAsksProps) => {

    const bidsAndAsksValues = useMemo(() => {

        const totalCount = Number(bids.quantity) + Number(asks.quantity);
        const bidsPercentage = (Number(bids.quantity) / totalCount * 100).toFixed(1)
        const asksPercentage = (Number(asks.quantity) / totalCount * 100).toFixed(1)

        return {
            totalCount,
            bidsPercentage,
            asksPercentage
        }
    }, [JSON.stringify(bids), JSON.stringify(asks)])

    return (
        <div className={styles['ApplicationWidget-bid-ask']}>
            <div className={styles['ApplicationWidget-bid-ask-values']}>
                <div style={{ width: `${bidsAndAsksValues.bidsPercentage}%`, paddingRight: '5px' }} className={styles['ApplicationWidget-bid-ask-item']}>
                    <p>{TinkoffPriceMath.toString(bids.price)}&nbsp;₽</p>
                    <p>Покупка {bidsAndAsksValues.bidsPercentage}% ({bids.quantity})</p>
                </div>
                <div style={{ width: `${bidsAndAsksValues.asksPercentage}%`, paddingLeft: '5px' }} className={styles['ApplicationWidget-bid-ask-item']}>
                    <p>Продажа {bidsAndAsksValues.asksPercentage}% ({asks.quantity})</p>
                    <p>{TinkoffPriceMath.toString(asks.price)}&nbsp;₽</p>
                </div>
            </div>
            <div className={styles['ApplicationWidget-bid-ask-progress']}>
                <div className={styles['ApplicationWidget-bid-ask-progress-line-bid']} style={{ width: `${bidsAndAsksValues.bidsPercentage}%` }}></div>
                <div className={styles['ApplicationWidget-bid-ask-progress-line-ask']} style={{ width: `${bidsAndAsksValues.asksPercentage}%` }}></div>
            </div>

        </div>
    );
}

export default BidsAsksComponent;
