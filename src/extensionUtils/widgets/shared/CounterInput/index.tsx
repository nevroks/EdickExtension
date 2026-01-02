import React, { useEffect, useState, type ReactNode } from 'react';
import styles from './style.module.css';
import classNames from 'classnames';
import useBetterDebounce from '@/utils/hooks/useBetterDebounce';

type CounterInputProps = {
    startValue: number
    minValue: number
    maxValue: number
    stepBy: number,
    value?: number
    onChange?: (value: number) => void
    placeholder?: string
    allowDecimal?: boolean;

    additionalInputElement?: ReactNode
    isInputDisabled?: boolean
}

const CounterInput = ({ startValue, minValue, maxValue, stepBy, value, onChange, placeholder, additionalInputElement, isInputDisabled = false, allowDecimal = false }: CounterInputProps) => {
    const [localValue, setLocalValue] = useState(() => {
        const initialValue = startValue < minValue ? minValue : startValue > maxValue ? maxValue : startValue
        return initialValue
    });
    const currentValue = value !== undefined ? value : localValue;
    // Используем дебаунс для строки ввода
    const [debouncedInputString, setDebouncedInputString, unDebouncedInputString, setUnDebouncedInputString] = useBetterDebounce<string>(
        currentValue.toString(),
        900
    );

    useEffect(() => {
        if (value !== undefined) {
            const stringValue = value.toString();
            setUnDebouncedInputString(stringValue);
            setDebouncedInputString(stringValue);
        }
    }, [value]);

    // Обработка дебаунсированного значения
    useEffect(() => {
        if (debouncedInputString === '') {
            // Пустая строка - устанавливаем 0
            const finalValue = 0;
            if (value === undefined) {
                setLocalValue(finalValue);
                setUnDebouncedInputString(finalValue.toString());
            }
            onChange && onChange(finalValue);
            return;
        }

        // Проверяем формат в зависимости от allowDecimal

        let parsedValue = 0;

        if (allowDecimal) {
            // Для дробных чисел проверяем
            const decimalRegex = /^\d+(\.\d{0,2})?$/;
            if (decimalRegex.test(debouncedInputString) && debouncedInputString !== '.') {
                parsedValue = parseFloat(debouncedInputString);

            }
        } else {
            // Для целых чисел проверяем
            if (/^\d+$/.test(debouncedInputString)) {
                parsedValue = parseInt(debouncedInputString);

            }
        }



        // Проверяем границы
        let finalValue = parsedValue;
        if (parsedValue < minValue) finalValue = minValue;
        if (parsedValue > maxValue) finalValue = maxValue;

        // // Округляем если нужно
        // if (!allowDecimal) {
        //     finalValue = Math.round(finalValue);
        // } else {
        //     finalValue = Math.round(finalValue * 100) / 100;
        // }

        // Обновляем значение
        if (value === undefined) {
            setLocalValue(finalValue);
            // Обновляем немедленное значение с отформатированной строкой
            setUnDebouncedInputString(finalValue.toString());
        }
        onChange && onChange(finalValue);

    }, [debouncedInputString]);

    const handleIncrement = () => {
        const newValue = Number(unDebouncedInputString) + stepBy;
        if (newValue < minValue) {
            if (value === undefined) {
                setUnDebouncedInputString(minValue.toString());
            }
            onChange && onChange(minValue);
        }
        // Проверяем не превышает ли максимальное значение
        if (newValue > maxValue) {
            // Можно либо ограничить максимальным значением
            const finalValue = maxValue;

            // Либо ничего не делать если достигнут максимум
            // return;

            // Устанавливаем ограниченное значение
            if (value === undefined) {
                setUnDebouncedInputString(finalValue.toString());
            }
            onChange && onChange(finalValue);
        } else {
            // В пределах диапазона - устанавливаем новое значение
            if (value === undefined) {
                setUnDebouncedInputString(newValue.toString());
            }
            onChange && onChange(newValue);
        }
    }

    const handleDecrement = () => {
        const newValue = Number(unDebouncedInputString) - stepBy;

        // Проверяем не меньше ли минимального значения
        if (newValue < minValue) {
            // Можно либо ограничить минимальным значением
            const finalValue = minValue;

            // Либо ничего не делать если достигнут минимум
            // return;

            // Устанавливаем ограниченное значение
            if (value === undefined) {
                setUnDebouncedInputString(finalValue.toString());
            }
            onChange && onChange(finalValue);
        } else {
            // В пределах диапазона - устанавливаем новое значение
            if (value === undefined) {
                setUnDebouncedInputString(newValue.toString());
            }
            onChange && onChange(newValue);
        }
    }

    // Обработчик прямого ввода в инпут
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isInputDisabled) return;

        const newInputString = e.target.value;

        // Обновляем немедленное значение для отображения
        setUnDebouncedInputString(newInputString);

        // Запускаем дебаунс для проверки
        // setDebouncedInputString(newInputString);
    };

    // Проверка на возможность увеличения/уменьшения (для disabled состояния кнопок)
    const canIncrement = currentValue + stepBy <= maxValue;
    const canDecrement = currentValue - stepBy >= minValue;

    const displayValue = isInputDisabled ? currentValue.toString() : unDebouncedInputString;


    return (
        <div className={styles['CounterInput']}>
            <div className={classNames(styles['CounterInput-input'], {
                [styles['CounterInput-input-disabled']]: isInputDisabled
            })}>
                <input
                    disabled={isInputDisabled}
                    className={styles['CounterInput-input-value']}
                    placeholder={placeholder}
                    type="text"
                    value={isInputDisabled ? undefined : displayValue}
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
