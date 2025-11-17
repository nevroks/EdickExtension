import classNames from "classnames";
import type { ReactNode } from "react";
import styles from "./style.module.css"
import { useNavigation, type View } from "@/utils/contexts/NavigationContext";

type LinkProps = {
    className?: string;
    children: ReactNode
    to: View 
}

const Link = ({ className, children, to }: LinkProps) => {

    const { navigateTo } = useNavigation()

    return (
        <button onClick={()=>navigateTo(to) } className={classNames(styles["Link"], { [className!]: Boolean(className) })}>
            {children}
        </button>
    );
}

export default Link;
