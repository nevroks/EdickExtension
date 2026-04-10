import React, { forwardRef, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import calendarIcon from './../../../../assets/calendar.svg'

import styles from './style.module.css';
import classNames from 'classnames';
const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const;

function getMonth(date: Date): typeof MONTHS[number] {
    const monthIndex = date.getMonth(); // 0-11
    return MONTHS[monthIndex];
}

function getYear(date: Date): number {
    return date.getFullYear();
}

const availableYears = Array.from({ length: 10 }, (_, i) => getYear(new Date()) + i);

const minDate = new Date();
const maxDate = new Date(availableYears[availableYears.length - 1], 11, 31)

type CalendarProps = {
    onDateChange?: (date: Date | null) => void
}

const Calendar = ({ onDateChange }: CalendarProps) => {


    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    useEffect(() => {
        onDateChange && onDateChange(selectedDate)
    }, [selectedDate?.getDate()])

    const decreaseMonth = () => {
        if (selectedDate) {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() - 1);
            newDate.setDate(1);
            setSelectedDate(newDate);
        } else {
            const today = new Date();
            const newDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            setSelectedDate(newDate);
        }
    }
    const increaseMonth = () => {
        if (selectedDate) {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() + 1);
            newDate.setDate(1);
            setSelectedDate(newDate);
        } else {
            const today = new Date();
            const newDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
            setSelectedDate(newDate);
        }
    }
    const updateYear = (year: number) => {
        if (selectedDate) {
            const newDate = new Date(selectedDate);
            newDate.setFullYear(year);
            setSelectedDate(newDate);
        } else {
            // Если дата не выбрана, создаем новую с текущим месяцем и днем
            const today = new Date();
            const newDate = new Date(year, today.getMonth(), today.getDate());
            setSelectedDate(newDate);
        }
    };

    // Функция для обновления месяца в selectedDate
    const updateMonth = (monthIndex: number) => {
        if (selectedDate) {
            const newDate = new Date(selectedDate);
            newDate.setMonth(monthIndex);
            setSelectedDate(newDate);
        } else {
            // Если дата не выбрана, создаем новую с текущим годом и днем
            const today = new Date();
            const newDate = new Date(today.getFullYear(), monthIndex, today.getDate());
            setSelectedDate(newDate);
        }
    };

    return (
        <DatePicker
            renderCustomHeader={({ date,
                // вот у этой хуйни поведение не такое как мне хочется, но вызывать один хукй надо для сайд эффектов
                changeYear: updateYearFromPicker,
                // вот у этой хуйни поведение не такое как мне хочется, но вызывать один хукй надо для сайд эффектов
                changeMonth: updateMonthFromPicker,
                // вот у этой хуйни поведение не такое как мне хочется, даже вызывать ненадо ибо оно хуита
                decreaseMonth: _decreaseMonthFromPicker,
                // вот у этой хуйни поведение не такое как мне хочется, даже вызывать ненадо ибо оно хуита
                increaseMonth: _increaseMonthFromPicker,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled }) => {
                return (
                    <div
                        style={{
                            margin: 10,
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <button onClick={() => {
                            decreaseMonth()
                        }} disabled={prevMonthButtonDisabled}>
                            {"<"}
                        </button>
                        <select
                            value={getYear(date)}
                            onChange={({ target: { value } }) => {
                                updateYear(+value)
                                updateYearFromPicker(+value)
                            }}
                        >
                            {availableYears.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>

                        <select

                            value={getMonth(date)}
                            onChange={({ target: { value } }) => {
                                updateMonth(MONTHS.indexOf(value as (typeof MONTHS)[number]))
                                updateMonthFromPicker(MONTHS.indexOf(value as (typeof MONTHS)[number]))
                            }

                            }
                        >
                            {MONTHS.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>

                        <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                            {">"}
                        </button>
                    </div>

                )
            }}
            showIcon
            icon={<img src={calendarIcon} alt="calendar" />}
            dateFormat="yyyy/MM/dd"
            customInput={<CalendarInput value={selectedDate ? selectedDate.toISOString() : ""} setParentValue={setSelectedDate} />}
            minDate={minDate}
            maxDate={maxDate}
            selected={selectedDate}
            onChange={setSelectedDate}
            isClearable={true}
        />
    );
}

type CalendarInputProps = {
    value: string;
    onClick?: () => void;
    setParentValue: Dispatch<SetStateAction<Date | null>>;
};

const CalendarInput = forwardRef<
    HTMLInputElement,
    CalendarInputProps

>(({
    value, onClick, setParentValue
}, ref) => {
    const [localValue, setLocalValue] = useState(value || '');
    const [isDateValid, setIsDateValid] = useState(true);

    useEffect(() => {
        console.log("propsValue", value);
        setLocalValue(value || '');
    }, [value]);



    useEffect(() => {
        if (isDateValid) {
            if (localValue.length === 0) {
                setParentValue(null)
                return
            } else {
                setParentValue(new Date(localValue))
            }

        }
    }, [localValue])
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawInputValue = e.target.value;

        let filteredInputValue = rawInputValue.replace(/[^0-9/]/g, '');

        for (let i = 0; i < filteredInputValue.length; i++) {
            if (filteredInputValue[i] === '/' && !(i === 4 || i === 7)) {
                return;
            }
        }
        const previousValue = localValue
        const isDeleting = filteredInputValue.length < previousValue.length

        if (!isDeleting && filteredInputValue.length === 4) {
            filteredInputValue += '/';
        }

        if (!isDeleting && filteredInputValue.length === 7) {
            filteredInputValue += '/';
        }
        setLocalValue(filteredInputValue);

        // Проверка валидности даты

        if (filteredInputValue.length === 0) {
            // типо если бессрочную оплату выбрал
            setIsDateValid(true);
            return;
        }
        if (filteredInputValue.length === 10) {
            const [yearStr, monthStr, dayStr] = filteredInputValue.split('/');
            const year = Number(yearStr);
            const month = Number(monthStr);
            const day = Number(dayStr);

            if (year > getYear(maxDate) || year < getYear(minDate)) {
                setIsDateValid(false);
                return;
            }

            if (month < 1 || month > 12) {
                setIsDateValid(false);
                return;
            }

            // Получаем количество дней в месяце для конкретного года
            const daysInMonth = new Date(year, month, 0).getDate();

            // Проверка дня с учетом количества дней в месяце
            if (day < 1 || day > daysInMonth) {
                setIsDateValid(false);
                return;
            }

            if (month === 2) {
                const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
                const maxDaysInFebruary = isLeapYear ? 29 : 28;

                if (day > maxDaysInFebruary) {
                    setIsDateValid(false);
                    return;
                }
            }

            setIsDateValid(true);
        } else {
            setIsDateValid(false);
        }
    };


    return (
        <input
            className={classNames(styles['Calendar-input'], {
                [styles['error']]: !isDateValid
            })}

            ref={ref}
            value={localValue}
            onChange={handleChange}
            onClick={() => {
                onClick!()
            }}
            placeholder="Бессрочная"
            maxLength={10} // Максимальная длина с разделителями
        />
    )
}






);

export default Calendar;
