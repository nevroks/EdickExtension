import { useState, type Dispatch, type SetStateAction } from "react";
import { contentVariants } from "../..";
import { motion } from "motion/react";
import { Button, FormField } from "@/ui";
import styles from "./style.module.css"
import classNames from "classnames";


type RegisterFormProps = {
    onSuccessSubmit: ({ login, password }: { login: string, password: string }) => void
    setFormMode: Dispatch<SetStateAction<'login' | 'register'>>
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterForm = ({ onSuccessSubmit, setFormMode }: RegisterFormProps) => {


    const [registerDto, setRegisterDto] = useState(
        {
            login: '',
            password: '',
            confirmPassword: '',
            email: ''
        }
    )
    const [registerErrors, setRegisterErrors] = useState({
        login: '',
        password: '',
        confirmPassword: '',
        email: ''
    })


    const handleRegisterFormSubmit = () => {

        if (registerDto.login.length === 0) {
            setRegisterErrors({ login: 'Login is required', password: '', confirmPassword: '', email: '' });
            return
        }
        if (registerDto.password.length === 0) {
            setRegisterErrors({ login: '', password: 'Password is required', confirmPassword: '', email: '' });
            return
        }
        if (registerDto.password.length < 5) {
            setRegisterErrors({ login: '', password: 'Password must be at least 5 characters', confirmPassword: '', email: '' });
            return
        }
        if (registerDto.password.length > 21) {
            setRegisterErrors({ login: '', password: 'Password must be less than 21 characters', confirmPassword: '', email: '' });
            return
        }
        if (registerDto.confirmPassword.length === 0) {
            setRegisterErrors({ login: '', password: '', confirmPassword: 'Confirm password is required', email: '' });
            return
        }
        if (registerDto.confirmPassword !== registerDto.password) {
            setRegisterErrors({ login: '', password: '', confirmPassword: 'Passwords do not match', email: '' });
            return
        }
        if (registerDto.email.length === 0) {
            setRegisterErrors({ login: '', password: '', confirmPassword: '', email: 'Email is required' });
            return
        }
        if (!emailRegex.test(registerDto.email)) {
            setRegisterErrors({ login: '', password: '', confirmPassword: '', email: 'Please enter a valid email address' });
            return;
        }

        onSuccessSubmit(registerDto)
    }

    return (
        <motion.div
            key="register-form"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className={styles['RegisterForm-container']}
        >
            <FormField className={styles["RegisterForm-field"]} error={registerErrors.login}>
                <FormField.TextInput
                    onChange={(e) => setRegisterDto(prev => ({ ...prev, login: e.target.value }))}
                    placeholder="Логин"
                />
                <FormField.Error />
            </FormField>

            <FormField className={styles["RegisterForm-field"]} error={registerErrors.password}>
                <FormField.TextInput
                    onChange={(e) => setRegisterDto(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Пароль"
                    type="password"
                />
                <FormField.Error />
            </FormField>
            <FormField className={styles["RegisterForm-field"]} error={registerErrors.confirmPassword}>
                <FormField.TextInput
                    onChange={(e) => setRegisterDto(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Подтвердите пароль"
                    type="password"
                />
                <FormField.Error />
            </FormField>
            <FormField className={styles["RegisterForm-field-email"]} error={registerErrors.email}>
                <FormField.TextInput
                    onChange={(e) => setRegisterDto(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    type="email"
                />
                <FormField.Error />
            </FormField>
            <Button className={styles["RegisterForm-button"]} onClick={handleRegisterFormSubmit}>
                <Button.Text text="Зарегистрироваться" />
            </Button>
            <div className={styles["RegisterForm-footer"]}>
                <p className={classNames("text-8px", "text-400")}>Есть аккаунт?</p>
                <p
                    onClick={() => setFormMode("login")}
                    className={classNames("text-8px", "text-400", styles['RegisterForm-linklike-text'])}
                >
                    Войти
                </p>
            </div>
        </motion.div>
    );
}

export default RegisterForm;
