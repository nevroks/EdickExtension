import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import styles from "./style.module.css";
import classNames from "classnames";

export type TextInputPropsType = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    variants?: "default" | "error"
}

const TextInput = ({ variants = "default", ...props }: TextInputPropsType) => {
    return (
        <input className={classNames(styles["TextInput"], styles[`TextInput-variant-${variants}`])} {...props} />
    );
}

export default TextInput;
