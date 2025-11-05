


import classNames from 'classnames';
import { useButtonContext } from './ButtonContext';
import styles from "./style.module.css"

type ButtonTextProps = {
    text: string
}

const ButtonText = ({ text, ...props }: ButtonTextProps) => {

    const { variant } = useButtonContext()

    return (
        <p className={classNames(styles["ButtonText"], styles[`ButtonText-variant-${variant}`])}  {...props} >
            {text}
        </p>
    );
}

export default ButtonText;
