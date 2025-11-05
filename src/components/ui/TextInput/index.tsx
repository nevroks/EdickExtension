import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import styles from "./style.module.css";

type TextInputPropsType = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {

}

const TextInput = ({ ...props }: TextInputPropsType) => {
    return (
        <input className={styles["TextInput"]} {...props} />
    );
}

export default TextInput;
