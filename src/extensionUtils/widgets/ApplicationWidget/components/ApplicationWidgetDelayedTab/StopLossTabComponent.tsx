import React, { useState } from 'react';
import styles from './style.module.css'
import CounterInput from '@/extensionUtils/widgets/shared/CounterInput';
import Dropdown, { type DropdownOptionType } from '@/extensionUtils/widgets/shared/Dropdown';
import Calendar from '@/extensionUtils/widgets/shared/Calendar';
import { Toggle } from '@/extensionUtils/widgets/shared/Toggle';

type inputValueType = {
    activatePrice: number
    quantity: number
    limitPrice: number
    date: Date | null
    makeApplicationWhenClosed: boolean
}
const tabPriceModeOptions: DropdownOptionType<"marketPrice" | "limitPrice">[] = [
    { value: "marketPrice", text: "Рыночное" },
    { value: "limitPrice", text: "Лимитное" },
]
const StopLossTabComponent = () => {
    const [tabPriceModeOption, setTabPriceModeOption] = useState<DropdownOptionType<"marketPrice" | "limitPrice"> | null>({ value: "marketPrice", text: "Рыночное" });

    const [inputValues, setInputValues] = useState<inputValueType>({
        activatePrice: 0,
        quantity: 1,
        limitPrice: 0,
        date: null,
        makeApplicationWhenClosed: false
    });

    return (
        <div className={styles['StopLossTabComponent']}>
            <div className={styles['StopLossTabComponent-fields']}>
                <div className={styles['StopLossTabComponent-fields-item']}>
                    <p>Цена активации</p>
                    <CounterInput
                        value={inputValues.activatePrice}
                        onChange={value => { setInputValues({ ...inputValues, activatePrice: value }) }}
                        additionalInputElement={<span>₽</span>}
                        startValue={1}
                        minValue={1}
                        maxValue={1000000}
                        stepBy={100}
                    />
                </div>
                <div className={styles['StopLossTabComponent-fields-item']}>
                    <p>Количество</p>
                    <CounterInput
                        value={inputValues.quantity}
                        onChange={value => { setInputValues({ ...inputValues, quantity: value }) }}
                        additionalInputElement={<span>x1</span>}
                        startValue={1}
                        minValue={1}
                        maxValue={500}
                        stepBy={1}
                    />
                </div>
                <div className={styles['StopLossTabComponent-fields-item']}>
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
                <div className={styles['StopLossTabComponent-fields-item']}>
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
                            value={inputValues.limitPrice}
                            onChange={value => { setInputValues({ ...inputValues, limitPrice: value }) }}
                            additionalInputElement={<span>₽</span>}
                            startValue={1}
                            minValue={0}
                            maxValue={1000000}
                            stepBy={100}
                        />
                    }
                </div>
                <div className={styles['StopLossTabComponent-fields-item']}>
                    <p>Дата отмены</p>
                    <Calendar onDateChange={value => { setInputValues({ ...inputValues, date: value }) }} />
                </div>

            </div>
            <Toggle label='Оставлять заявку при закрытии позиции' checked={inputValues.makeApplicationWhenClosed} onChange={value => { setInputValues({ ...inputValues, makeApplicationWhenClosed: value }) }} />
            {tabPriceModeOption!.value === "limitPrice" ?
                <p>Стоимость {inputValues.limitPrice * inputValues.quantity}</p>
                :
                <p>Примерная стоимость {inputValues.activatePrice * inputValues.quantity}</p>
            }
        </div>
    );
}

export default StopLossTabComponent;
