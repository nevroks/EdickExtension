import { useEffect, useMemo, useRef, useState } from 'react';

import { Button, Toggle } from '@/ui';
import { defaultUserAppSettings, WIDGET_SETTINGS_KEYS, WIDGETS_CONFIG } from '@/utils/consts/appConsts';
import { useChromeStorage } from '@/utils/hooks/useChromeStorage';
import type { UserAppSettings } from '@/utils/types';

import lockIcon from '../../assets/icons/lockIcon.svg';
import styles from './style.module.css';

const SettingsScreen = () => {
  const [savedUserAppSettings, setSavedUserAppSettings] = useChromeStorage<UserAppSettings>('userAppSettings', defaultUserAppSettings);

  const [userAppSettings, setUserAppSettings] = useState<UserAppSettings>(() => savedUserAppSettings);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (isSavingRef.current) {
      isSavingRef.current = false;
      return;
    }

    setUserAppSettings(savedUserAppSettings);
  }, [savedUserAppSettings]);

  // Проверяем изменения при обновлении настроек
  const hasChanges = useMemo(() => {
    return WIDGET_SETTINGS_KEYS.some((key) => userAppSettings[key] !== savedUserAppSettings[key]);
  }, [userAppSettings, savedUserAppSettings]);

  const handleSave = async () => {
    if (hasChanges) {
      isSavingRef.current = true;

      setSavedUserAppSettings(userAppSettings);

      try {
        const tabs = await chrome.tabs.query({});
        const terminalTab = tabs.find((tab) => tab.url && (tab.url.includes('tinkoff.ru/terminal') || tab.url.includes('tbank.ru/terminal')));

        if (terminalTab?.id) {
          await chrome.tabs.reload(terminalTab.id);
        }
      } catch (error) {
        console.error('Failed to reload terminal tab:', error);
      }
    }
  };

  return (
    <div className={styles['SettingsScreen']}>
      <div className={styles['SettingsScreen-content']}>
        {Object.entries(WIDGETS_CONFIG).map(([key, config]) => {
          const isDisabled = config.disabled === true;

          if (isDisabled) {
            return (
              <Toggle key={key} disabled checked={false}>
                <div className={styles['lock-container']}>
                  <img src={lockIcon} alt="lockIcon" className={styles['lock-icon']} />
                  <Toggle.Switch />
                </div>
                <Toggle.Label text={config.label} />
              </Toggle>
            );
          }

          // Активный виджет - должен быть в UserAppSettings
          const settingKey = key as keyof UserAppSettings;
          return (
            <Toggle key={key} onChange={(value) => setUserAppSettings({ ...userAppSettings, [settingKey]: value })} checked={userAppSettings[settingKey]}>
              <Toggle.Switch />
              <Toggle.Label text={config.label} />
            </Toggle>
          );
        })}
      </div>
      <div className={styles['SettingsScreen-footer']}>
        <Button onClick={handleSave} disabled={!hasChanges} variant="default">
          <Button.Text text="Сохранить" />
        </Button>
      </div>
    </div>
  );
};

export default SettingsScreen;
