import { type ButtonHTMLAttributes, type DetailedHTMLProps, type ReactNode } from 'react';

import { ButtonContext } from './ButtonContext';
import ButtonText from './ButtonText';
import styles from "./style.module.css"
import classNames from 'classnames';

export type ButtonVariant = "default" | "warning" | "info" | "danger";

export type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    variant?: ButtonVariant;
    children: ReactNode;
}

const Button = ({ children, variant = "default", style, disabled = false, ...props }: ButtonProps) => {

    return (
        <ButtonContext.Provider value={{ disabled: disabled!, variant: variant }}>
            <button className={classNames(styles["Button"], styles[`Button-variant-${variant}`], {
                [styles["Button-disabled"]]: disabled
            })} disabled={disabled} {...props}>
                {children}
            </button>
        </ButtonContext.Provider>

    );
}

Button.Text = ButtonText;

export default Button;
