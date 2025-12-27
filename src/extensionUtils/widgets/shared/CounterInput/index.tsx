import React, { useEffect, useState, type ReactNode } from 'react';
import styles from './style.module.css';
import classNames from 'classnames';

type CounterInputProps = {
    startValue: number
    minValue: number
    maxValue: number
    stepBy: number,
    value?: number
    onChange?: (value: number) => void
    placeholder?: string
    additionalInputElement?: ReactNode
    isInputDisabled?: boolean
}

const CounterInput = ({ startValue, minValue, maxValue, stepBy, value, onChange, placeholder, additionalInputElement, isInputDisabled = false }: CounterInputProps) => {


    const [localValue, setLocalValue] = useState(() => {
        // Инициализируем с проверкой границ
        const initial = startValue < minValue ? minValue : startValue > maxValue ? maxValue : startValue;
        return initial;
    });
    const currentValue = value !== undefined ? value : localValue;
    // Обновляем локальное значение если пропсы изменились
    useEffect(() => {
        if (value === undefined) {
            const normalized = startValue < minValue ? minValue : startValue > maxValue ? maxValue : startValue;
            setLocalValue(normalized);
        }
    }, [startValue, minValue, maxValue, value]);

    const handleIncrement = () => {
        const newValue = currentValue + stepBy;

        // Проверяем не превышает ли максимальное значение
        if (newValue > maxValue) {
            // Можно либо ограничить максимальным значением
            const finalValue = maxValue;

            // Либо ничего не делать если достигнут максимум
            // return;

            // Устанавливаем ограниченное значение
            if (value === undefined) {
                setLocalValue(finalValue);
            }
            onChange && onChange(finalValue);
        } else {
            // В пределах диапазона - устанавливаем новое значение
            if (value === undefined) {
                setLocalValue(newValue);
            }
            onChange && onChange(newValue);
        }
    }

    const handleDecrement = () => {
        const newValue = currentValue - stepBy;

        // Проверяем не меньше ли минимального значения
        if (newValue < minValue) {
            // Можно либо ограничить минимальным значением
            const finalValue = minValue;

            // Либо ничего не делать если достигнут минимум
            // return;

            // Устанавливаем ограниченное значение
            if (value === undefined) {
                setLocalValue(finalValue);
            }
            onChange && onChange(finalValue);
        } else {
            // В пределах диапазона - устанавливаем новое значение
            if (value === undefined) {
                setLocalValue(newValue);
            }
            onChange && onChange(newValue);
        }
    }

    // Обработчик прямого ввода в инпут
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isInputDisabled) return;
        
        const inputValue = e.target.value;

        // Проверяем, является ли ввод числом
        if (inputValue === '' || /^-?\d*\.?\d*$/.test(inputValue)) {
            const numValue = inputValue === '' ? 0 : parseFloat(inputValue);

            // Проверяем границы
            let finalValue = numValue;
            if (numValue < minValue) finalValue = minValue;
            if (numValue > maxValue) finalValue = maxValue;
            if (isNaN(numValue)) finalValue = minValue; // или currentValue

            if (value === undefined) {
                setLocalValue(finalValue);
            }
            onChange && onChange(finalValue);
        }
    }

    // Проверка на возможность увеличения/уменьшения (для disabled состояния кнопок)
    const canIncrement = currentValue + stepBy <= maxValue;
    const canDecrement = currentValue - stepBy >= minValue;

    // Округление для отображения (если stepBy целочисленный)
    const displayValue = stepBy % 1 === 0 ? Math.round(currentValue) : currentValue;

    return (
        <div className={styles['CounterInput']}>
            <div className={classNames(styles['CounterInput-input'], {
                [styles['CounterInput-input-disabled']]: isInputDisabled
            })}>
                <input
                    className={styles['CounterInput-input-value']}
                    placeholder={placeholder}
                    type="text"
                    value={displayValue}
                    onChange={handleInputChange}
                    min={minValue}
                    max={maxValue}
                />
                {additionalInputElement && <div className={styles['CounterInput-input-additional']}>
                    {additionalInputElement}
                </div>}

            </div>
            <div className={styles['CounterInput-buttons']}>
                <button className={classNames(styles['CounterInput-buttons-button'], styles['CounterInput-buttons-button-increment'], {
                    [styles['CounterInput-buttons-button-disabled']]: !canIncrement || isInputDisabled,
                })} disabled={!canIncrement || isInputDisabled} onClick={handleIncrement}>+</button>
                <button className={classNames(styles['CounterInput-buttons-button'], styles['CounterInput-buttons-button-decrement'], {
                    [styles['CounterInput-buttons-button-disabled']]: !canDecrement || isInputDisabled
                })} disabled={!canDecrement || isInputDisabled} onClick={handleDecrement}>-</button>
            </div>
        </div>
    );
}

export default CounterInput;
