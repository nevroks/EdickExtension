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
    // Используем дебаунс для строки ввода
    const [debouncedInputString, setDebouncedInputString, unDebouncedInputString, setUnDebouncedInputString] = useBetterDebounce<string>(
        localValue.toString(),
        900
    );

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

        let parsedValue: number | null = null;
        let isValid = false;

        if (allowDecimal) {
            // Для дробных чисел проверяем
            const decimalRegex = /^\d+(\.\d{0,2})?$/;
            if (decimalRegex.test(debouncedInputString)) {
                parsedValue = parseFloat(debouncedInputString);
                isValid = !isNaN(parsedValue);
            }
        } else {
            // Для целых чисел проверяем
            if (/^\d+$/.test(debouncedInputString)) {
                parsedValue = parseInt(debouncedInputString, 10);
                isValid = !isNaN(parsedValue);
            }
        }


        // Проверяем границы
        let finalValue = parsedValue!;
        if (parsedValue! < minValue) finalValue = minValue;
        if (parsedValue! > maxValue) finalValue = maxValue;

        setLocalValue(finalValue);
        setUnDebouncedInputString(finalValue.toString());
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

        // Фильтруем ввод на уровне обработчика
        let filteredValue = newInputString;

        if (!allowDecimal) {
            // Только цифры
            filteredValue = newInputString.replace(/[^\d]/g, '');
        } else {
            // Цифры и точка
            // Удаляем все нецифры и не точки
            filteredValue = newInputString.replace(/[^\d.]/g, '');

            // Оставляем только первую точку
            const parts = filteredValue.split('.');
            if (parts.length > 2) {
                filteredValue = parts[0] + '.' + parts.slice(1).join('');
            }

            // Ограничиваем до 2 знаков после точки
            if (filteredValue.includes('.')) {
                const [integer, decimal] = filteredValue.split('.');
                if (decimal && decimal.length > 2) {
                    filteredValue = integer + '.' + decimal.substring(0, 2);
                }
            }
        }
        setLocalValue(Number(filteredValue));
        // Запускаем дебаунс для проверки
        setDebouncedInputString(filteredValue);
    };

    // Проверка на возможность увеличения/уменьшения (для disabled состояния кнопок)
    const canIncrement = localValue + stepBy <= maxValue;
    const canDecrement = localValue - stepBy >= minValue;

    const displayValue = localValue.toString();


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
