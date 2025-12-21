import classNames from "classnames";
import { useCallback, useEffect, useState, type FC, type ReactNode } from "react";
import styles from "./style.module.css";
import ToggleSwitch from "./ToggleSwitch";
import ToggleLabel from "./ToggleLabel";
import { ToggleContext } from "./ToggleContext";

export interface ToggleProps {
    /** Состояние переключателя (включен/выключен) */
    checked?: boolean;
    /** Начальное состояние при неконтролируемом использовании */
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'medium';
    // variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
    /** Дополнительный класс для контейнера */
    className?: string;
    children: ReactNode;
}

const Toggle = ({
    checked,
    defaultChecked = false,
    onChange,
    disabled = false,
    size = 'medium',
    // variant = 'primary',
    className,
    children,
}: ToggleProps) => {
    const [isChecked, setIsChecked] = useState(defaultChecked);

    // Контролируемое состояние
    useEffect(() => {
        if (checked !== undefined) {
            setIsChecked(checked);
        }
    }, [checked]);

    const handleToggle = useCallback(() => {
        if (disabled) return;

        const newValue = !isChecked;

        // Если компонент неконтролируемый
        if (checked === undefined) {
            setIsChecked(newValue);
        }

        onChange?.(newValue);
    }, [checked, disabled, isChecked, onChange]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (disabled) return;

        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            handleToggle();
        }
    }, [disabled, handleToggle]);

    // Классы для разных состояний
    const containerClasses = classNames(
        styles['toggle-container'],
        styles[`toggle-${size}`],
        {
            [styles['toggle-checked']]: isChecked,
            [styles['toggle-disabled']]: disabled,
        },
        className
    );

    return (
        <ToggleContext.Provider value={{ isChecked }}>
            <div
                className={containerClasses}
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
            >
                {children}
            </div>
        </ToggleContext.Provider>
    );
};

Toggle.Switch = ToggleSwitch
Toggle.Label = ToggleLabel

export default Toggle;