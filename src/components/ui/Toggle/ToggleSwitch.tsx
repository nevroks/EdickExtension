import classNames from 'classnames';
import styles from './style.module.css';
import { useToggleContext } from './ToggleContext';

const ToggleSwitch = () => {

    const { isChecked } = useToggleContext();

    const toggleClasses = classNames(styles['toggle-switch'], {
        [styles['toggle-switch-checked']]: isChecked,
    });

    const trackClasses = classNames(styles['toggle-track'], {
        [styles['toggle-track-checked']]: isChecked,
    });

    const thumbClasses = classNames(styles['toggle-thumb'], {
        [styles['toggle-thumb-checked']]: isChecked,
    });

    return (
        <div className={toggleClasses}>
            <div className={trackClasses}></div>
            <div className={thumbClasses}>
                {/* Иконки для состояний (опционально) */}
                {/* {isChecked ? (
                    <svg
                        className={classNames(styles['toggle-icon'], styles['toggle-icon-on'])}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : (
                    <svg
                        className={classNames(styles['toggle-icon'], styles['toggle-icon-off'])}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )} */}
            </div>
        </div>
    );
}

export default ToggleSwitch;
