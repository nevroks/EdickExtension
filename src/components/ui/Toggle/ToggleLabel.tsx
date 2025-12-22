
import classNames from 'classnames';
import styles from './style.module.css'
import { useToggleContext } from './ToggleContext';

type ToggleLabelProps = {
    text: string
}

const ToggleLabel = ({ text }: ToggleLabelProps) => {

    const { isChecked } = useToggleContext();

    return (
        <span className={classNames(styles['toggle-label'],{
            [styles['toggle-checked']]: isChecked
        })}>
            {text}
        </span>
    );
}

export default ToggleLabel;
