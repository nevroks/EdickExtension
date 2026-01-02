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
import { useSessionStorageWatcher } from '../shared/hooks/useSessionStorageWatcher';
import { TinkoffPriceMath } from '@/utils/helpers';




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


    const { parsedValue, _unparsedValue } = useSessionStorageWatcher<{
        accountId: string
        activeSpaceId: string
        activeSpaceStatus: string
        balanceSettings: {
            currency: string
            isDaily: boolean
        }
        strategyId: string
        ui: {
            isAddSpaceDialogShown: boolean
        }
    }>('nonShared');

    const [ApplicationWidgetMode, setApplicationWidgetMode] = useState<ApplicationWidgetMode>("market")
    const [showDifferenceIn, setShowDifferenceIn] = useState<"percentage" | "currency">("currency")
    // console.log(figi);
    // console.log(assetUid);



    const { queries: { getOrderBook, getClosePrices } } = useTMarketDataServiceApi()
    const { queries: { getInstrument } } = useTInstrumentsApi()
    const { queries: { getPortfolio } } = useTOperationsServiceApi()


    const { data: orderBook } = getOrderBook({ instrumentId: figi! })
    const { data: instrumentInfo } = getInstrument({ instrumentUid: figi! })
    const { data: closePrices } = getClosePrices({ instrumentId: [figi!] })
    // console.log("parsed:", parsedValue);

    const { data: portfolio } = getPortfolio({ accountId: parsedValue?.accountId! })


    const dayPriceDifference = useMemo(() => {
        if (!orderBook || !closePrices) {
            return {
                percentageDifference: "0.00",
                absoluteDifference: "0.00",
                isPriceDifferenceNegative: false
            }
        }
        const diffNano = TinkoffPriceMath.subtract(
            orderBook.lastPrice,
            {
                units: closePrices.closePrices[0].eveningSessionPrice.units,
                nano: closePrices.closePrices[0].eveningSessionPrice.nano
            }
        )

        // 1. Абсолютная разница (переводим в число в конце)
        const absoluteDifference = TinkoffPriceMath.toNumber(diffNano);

        // 2. Процентная разница (работаем с целыми числами до конца!)
        const percentTimes10000 = (absoluteDifference * 10000) / TinkoffPriceMath.toNumber(closePrices.closePrices[0].eveningSessionPrice);

        // Делим на 100 чтобы получить проценты
        const percentageDifference = percentTimes10000 / 100;

        const isPriceDifferenceNegative = absoluteDifference.toFixed(2)[0] === "-";

        return {
            isPriceDifferenceNegative: isPriceDifferenceNegative,
            percentageDifference: percentageDifference.toFixed(2),
            absoluteDifference: absoluteDifference.toFixed(2)
        }

    }, [closePrices?.closePrices[0].eveningSessionPrice.nano, closePrices?.closePrices[0].eveningSessionPrice.units, orderBook?.lastPrice.nano, orderBook?.lastPrice.units])
    // console.log(portfolio);

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
            <div className={styles['ApplicationWidget-ticket']}>
                {instrumentInfo && orderBook ? <>
                    <div className={styles['ApplicationWidget-ticket-name']}>
                        <p>{instrumentInfo.instruments[0].name}</p>
                        <p>Наличие в портфеле</p>
                    </div>
                    <div className={styles['ApplicationWidget-ticket-price']}>
                        <p className={classNames(styles['ApplicationWidget-ticket-price-value'])}>{TinkoffPriceMath.toString(orderBook!.lastPrice)}&nbsp;₽</p>
                        <p
                            className={classNames(styles['ApplicationWidget-ticket-price-difference'], {
                                [styles['negative']]: dayPriceDifference.isPriceDifferenceNegative
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
                    <p>
                        Выберите инструмент
                    </p>
                }

            </div>
            <div className={styles['ApplicationWidget-content']}>

                {
                    !figi && <div>Выберите инструмент</div>
                }
                {instrumentInfo && !instrumentInfo.instruments[0].apiTradeAvailableFlag && <p>Мы сожалеем, но тинькофф не позволяет торговать этим инструментом через веб терминал.</p>}
                {ApplicationWidgetMode === "market" && figi && instrumentInfo && <ApplicationWidgetMarketTab
                    instrumentInfo={instrumentInfo!}
                    price={orderBook!.lastPrice}
                    dayPriceDifference={dayPriceDifference}
                />
                }
                {ApplicationWidgetMode === "limited" && figi && instrumentInfo && <ApplicationWidgetLimitedTab
                    limits={{
                        up: orderBook!.limitUp,
                        down: orderBook!.limitDown
                    }}
                    instrumentInfo={instrumentInfo!}
                />}
                {ApplicationWidgetMode === "iceberg" && figi && instrumentInfo && <div>Айсберг</div>}
                {ApplicationWidgetMode === "delayed" && figi && instrumentInfo && <div>Отложенная</div>}
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
