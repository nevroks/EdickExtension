

import { useChromeStorage } from "./../../hooks/useChromeStorage";
import { useNavigation } from "./../../contexts/NavigationContext";
import { useEffect, type ReactNode } from "react";



type AuthSecuredScreenProps = {
    screen: ReactNode
}

const AuthSecuredScreen = ({ screen }: AuthSecuredScreenProps) => {

    const [isAuth, _setIsAuth, isLoading] = useChromeStorage('isAuth', false)
    const { navigateTo } = useNavigation()


    console.log("In secured:", isAuth);


    useEffect(() => {
        // Ждем пока данные загрузятся И проверяем авторизацию
        if (!isLoading && !isAuth) {
            navigateTo("auth")
        }
    }, [isAuth, isLoading, navigateTo])

    if (isLoading) {
        return <div>Loading...</div>; // или null
    }

    return (
        <>
            {isAuth && screen}
        </>
    );
}

export default AuthSecuredScreen;
