import { useMemo, useState } from 'react';
import styles from './style.module.css';
import classNames from 'classnames';
import ApplicationWidgetMarketTab from './components/ApplicationWidgetMarketTab';
import ApplicationWidgetLimitedTab from './components/ApplicationWidgetLimitedTab';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useTMarketDataServiceApi from '../shared/hooks/useTMarketDataServiceApi';
import useTInstrumentsApi from '../shared/hooks/useTInstrumentsApi';
import type { TinkoffPrice } from '@/utils/api/tinkoffApi/TMarketDataServiceApi';
import useTUsersServiceApi from '../shared/hooks/useTUsersServiceApi';
import useTOperationsServiceApi from '../shared/hooks/useTOperationsServiceApi';




const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});


export type ApplicationWidgetProps = {
    ticker: string;
    terminalWidgetId: string;
    figi?: string
    assetUid?: string
}

// "market" = рыночная
// "limited" = лимитная
// "iceberg" = айсберг
// "delayed" = отложенная
type ApplicationWidgetMode = "market" | "limited" | "iceberg" | "delayed"

const ApplicationWidgetContent = ({ ticker, terminalWidgetId, figi, assetUid }: ApplicationWidgetProps) => {

    const [ApplicationWidgetMode, setApplicationWidgetMode] = useState<ApplicationWidgetMode>("market")

    // console.log(figi);
    // console.log(assetUid);



    const { queries: { getLastPrice, getClosePrices } } = useTMarketDataServiceApi()
    const { queries: { getInstrument } } = useTInstrumentsApi()
    const { queries: { getInfo } } = useTUsersServiceApi()
    const { queries: { getPortfolio } } = useTOperationsServiceApi()

    const { data: userInfo } = getInfo()
    const { data: lastPrice } = getLastPrice({ instrumentId: [figi!] })
    const { data: instrumentInfo } = getInstrument({ instrumentUid: figi! })
    const { data: closePrices } = getClosePrices({ instrumentId: [figi!] })
    console.log(userInfo);
    
    const { data: portfolio } = getPortfolio({ accountId: userInfo?.userId })


    const dayPriceDifference = useMemo(() => {
        if (!lastPrice || !closePrices) {
            return {
                percentageDifference: "0.00",
                absoluteDifference: "0.00"
            }
        }

        // Конвертируем ВСЁ в нано (целые числа, без потери точности)
        const toTotalNano = (price: TinkoffPrice): bigint => {
            // Используем BigInt для больших чисел
            const units = BigInt(price.units);
            const nano = BigInt(price.nano);
            return units * 1_000_000_000n + nano;
        };

        const currentTotalNano = toTotalNano({
            units: lastPrice.lastPrices[0].price.units,
            nano: lastPrice.lastPrices[0].price.nano
        });

        const previousTotalNano = toTotalNano({
            units: closePrices.closePrices[0].eveningSessionPrice.units,
            nano: closePrices.closePrices[0].eveningSessionPrice.nano
        });

        // Разница в нано (целое число, без потери точности)
        const diffNano = currentTotalNano - previousTotalNano;

        // 1. Абсолютная разница (переводим в число в конце)
        const absoluteDifference = Number(diffNano) / 1_000_000_000;

        // 2. Процентная разница (работаем с целыми числами до конца!)
        // Формула: ((current - previous) / previous) * 100
        // Умножаем на 10000 чтобы получить проценты с 2 знаками после запятой
        const percentTimes10000 = Number(diffNano * 10_000n) / Number(previousTotalNano);

        // Делим на 100 чтобы получить проценты
        const percentageDifference = percentTimes10000 / 100;

        return {
            percentageDifference: percentageDifference.toFixed(2),
            absoluteDifference: absoluteDifference.toFixed(2)
        }

    }, [closePrices?.closePrices[0].eveningSessionPrice.nano, closePrices?.closePrices[0].eveningSessionPrice.units, lastPrice?.lastPrices[0].price.nano, lastPrice?.lastPrices[0].price.units])
    console.log(portfolio);
    
    // console.log(portfolio?.positions.forEach(position => {
    //     if (position.figi === figi) {
    //         console.log("found:", position);
    //     }
    // }));


    // console.log(lastPrice);
    // console.log(instrumentInfo);




    return (
        <div className={styles['ApplicationWidget']}>
            <div className={styles['ApplicationWidget-tabs']}>
                <p onClick={() => setApplicationWidgetMode("market")} className={classNames(styles['ApplicationWidget-tabs-item'], {
                    [styles['active']]: ApplicationWidgetMode === "market"
                })}>Рыночная</p>
                <p onClick={() => setApplicationWidgetMode("limited")} className={classNames(styles['ApplicationWidget-tabs-item'], {
                    [styles['active']]: ApplicationWidgetMode === "limited"
                })}>Лимитная</p>
                <p onClick={() => setApplicationWidgetMode("iceberg")} className={classNames(styles['ApplicationWidget-tabs-item'], {
                    [styles['active']]: ApplicationWidgetMode === "iceberg"
                })}>Айсберг</p>
                <p onClick={() => setApplicationWidgetMode("delayed")} className={classNames(styles['ApplicationWidget-tabs-item'], {
                    [styles['active']]: ApplicationWidgetMode === "delayed"
                })}>Отложенная</p>
            </div>
            <div className={styles['ApplicationWidget-content']}>
                {ApplicationWidgetMode === "market" && <ApplicationWidgetMarketTab
                    instrumentInfo={instrumentInfo || null}
                    price={lastPrice ? lastPrice.lastPrices[0].price : null}
                    dayPriceDifference={dayPriceDifference}
                />
                }
                {ApplicationWidgetMode === "limited" && <ApplicationWidgetLimitedTab />}
                {ApplicationWidgetMode === "iceberg" && <div>Айсберг</div>}
                {ApplicationWidgetMode === "delayed" && <div>Отложенная</div>}
            </div>
        </div>
    );
}

const ApplicationWidget = ({ ...props }: ApplicationWidgetProps) => {
    return (
        <QueryClientProvider client={queryClient}>
            <ApplicationWidgetContent {...props} />
        </QueryClientProvider>
    );
};

export default ApplicationWidget;
