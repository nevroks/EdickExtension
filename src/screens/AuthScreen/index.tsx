import { useEffect, useState } from "react";
import styles from "./style.module.css";

import { AnimatePresence, motion, type Variants } from "motion/react";
import LoginForm from "./ScreenComponents/LoginForm";
import RegisterForm from "./ScreenComponents/RegisterForm";
import type { LoginDto, RegisterDto } from "@/utils/api/authApi/AuthApi";
import useAuthApi from "@/utils/hooks/useAuthApi";
import { useChromeStorage } from "@/utils/hooks/useChromeStorage";
import { useNavigation } from "@/utils/contexts/NavigationContext";
import { CHROME_STORAGE_KEYS } from "@/utils/consts/appConsts";
import classNames from "classnames";

import logo from './../../assets/logo.svg'


type AuthScreenProps = {

}

const animationStepsDuration = {
    1: 0.4,
    2: 0.3,
    3: 0.4
}

const LogoVariants: Variants = {
    0: {
        opacity: 0.4,
        y: 0,
        transition: {
            duration: animationStepsDuration["1"],
        }
    },
    1: {
        opacity: 0,
        y: 200,
        transition: {
            duration: animationStepsDuration["1"],
        }
    },
    2: {
        opacity: 0,
        y: 200,
        transition: {
            duration: animationStepsDuration["2"],
        }
    },
    3: {
        opacity: 0.4,
        y: 0,
        transition: {
            duration: animationStepsDuration["3"],
        }
    }
}
export const TextVariants: Variants = {
    1: {
        opacity: 0,
        transition: {
            duration: animationStepsDuration["1"],
        }
    },
    2: {
        opacity: 0,
        transition: {
            duration: animationStepsDuration["2"],
        }
    },
    3: {
        opacity: 1,
        transition: {
            duration: animationStepsDuration["3"],
        }
    }
}

export const LoginFormVariants: Variants = {
    0: {
        height: "172px",
        padding: "20px 50px 18px",
        transition: { duration: animationStepsDuration["1"] }
    },
    1: {
        height: "172px",
        padding: "20px 50px 18px",
        transition: { duration: animationStepsDuration["1"] }
    },
    2: {
        height: "172px",
        padding: "20px 50px 18px",
        transition: {
            duration: animationStepsDuration["2"],
            type: "spring",
            stiffness: 500,
            damping: 15
        }
    },
    3: {
        height: "172px",
        padding: "20px 50px 18px",
        transition: { duration: animationStepsDuration["1"] }
    },

}
export const RegisterFormVariants: Variants = {
    0: {
        height: "237px",
        padding: "30px 50px 18px",
        transition: { duration: animationStepsDuration["1"] }
    },
    1: {
        height: "237px",
        padding: "30px 50px 18px",
        transition: { duration: animationStepsDuration["1"] }
    },
    2: {
        height: "237px",
        padding: "30px 50px 18px",
        transition: {
            duration: animationStepsDuration["2"],
            type: "spring",
            stiffness: 500,
            damping: 15
        }
    },
    3: {
        height: "237px",
        padding: "30px 50px 18px",
        transition: { duration: animationStepsDuration["1"] }
    },
}

export type AnimationSteps = "0" | "1" | "2" | "3"

// 1 шаг, надпись пропадает, логотип опускается. 
// 2 шаг, Форма меняет величину, контент изменяется
// 3 шаг, Надпись появляется, логотип поднимается


const AuthScreen = ({ }: AuthScreenProps) => {


    const [animationStep, setAnimationStep] = useState<AnimationSteps>("0");



    const [formMode, setFormMode] = useState<'login' | 'register'>('login')

    const LogoAnimationTriggerFn = (changeModeTo: "login" | "register") => {

        setAnimationStep("1")
        setTimeout(() => {
            setAnimationStep("2")
            setFormMode(changeModeTo)
            setTimeout(() => {
                setAnimationStep("3")
                setTimeout(() => {
                    setAnimationStep("0")
                }, animationStepsDuration["3"] * 1000)
            }, animationStepsDuration["2"] * 1000)
        }, animationStepsDuration["1"] * 1000)
    }

    const { navigateTo } = useNavigation()



    const [jwtTokens, setJwtTokens] = useChromeStorage('jwt-tokens', {
        accessToken: "",
        refreshToken: ""
    })
    const [isAuth, setIsAuth] = useChromeStorage('isAuth', false)

    const { mutations: {
        register: { mutateAsync: registerFunc },
        login: { mutateAsync: loginFunc }
    } } = useAuthApi()


    const handleRegister = (dto: RegisterDto) => {
        registerFunc(dto).then(data => {
            setJwtTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            }).then(() => setIsAuth(true)).then(() => navigateTo('main'));
        })
    }

    const handleLogin = (dto: LoginDto) => {
        loginFunc(dto).then(data => {
            setJwtTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            }).then(() => setIsAuth(true).then(() => {
                navigateTo('main')
            }))
        })
    }



    return (
        <div className={styles["AuthScreen"]}>
            <motion.img
                className={styles["AuthScreen-logo"]}
                src={logo}
                alt="Logo-Img"
                initial={false}
                variants={LogoVariants}
                animate={animationStep}
            />
            <motion.p
                initial={false}
                variants={TextVariants}
                animate={animationStep}
                className={classNames('text-53px', 'text-800', styles["AuthScreen-title"], {
                    [styles["AuthScreen-title-register"]]: formMode === 'register',
                    [styles["AuthScreen-title-login"]]: formMode === 'login'
                })}>
                {formMode === 'register' ? 'Регистрация' : 'Вход'}
            </motion.p>
            <motion.div
                variants={formMode === 'login' ? LoginFormVariants : RegisterFormVariants}
                animate={animationStep}
                className={styles["AuthScreen-form"]}
            >

                <AnimatePresence mode="wait">
                    {formMode === 'login' ? (
                        <LoginForm animationStep={animationStep} logoAnimationTriggerFn={LogoAnimationTriggerFn} onSuccessSubmit={

                            handleLogin
                        } />
                    ) : (
                        <RegisterForm animationStep={animationStep} logoAnimationTriggerFn={LogoAnimationTriggerFn} onSuccessSubmit={

                            handleRegister
                        } />
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
