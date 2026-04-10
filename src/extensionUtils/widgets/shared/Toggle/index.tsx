import React from 'react';
import styles from './style.module.css';
import checkIcon from './../../../../assets/checkIcon.svg'
interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

export const Toggle = ({ checked, onChange, label, disabled = false }: ToggleProps) => {
    const handleToggle = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    return (
        <div className={styles.toggleContainer}>
            <button
                type="button"
                className={`
          ${styles.toggle}
          ${checked ? styles.toggleChecked : ''}
          ${disabled ? styles.toggleDisabled : ''}
        `}
                onClick={handleToggle}
                disabled={disabled}
                role="switch"
                aria-checked={checked}
            >
                {checked && (
                    <img className={styles.toggleIcon} src={checkIcon} alt="" />

                )}
            </button>
            {label && <span className={styles.toggleLabel}>{label}</span>}
        </div>
    );
};