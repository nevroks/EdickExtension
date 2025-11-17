

import { useChromeStorage } from "./../../hooks/useChromeStorage";
import { useNavigation } from "./../../contexts/NavigationContext";
import type { ReactNode } from "react";



type AuthSecuredScreenProps = {
    screen: ReactNode
}

const AuthSecuredScreen = ({ screen }: AuthSecuredScreenProps) => {

    const [isAuth, _setIsAuth] = useChromeStorage('isAuth', false)
    const { navigateTo } = useNavigation()

    if (!isAuth) {
        navigateTo("auth")
    }

    return (
        <>
            {isAuth && screen}
        </>
    );
}

export default AuthSecuredScreen;
