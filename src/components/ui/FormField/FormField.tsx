import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import FormFieldContext from "./FormFieldContext";
import styles from "./style.module.css"
import classNames from "classnames";

import FormFieldError from "./FormFieldError";
import FormFieldTextInput from "./FormFieldTextInput";

type FormFieldProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    error?: string
    children: ReactNode
}

const FormField = ({ error = "", children, className, ...props }: FormFieldProps) => {
    return (
        <FormFieldContext.Provider value={{ error }}>
            <div className={classNames(styles["FormField"], {
                [className!]: Boolean(className)
            })} {...props}>
                {children}
            </div>
        </FormFieldContext.Provider>
    );
}

FormField.TextInput = FormFieldTextInput
FormField.Error = FormFieldError

export default FormField;
