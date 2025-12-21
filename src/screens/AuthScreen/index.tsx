import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
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
import logoSecondStyle from './../../assets/logoSecondStyle.svg';


type AuthScreenProps = {
    animationStep: AnimationSteps
    setAnimationStep: (steps: AnimationSteps) => void
    successFormAnimationStep: "0" | "1" | "2" | "3"
    setSuccessFormAnimationStep: Dispatch<SetStateAction<"0" | "1" | "2" | "3">>
}

const animationStepsDuration = {
    1: 0.4,
    2: 0.3,
    3: 0.4
}
export const LogoVariants: Variants = {
    0: {
        opacity: 0.5,
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
        opacity: 0.5,
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


// 1 шаг анимации успеха это форма и её фон пропадает 
// 2 шаг анимации успеха это контент добро пожаловать и логотип появляется
// 3 шаг анимации успеха это контент добро пожаловать и логотип исчезает


const AuthScreen = ({ setAnimationStep, animationStep, successFormAnimationStep, setSuccessFormAnimationStep }: AuthScreenProps) => {



    const showSuccessAnimation = (): Promise<void> => {
        return new Promise((resolve) => {
            setSuccessFormAnimationStep("1");
            setTimeout(() => {
                setSuccessFormAnimationStep("2");
                setTimeout(() => {
                    setSuccessFormAnimationStep("3");
                    setTimeout(() => {
                        resolve();
                        // setTimeout(() => {
                        //     setSuccessFormAnimationStep("0");
                        // }, 1)
                    }, 800)
                }, 1200);

            }, 1000);
        });
    };




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
        register: { mutateAsync: registerFunc, error: registerError, isPending: isRegisterPending },
        login: { mutateAsync: loginFunc, error: loginError, isPending: isLoginPending }
    } } = useAuthApi()


    const handleRegister = (dto: RegisterDto) => {
        registerFunc(dto).then(data => {
           
            setJwtTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            }).then(() => showSuccessAnimation().then(() => setIsAuth(true)).then(() => navigateTo('main')));
        })
    }

    const handleLogin = (dto: LoginDto) => {
        loginFunc(dto).then(data => {
            
            setJwtTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            }).then(() => showSuccessAnimation().then(() => setIsAuth(true)).then(() => navigateTo('main')));
        })
    }


    return (
        <div className={styles["AuthScreen"]}>
            <AnimatePresence mode="wait">
                {successFormAnimationStep === "0" &&
                    <motion.div
                        key="form-screen"
                        className={classNames(styles["AuthScreen-form-screen"])}
                        exit={{
                            opacity: 0,
                            scale: 0.7,
                            transition: { duration: 1 }
                        }}
                    >
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
                            className={classNames(styles["AuthScreen-form"], {
                                [styles['pending']]: isLoginPending || isRegisterPending
                            })}
                        >
                            <AnimatePresence mode="wait">
                                {formMode === 'login' ? (
                                    <LoginForm
                                        loginServerError={loginError ? loginError.response.data?.message : null}
                                        animationStep={animationStep}
                                        logoAnimationTriggerFn={LogoAnimationTriggerFn}
                                        onSuccessSubmit={handleLogin}
                                    />
                                ) : (
                                    <RegisterForm
                                        registerServerError={registerError ? registerError.response.data?.message : null}
                                        animationStep={animationStep}
                                        logoAnimationTriggerFn={LogoAnimationTriggerFn}
                                        onSuccessSubmit={handleRegister}
                                    />
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                }
                {successFormAnimationStep === "2" &&
                    <motion.div
                        key="success-screen"
                        className={styles["AuthScreen-success-screen"]}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            transition: { duration: 1.2 }
                        }}
                        exit={{
                            opacity: 0,
                            transition: { duration: 0.8 }
                        }}
                    >
                        <div className={styles["AuthScreen-success-screen-content"]}>
                            <p className="text-33px text-600">Добро пожаловать!</p>
                            <img src={logoSecondStyle} alt="Logo" />
                        </div>
                    </motion.div>
                }
            </AnimatePresence>

        </div>
    );

}
export default AuthScreen;