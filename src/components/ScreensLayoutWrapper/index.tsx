import { useNavigation, type View } from "@/utils/contexts/NavigationContext";
import { useMemo, type ReactNode } from "react";


type ScreensLayoutWrapperProps = {
    children: ReactNode
    path: View
}

const ScreensLayoutWrapper = ({ path, children }: ScreensLayoutWrapperProps) => {

    const { currentView } = useNavigation()

    const isLayoutActive = useMemo(() => {
        return currentView.includes(path)
    }, [currentView, path])

    return isLayoutActive ? <>{children}</> : null
}

export default ScreensLayoutWrapper;
