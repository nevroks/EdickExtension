import CounterInput from "@/extensionUtils/widgets/shared/CounterInput";
import type { TinkoffPrice } from "@/utils/api/tinkoffApi/TMarketDataServiceApi";
import { TinkoffPriceMath } from "@/utils/helpers";
import { useState } from "react";

type ApplicationWidgetIcebergTabProps = {
    limits: {
        up: TinkoffPrice
        down: TinkoffPrice
    }
}

const ApplicationWidgetIcebergTab = ({ limits }: ApplicationWidgetIcebergTabProps) => {

    const [inputValue, setInputValue] = useState({
        marketPrice: 0,
        quantity: 1,
        observingCount: 0
    })

    return (
        <div>
            <div>
                <div>
                    <p>Цена исполнения</p>
                    <CounterInput
                        allowDecimal={true}
                        value={inputValue.marketPrice}
                        onChange={value => { setInputValue({ ...inputValue, marketPrice: value }) }}
                        additionalInputElement={<span>₽</span>}
                        startValue={0}
                        minValue={TinkoffPriceMath.toNumber(limits.down)}
                        maxValue={TinkoffPriceMath.toNumber(limits.up)}
                        stepBy={100} />
                    <p>Доступна цена от {TinkoffPriceMath.toString(limits.down)} до {TinkoffPriceMath.toString(limits.up)}</p>
                </div>
                <div>
                    <CounterInput
                        value={inputValue.quantity}
                        onChange={value => { setInputValue({ ...inputValue, quantity: value }) }}
                        additionalInputElement={<span>x1</span>}
                        startValue={0}
                        minValue={1}
                        maxValue={5000}
                        stepBy={10} />
                </div>
            </div>
            <div>
                <p>Видимое количество</p>
                <CounterInput
                    value={inputValue.observingCount}
                    onChange={value => { setInputValue({ ...inputValue, observingCount: value }) }}
                    additionalInputElement={<span>₽</span>}
                    startValue={0}
                    minValue={TinkoffPriceMath.toNumber(limits.down)}
                    maxValue={TinkoffPriceMath.toNumber(limits.up)}
                    stepBy={100} />
                <p>Доступно от 100 до {inputValue.quantity - 1}</p>
            </div>
        </div>
    );
}

export default ApplicationWidgetIcebergTab;
