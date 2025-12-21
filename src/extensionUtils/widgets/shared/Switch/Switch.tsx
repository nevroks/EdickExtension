import styles from './Switch.module.css';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Switch = ({ checked, onChange, label, disabled = false }: SwitchProps) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={styles.switchContainer}>
      <button
        type="button"
        className={`${styles.switch} ${checked ? styles.switchChecked : ''} ${disabled ? styles.switchDisabled : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
      >
        <span className={styles.switchThumb} />
      </button>
      {label && <span className={styles.switchLabel}>{label}</span>}
    </div>
  );
};

