import { useState } from "react";
import styles from "./style.module.css";

import { AnimatePresence, motion, type Variants } from "motion/react";
import LoginForm from "./ScreenComponents/LoginForm";
import RegisterForm from "./ScreenComponents/RegisterForm";
import type { LoginDto, RegisterDto } from "@/utils/api/authApi/AuthApi";
import useAuthApi from "@/utils/hooks/useAuthApi";


const formVariants: Variants = {
    login: { height: "172px", padding: "20px 50px 18px" },
    register: { height: "237px", padding: "30px 50px 18px" }
};

export const contentVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

const AuthScreen = () => {


    const [formMode, setFormMode] = useState<'login' | 'register'>('login')


    const { mutations: {
        register: { mutateAsync: registerFunc },
        login: { mutateAsync: loginFunc }
    } } = useAuthApi()

    const handleRegister = (dto: RegisterDto) => {
        registerFunc(dto).then(data => {
            console.log(data);

        })
    }

    const handleLogin = (dto: LoginDto) => {
        loginFunc(dto).then(data => {
            console.log(data);

        })
    }



    return (
        <div className={styles["AuthScreen"]}>
            <motion.div
                variants={formVariants}
                animate={formMode}
                transition={{
                    duration: 0.5,
                    type: "spring",
                    stiffness: 500,
                    damping: 15

                }}
                className={styles["AuthScreen-form"]}
            >
                <AnimatePresence mode="wait">
                    {formMode === 'login' ? (
                        <LoginForm setFormMode={setFormMode} onSuccessSubmit={handleLogin} />
                    ) : (
                        <RegisterForm setFormMode={setFormMode} onSuccessSubmit={handleRegister} />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );

}
export default AuthScreen;







// <FormField className={styles["AuthScreen-form-field-login"]} error={errors.login}>
//     <FormField.TextInput onChange={(e) => setLoginDto(prev => ({ ...prev, login: e.target.value }))} placeholder="Логин" />
//     <FormField.Error />
// </FormField>
// <FormField className={styles["AuthScreen-form-field-password"]} error={errors.password}>
//     <FormField.TextInput onChange={(e) => setLoginDto(prev => ({ ...prev, password: e.target.value }))} placeholder="Пароль" />
//     <FormField.Error />
// </FormField>
// <Button className={styles["AuthScreen-form-button"]} onClick={handleFormSubmit}>
//     <Button.Text text="Вход" />
// </Button>
// <div className={styles["AuthScreen-form-footer"]}>
//     <div>
//         <p>Забыл пароль</p>
//     </div>
//     <div>
//         <p>Нет аккаунта?</p>
//         <p onClick={() => setFormMode("register")}>Зарегистрироваться</p>
//     </div>
// </div>
