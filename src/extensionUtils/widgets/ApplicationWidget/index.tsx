import { useState } from 'react';
import styles from './style.module.css';
import classNames from 'classnames';
import ApplicationWidgetMarketTab from './components/ApplicationWidgetMarketTab';
import ApplicationWidgetLimitedTab from './components/ApplicationWidgetLimitedTab';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useTMarketDataServiceApi from '../shared/hooks/useTMarketDataServiceApi';




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
}

// "market" = рыночная
// "limited" = лимитная
// "iceberg" = айсберг
// "delayed" = отложенная
type ApplicationWidgetMode = "market" | "limited" | "iceberg" | "delayed"

const ApplicationWidgetContent = ({ ticker, terminalWidgetId, figi }: ApplicationWidgetProps) => {

    const [ApplicationWidgetMode, setApplicationWidgetMode] = useState<ApplicationWidgetMode>("market")

    const { queries: { getLastPrice } } = useTMarketDataServiceApi()
    
    const { data: lastPrice } = getLastPrice({ instrumentId: [figi!], })
    


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
                    {ApplicationWidgetMode === "market" && <ApplicationWidgetMarketTab />}
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
            <ApplicationWidgetContent {...props}/>
        </QueryClientProvider>
    );
};

export default ApplicationWidget;
