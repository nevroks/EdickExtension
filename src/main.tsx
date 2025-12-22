
import { createRoot } from 'react-dom/client'
import './index.css'
import { NavigationProvider, useNavigation } from '@/utils/contexts/NavigationContext';
import { ScreensLayoutWrapper, ScreenWrapper } from '@/components';
import MainScreen from './screens/MainScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AuthSecuredScreen from "./utils/hocs/AuthSecuredScreen/AuthSecuredScreen";
import AuthScreen, { LogoVariants, type AnimationSteps } from './screens/AuthScreen';
import { AnimatePresence, motion } from 'motion/react';
import logo from './assets/logo.svg';
import mainScreenBg from './assets/mainScreenBgImg.png';
import tgIcon from './assets/icons/tgIcon.svg';
import { useState, type ReactNode } from 'react';
import { Link } from '@/ui';
import classNames from 'classnames';
import SettingsScreen from './screens/SettingsScreen';



const queryClient = new QueryClient()

const MainAppLayout = ({ children }: { children: ReactNode }) => {

  const { currentView } = useNavigation()

  return (
    <ScreensLayoutWrapper path="main">
      <div className='MainApp-layout'>
        <motion.div className='MainApp-layout-nav'>
          <Link
            className={classNames("MainApp-layout-nav-item", { "MainApp-layout-nav-item-active": currentView === "main/subscription" })}
            to="main/subscription">Подписка</Link>
          <Link
            className={classNames("MainApp-layout-nav-item", { "MainApp-layout-nav-item-active": currentView === "main/settings" })}
            to="main/settings">Настройки</Link>
          <Link
            className={classNames("MainApp-layout-nav-item", { "MainApp-layout-nav-item-active": currentView === "main/terminal" })}
            to="main/terminal">Терминал</Link>
          <a href="">
            <img src={tgIcon} alt="tg-icon" />
          </a>

        </motion.div>
        <div className='MainApp-layout-content'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentView} // Ключ изменяется при смене currentView, что запускает анимацию
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ width: '100%', height: '100%' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
        <motion.img
          className='MainApp-layout-bgImg'
          src={mainScreenBg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>
    </ScreensLayoutWrapper>
  )
}

const App = () => {


  const [authScreenAnimationStep, setAuthScreenAnimationStep] = useState<AnimationSteps>("0");
  const [successAuthFormAnimationStep, setSuccessAuthFormAnimationStep] = useState<"0" | "1" | "2" | "3">("0");
  const { currentView } = useNavigation()

  return (
    <div className="App">
      <div className='App-light1'></div>
      <div className='App-light2'></div>
      <AnimatePresence>
        {successAuthFormAnimationStep === "0" && currentView === "auth" &&
          <motion.div
            className={"App-logo-container"}
            exit={{
              opacity: 0,
              scale: 0.7,
              transition: { duration: 1 }
            }}
          >
            <motion.img
              className={"AuthScreen-logo"}
              src={logo}
              alt="Logo-Img"
              initial={false}
              variants={LogoVariants}
              animate={authScreenAnimationStep}
            />
          </motion.div>
        }
      </AnimatePresence>

      <div className='App-content'>
        <ScreenWrapper content={<AuthScreen
          animationStep={authScreenAnimationStep}
          setAnimationStep={setAuthScreenAnimationStep}
          successFormAnimationStep={successAuthFormAnimationStep}
          setSuccessFormAnimationStep={setSuccessAuthFormAnimationStep}
        />} path={'auth'} />
        <MainAppLayout>
          <ScreenWrapper content={<AuthSecuredScreen screen={<SettingsScreen />} />} path={'main/settings'} />
          <ScreenWrapper content={<AuthSecuredScreen screen={<MainScreen />} />} path={'main/terminal'} />
          <ScreenWrapper content={<AuthSecuredScreen screen={<MainScreen />} />} path={'main/subscription'} />
        </MainAppLayout>

      </div>

    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <NavigationProvider>
      <App />
    </NavigationProvider>
  </QueryClientProvider>
)

