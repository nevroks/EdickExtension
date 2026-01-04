import React, { useState } from 'react';
import style from './style.module.css';
import type { DropdownOptionType } from '@/extensionUtils/widgets/shared/Dropdown';
import CounterInput from '@/extensionUtils/widgets/shared/CounterInput';
import Dropdown from '@/extensionUtils/widgets/shared/Dropdown';
import { Toggle } from '@/extensionUtils/widgets/shared/Toggle';
import type { TinkoffPrice } from '@/utils/api/tinkoffApi/TMarketDataServiceApi';
import { TinkoffPriceMath } from '@/utils/helpers';

type inputValueType = {
    priceStep: number // отступ от цены
    quantity: number
    priceActivation: number
    defensiveSpread: number
    makeApplicationWhenClosed: boolean
}
const tabActivationModeOptions: DropdownOptionType<"delayed" | "instantly">[] = [
    { value: "delayed", text: "Отложенная" },
    { value: "instantly", text: "Немедленная" },
]

const tabApplicationPerformanceTypeOptions: DropdownOptionType<"marketPrice" | "limitPrice">[] = [
    { value: "marketPrice", text: "Рыночное" },
    { value: "limitPrice", text: "Лимитное" },
]

const calcPrice = (priceStepViewUnits: "percents" | "rubles", priceStep: number, priceActivation: number, quantity: number, marketPrice: TinkoffPrice, tabActivationModeOptionValue: "delayed" | "instantly") => {

    let firstDigit = ""
    let secondDegit = ""

    if (priceStepViewUnits === "percents") {

    }
    if (priceStepViewUnits === "rubles") {
        switch (tabActivationModeOptionValue) {
            case "delayed":
                return TinkoffPriceMath.toNumber(marketPrice) - priceStep
            case "instantly":
                return TinkoffPriceMath.toNumber(marketPrice)
        }
    }





    return {
        firstDigit,
        secondDegit
    }
}

type TrailingStopTabComponentProps = {
    price: TinkoffPrice
}

