import { Toggle } from "@/ui";
import type { UserAppSettings } from "@/utils/types";
import { useState } from "react";
import styles from "./style.module.css"
import lockIcon from "./../../assets/icons/lockIcon.svg"
import { useChromeStorage } from "@/utils/hooks/useChromeStorage";
import { defaultUserAppSettings } from "@/utils/consts/appConsts";

const SettingsScreen = () => {

    const [userAppSettings, setUserAppSettings] = useChromeStorage<UserAppSettings>(
        "userAppSettings", defaultUserAppSettings
    )

    return (
        <div className={styles["SettingsScreen"]}>
            <div className={styles["SettingsScreen-content"]}>
                <Toggle onChange={(value) => setUserAppSettings({ ...userAppSettings, newsWidget: value })} checked={userAppSettings.newsWidget} >
                    <Toggle.Switch />
                    <Toggle.Label text="Новости виджет" />
                </Toggle>
                <Toggle onChange={(value) => setUserAppSettings({ ...userAppSettings, robotsWidget: value })} checked={userAppSettings.robotsWidget} >
                    <Toggle.Switch />
                    <Toggle.Label text="Роботы виджет" />
                </Toggle>
                <Toggle onChange={(value) => setUserAppSettings({ ...userAppSettings, pastuhWidget: value })} checked={userAppSettings.pastuhWidget}>
                    <Toggle.Switch />
                    <Toggle.Label text="Пастухи виджет" />
                </Toggle>
                <Toggle disabled checked={false} >
                    <div className={styles["lock-container"]}>
                        <img src={lockIcon} alt="lockIcon" className={styles["lock-icon"]} />
                        <Toggle.Switch />
                    </div>

                    <Toggle.Label text="RSI виджет" />
                </Toggle>
                <Toggle disabled checked={false} >
                    <div className={styles["lock-container"]}>
                        <img src={lockIcon} alt="lockIcon" className={styles["lock-icon"]} />
                        <Toggle.Switch />
                    </div>

                    <Toggle.Label text="Маруся блять какая-то" />
                </Toggle>
                <Toggle disabled checked={false} >
                    <div className={styles["lock-container"]}>
                        <img src={lockIcon} alt="lockIcon" className={styles["lock-icon"]} />
                        <Toggle.Switch />
                    </div>

                    <Toggle.Label text="Ема виджет" />
                </Toggle>
                <Toggle disabled checked={false} >
                    <div className={styles["lock-container"]}>
                        <img src={lockIcon} alt="lockIcon" className={styles["lock-icon"]} />
                        <Toggle.Switch />
                    </div>

                    <Toggle.Label text="Резкие изменения виджет" />
                </Toggle>
                <Toggle disabled checked={false} >
                    <div className={styles["lock-container"]}>
                        <img src={lockIcon} alt="lockIcon" className={styles["lock-icon"]} />
                        <Toggle.Switch />
                    </div>

                    <Toggle.Label text="Крупные лимитки виджет" />
                </Toggle>
                <Toggle disabled checked={false} >
                    <div className={styles["lock-container"]}>
                        <img src={lockIcon} alt="lockIcon" className={styles["lock-icon"]} />
                        <Toggle.Switch />
                    </div>

                    <Toggle.Label text="Тепловые карты виджет" />
                </Toggle>
                <Toggle disabled checked={false} >
                    <div className={styles["lock-container"]}>
                        <img src={lockIcon} alt="lockIcon" className={styles["lock-icon"]} />
                        <Toggle.Switch />
                    </div>

                    <Toggle.Label text="Открытые позиции виджет" />
                </Toggle>

            </div>
        </div>
    );
}

export default SettingsScreen;
