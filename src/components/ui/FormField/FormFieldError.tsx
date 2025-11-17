
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { useFormFieldContext } from './FormFieldContext';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import styles from "./style.module.css"

const FieldErrorVariants: Variants = {
    visible: {
        opacity: 1,
        transition: {
            duration: 0.4
        }
    },
    hidden: {
        opacity: 0,
        transition: {
            duration: 0.4
        }
    }
}

type FormFieldErrorProps = {
    children?: ReactNode;
    className?: string;
}

const FormFieldError = ({ children, className }: FormFieldErrorProps) => {

    const { error } = useFormFieldContext()

    return (
        <AnimatePresence>
            {error && (
                <motion.span
                    variants={FieldErrorVariants}
                    initial='hidden'
                    animate={'visible'}
                    exit={'hidden'}
                    className={classNames(styles['FormField-Error'], {
                        [className!]: Boolean(className)
                    })}
                    role='alert'
                    aria-live='assertive'
                >
                    {children ?? error}
                </motion.span>
            )}
        </AnimatePresence>
    )
}

export default FormFieldError;
