import { useState } from 'react';
import styles from './style.module.css';
import CounterInput from '@/extensionUtils/widgets/shared/CounterInput';
import type { TinkoffPrice } from '@/utils/api/tinkoffApi/TMarketDataServiceApi';
import { TinkoffPriceMath } from '@/utils/helpers';
import Dropdown, { type DropdownOptionType } from '@/extensionUtils/widgets/shared/Dropdown';
import Calendar from '@/extensionUtils/widgets/shared/Calendar';
import { Toggle } from '@/extensionUtils/widgets/shared/Toggle';

type TakeProfitTabComponentProps = {
    limits: {
        up: TinkoffPrice
        down: TinkoffPrice
    }
}

const tabPriceModeOptions: DropdownOptionType<"marketPrice" | "limitPrice">[] = [
    { value: "marketPrice", text: "Рыночное" },
    { value: "limitPrice", text: "Лимитное" },
]

type inputValueType = {
    activatePrice: number
    quantity: number
    limitPrice: number
    date: Date | null
    makeApplicationWhenClosed: boolean
}

const TakeProfitTabComponent = ({ limits }: TakeProfitTabComponentProps) => {

    const [tabPriceModeOption, setTabPriceModeOption] = useState<DropdownOptionType<"marketPrice" | "limitPrice"> | null>({ value: "marketPrice", text: "Рыночное" });
    const [inputValue, setInputValue] = useState<inputValueType>({
        activatePrice: 0,
        quantity: 1,
        limitPrice: 0,
        date: null,
        makeApplicationWhenClosed: false
    });

    return (
        <div className={styles['TakeProfitTabComponent']}>
            <div className={styles['TakeProfitTabComponent-fields']}>
                <div className={styles['TakeProfitTabComponent-field']}>
                    <p>Цена активации</p>
                    <CounterInput
                        value={inputValue.activatePrice}
                        onChange={value => { setInputValue({ ...inputValue, activatePrice: value }) }}
                        additionalInputElement={<span>₽</span>}
                        startValue={1}
                        minValue={1}
                        maxValue={1000000}
                        stepBy={100}
                    />
                </div>
                <div className={styles['TakeProfitTabComponent-field']}>
                    <p>Количество</p>
                    <CounterInput
                        value={inputValue.quantity}
                        onChange={value => { setInputValue({ ...inputValue, quantity: value }) }}
                        additionalInputElement={<span>x1</span>}
                        startValue={1}
                        minValue={1}
                        maxValue={500}
                        stepBy={1}
                    />
                </div>
                <div className={styles['TakeProfitTabComponent-field']}>
                    <p>
                        Исполнение
                    </p>
                    <Dropdown
                        optionsArr={tabPriceModeOptions}
                        setSelectedOption={setTabPriceModeOption}
                        selectedOption={tabPriceModeOption}
                    >
                        <Dropdown.Button
                            defaultText='Выберите страну'
                        // className={styles['Location-item-button']}
                        // textClassName='p-extralarge-regular'
                        />
                        <Dropdown.Menu
                        // className={styles['Location-item-menu']}
                        >
                            {tabPriceModeOptions.map((option, index) => (
                                <Dropdown.Menu.Item
                                    key={index}
                                    option={option}
                                // className={styles['Menu-item']}
                                />
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className={styles['TakeProfitTabComponent-field']}>
                    <p>Цена исполнения</p>
                    {tabPriceModeOption!.value === "marketPrice" ?
                        <CounterInput
                            additionalInputProps={{ id: "asdasdassada-marketPrice" }}
                            placeholder='По рыночной'
                            isInputDisabled={true}
                            additionalInputElement={<span>₽</span>}
                            startValue={1}
                            minValue={1}
                            maxValue={1000000}
                            stepBy={100} />


                        :
                        <CounterInput
                            allowDecimal={true}
                            additionalInputProps={{ id: "asdasdassada-limitPrice" }}
                            value={inputValue.limitPrice}
                            onChange={value => { setInputValue({ ...inputValue, limitPrice: value }) }}
                            additionalInputElement={<span>₽</span>}
                            startValue={1}
                            minValue={0}
                            maxValue={1000000}
                            stepBy={100}
                        />
                    }

                </div>
                <div className={styles['TakeProfitTabComponent-field']}>
                    <p>Дата отмены</p>
                    <Calendar onDateChange={value => { setInputValue({ ...inputValue, date: value }) }} />
                </div>
            </div>
            <Toggle label='Оставлять заявку при закрытии позиции' checked={inputValue.makeApplicationWhenClosed} onChange={value => { setInputValue({ ...inputValue, makeApplicationWhenClosed: value }) }} />
            {tabPriceModeOption!.value === "limitPrice" ?
                <p>Стоимость {inputValue.limitPrice * inputValue.quantity}</p>
                :
                <p>Примерная стоимость {inputValue.activatePrice * inputValue.quantity}</p>
            }

        </div>
    );
}

export default TakeProfitTabComponent;