const TrailingStopTabComponent = ({ price: marketPrice }: TrailingStopTabComponentProps) => {

    const [tabActivationModeOption, setTabActivationModeOption] = useState<DropdownOptionType<"delayed" | "instantly"> | null>({ value: "instantly", text: "Немедленная" });
    const [tabApplicationPerformanceTypeOption, setTabApplicationPerformanceTypeOption] = useState<DropdownOptionType<"marketPrice" | "limitPrice"> | null>({ value: "marketPrice", text: "Рыночное" });

    const [inputValues, setInputValues] = useState<inputValueType>({
        priceStep: 0,
        quantity: 1,
        priceActivation: 0,
        defensiveSpread: 0,
        makeApplicationWhenClosed: false
    });

    const [viewUnits, setViewUnits] = useState<{
        priceStep: "percents" | "rubles"
        defensiveSpread: "percents" | "rubles"
    }>({
        priceStep: "percents",
        defensiveSpread: "percents"
    });

    const diagnosedPrice = calcPrice(viewUnits.priceStep, inputValues.priceStep, inputValues.priceActivation, inputValues.quantity, marketPrice, tabActivationModeOption!.value)

    return (
        <div className={style['TrailingStopTabComponent']}>
            <div className={style['TrailingStopTabComponent-fields']}>
                <div className={style['TrailingStopTabComponent-fields-item']}>
                    <p>Отступ от цены</p>
                    <div className={style['TrailingStopTabComponent-fields-item-input']}>
                        <CounterInput
                            allowDecimal={true}
                            disabledButtons={true}
                            value={inputValues.priceStep}
                            onChange={value => { setInputValues({ ...inputValues, priceStep: value }) }}
                            startValue={1}
                            minValue={0.1}
                            maxValue={1000000}
                        />
                        <button className={style['TrailingStopTabComponent-fields-item-input-button']} onClick={() => {
                            setViewUnits(prev => prev.priceStep === "percents" ? { ...prev, priceStep: "rubles" } : { ...prev, priceStep: "percents" })
                        }}>
                            {viewUnits.priceStep === "percents" ? "₽" : "%"}
                        </button>
                    </div>

                </div>
                <div className={style['TrailingStopTabComponent-fields-item']}>
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
                <div className={style['TrailingStopTabComponent-fields-item']}>
                    <p>
                        Активация
                    </p>
                    <Dropdown
                        optionsArr={tabActivationModeOptions}
                        setSelectedOption={setTabActivationModeOption}
                        selectedOption={tabActivationModeOption}
                    >
                        <Dropdown.Button
                        // className={styles['Location-item-button']}
                        // textClassName='p-extralarge-regular'
                        />
                        <Dropdown.Menu
                        // className={styles['Location-item-menu']}
                        >
                            {tabActivationModeOptions.map((option, index) => (
                                <Dropdown.Menu.Item
                                    key={index}
                                    option={option}
                                // className={styles['Menu-item']}
                                />
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className={style['TrailingStopTabComponent-fields-item']}>
                    <p>Цена активации</p>
                    {tabActivationModeOption!.value === "instantly" ?
                        <CounterInput
                            additionalInputProps={{ id: "asdasdassada-instantly" }}
                            placeholder='По рынку'
                            isInputDisabled={true}
                            additionalInputElement={<span>₽</span>}
                            startValue={1}
                            minValue={1}
                            maxValue={1000000}
                            stepBy={100} />


                        :
                        <CounterInput
                            allowDecimal={true}
                            additionalInputProps={{ id: "asdasdassada-delayed" }}
                            value={inputValues.priceActivation}
                            onChange={value => { setInputValues({ ...inputValues, priceActivation: value }) }}
                            additionalInputElement={<span>₽</span>}
                            startValue={1}
                            minValue={0}
                            maxValue={1000000}
                            stepBy={100}
                        />
                    }
                </div>
                <div className={style['TrailingStopTabComponent-fields-item']}>
                    <p>
                        Исполнение
                    </p>
                    <Dropdown
                        optionsArr={tabApplicationPerformanceTypeOptions}
                        setSelectedOption={setTabApplicationPerformanceTypeOption}
                        selectedOption={tabApplicationPerformanceTypeOption}
                    >
                        <Dropdown.Button
                        // className={styles['Location-item-button']}
                        // textClassName='p-extralarge-regular'
                        />
                        <Dropdown.Menu
                        // className={styles['Location-item-menu']}
                        >
                            {tabApplicationPerformanceTypeOptions.map((option, index) => (
                                <Dropdown.Menu.Item
                                    key={index}
                                    option={option}
                                // className={styles['Menu-item']}
                                />
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className={style['TrailingStopTabComponent-fields-item']}>
                    <p>Защитный спрэд</p>
                    {tabApplicationPerformanceTypeOption!.value === "marketPrice" ?
                        <CounterInput
                            additionalInputProps={{ id: "asdasdassada-marketPrice" }}
                            isInputDisabled={true}
                            additionalInputElement={<span>{viewUnits.defensiveSpread ? "%" : "₽"}</span>}
                            placeholder='Без спреда'
                            startValue={1}
                            minValue={0}
                            maxValue={100}
                            stepBy={1}
                        />
                        :
                        <div className={style['TrailingStopTabComponent-fields-item-input']}>
                            <CounterInput

                                allowDecimal={true}
                                disabledButtons={true}
                                additionalInputProps={{ id: "asdasdassada-limitPrice" }}
                                value={inputValues.defensiveSpread}
                                onChange={value => { setInputValues({ ...inputValues, defensiveSpread: value }) }}
                                additionalInputElement={<span>%</span>}
                                startValue={1}
                                minValue={0.01}
                                maxValue={100}
                            />
                            <button
                                className={style['TrailingStopTabComponent-fields-item-input-button']}
                                onClick={() => {
                                    setViewUnits(prev => prev.defensiveSpread === "percents" ? { ...prev, defensiveSpread: "rubles" } : { ...prev, defensiveSpread: "percents" })
                                }}>
                                {viewUnits.defensiveSpread === "percents" ? "₽" : "%"}
                            </button>
                        </div>

                    }

                </div>

            </div>
            <Toggle label='Оставлять заявку при закрытии позиции' checked={inputValues.makeApplicationWhenClosed} onChange={value => { setInputValues({ ...inputValues, makeApplicationWhenClosed: value }) }} />

            <p>
                Примерная стоимость {diagnosedPrice.firstDigit} / {diagnosedPrice.secondDegit}
            </p>


            {/* {tabPriceModeOption!.value === "limitPrice" ?
                <p>Стоимость {inputValue.limitPrice * inputValue.quantity}</p>
                :
                <p>Примерная стоимость {inputValue.activatePrice * inputValue.quantity}</p>
            } */}

        </div>
    );
}

export default TrailingStopTabComponent;
