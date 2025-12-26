import styles from './style.module.css';
import CounterInput from '@/extensionUtils/widgets/shared/CounterInput';

const ApplicationWidgetMarketTab = () => {
    return (
        <div className={styles['ApplicationWidgetMarketTab']}>
            <div className={styles['ApplicationWidgetMarketTab-ticket']}></div>
            <div className={styles['ApplicationWidgetMarketTab-actions']}>
                <div className={styles['ApplicationWidgetMarketTab-actions-inputs']}>
                    <div className={styles['ApplicationWidgetMarketTab-actions-inputs-item']}>
                        <p>Цена исполнения</p>
                        <CounterInput isInputDisabled={true} additionalInputElement={<span>Rub</span>} startValue={1} minValue={1} maxValue={1000000} stepBy={100}/>    
                    </div>
                    <div className={styles['ApplicationWidgetMarketTab-actions-inputs-item']}>
                        <p>Количество</p>
                        <CounterInput additionalInputElement={<span>x1</span>} startValue={1} minValue={1} maxValue={5000} stepBy={1}/>    
                    </div>
                    
                </div>

            </div>
        </div>
    );
}

export default ApplicationWidgetMarketTab;
