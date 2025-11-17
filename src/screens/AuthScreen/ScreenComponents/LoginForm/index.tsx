import { Button, FormField } from "@/ui";
import { motion } from "motion/react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { contentVariants } from "../..";
import styles from "./style.module.css"
import classNames from "classnames";
import { emailRegex } from "../RegisterForm";


type LoginFormProps = {
    onSuccessSubmit: ({ email, password }: { email: string, password: string }) => void
    setFormMode: Dispatch<SetStateAction<'login' | 'register'>>
}

const LoginForm = ({ onSuccessSubmit, setFormMode }: LoginFormProps) => {
    const [loginDto, setLoginDto] = useState(
        {
            email: '',
            password: ''
        }
    )

    const [loginErrors, setLoginErrors] = useState({
        email: '',
        password: ''
    })


    const handleLoginFormSubmit = () => {

        if (loginDto.email.length === 0) {
            setLoginErrors({ password: '', email: 'Email is required' });
            return;
        }
        if (!emailRegex.test(loginDto.email)) {
            setLoginErrors({  password: '', email: 'Please enter a valid email address' });
            return;
        }
        if (loginDto.password.length === 0) {
            setLoginErrors({ email: '', password: 'Password is required' });
            return;
        }
        if (loginDto.password.length < 5) {
            setLoginErrors({ password: 'Password must be at least 5 characters', email: '' });
            return;
        }
        if (loginDto.password.length > 21) {
            setLoginErrors({ password: 'Password must be less than 21 characters', email: '' });
            return;
        }

        onSuccessSubmit(loginDto)


    }

    return (
        <motion.div
            key="login-form"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className={styles["LoginForm-container"]}
        >
            <FormField className={styles["LoginForm-field-login"]} error={loginErrors.email}>
                <FormField.TextInput
                    onChange={(e) => setLoginDto(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e-mail"
                />
                <FormField.Error />
            </FormField>
            <FormField className={styles["LoginForm-field-password"]} error={loginErrors.password}>
                <FormField.TextInput
                    onChange={(e) => setLoginDto(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Пароль"
                    type="password"
                />
                <FormField.Error />
            </FormField>
            <Button className={styles["LoginForm-button"]} onClick={handleLoginFormSubmit}>
                <Button.Text text="Вход" />
            </Button>
            <div className={styles["LoginForm-footer"]}>
                <div>
                    <p className={classNames("text-8px", "text-400", styles['LoginForm-linklike-text'])}>Забыл пароль</p>
                </div>
                <div className={styles["LoginForm-footer-register"]}>
                    <p className={classNames("text-8px", "text-400")}>Нет аккаунта?</p>
                    <p className={classNames("text-8px", "text-400", styles['LoginForm-linklike-text'])}
                        onClick={() => setFormMode("register")}
                    >
                        Зарегистрироваться</p>
                </div>
            </div>
        </motion.div>
    );
}

export default LoginForm;
