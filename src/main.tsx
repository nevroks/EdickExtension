
import { createRoot } from 'react-dom/client'
import './index.css'
import { NavigationProvider, useNavigation, type View } from '@/utils/contexts/NavigationContext';
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
import { Button, Link } from '@/ui';
import classNames from 'classnames';
import SettingsScreen from './screens/SettingsScreen';



const queryClient = new QueryClient()

const MainAppLayout = ({ children }: { children: ReactNode }) => {

  const { currentView, navigateTo } = useNavigation()
  const [isTransitionAnimating, setIsTransitionAnimating] = useState(false)


  const handleNavigation = (to: View) => {
    if (currentView === to || isTransitionAnimating) {
      return
    }
    setIsTransitionAnimating(true)
    setTimeout(() => {
      setIsTransitionAnimating(false)
      navigateTo(to)
    }, 200)

  }


  return (
    <ScreensLayoutWrapper path="main">
      <div className='MainApp-layout'>
        <motion.div
          className='MainApp-layout-nav'
          initial={{ y: -140 }}
          animate={{ y: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: 0.2, // небольшая задержка после появления фона
            duration: 0.7
          }}
        >
          <div
            onClick={() => handleNavigation("main/subscription")}
            className={classNames("MainApp-layout-nav-item", { "MainApp-layout-nav-item-active": currentView === "main/subscription" })}
          >Подписка</div>
          <div
            onClick={() => handleNavigation("main/settings")}
            className={classNames("MainApp-layout-nav-item", { "MainApp-layout-nav-item-active": currentView === "main/settings" })}
          >Настройки</div>
          <div
            onClick={() => handleNavigation("main/terminal")}
            className={classNames("MainApp-layout-nav-item", { "MainApp-layout-nav-item-active": currentView === "main/terminal" })}
          >Терминал</div>
          <a href="">
            <img src={tgIcon} alt="tg-icon" />
          </a>

        </motion.div>
        <div className='MainApp-layout-content'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentView}
              initial={{
                opacity: 0,
                scale: 0.95,
                filter: "blur(4px)",
                y: 20
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                filter: "blur(4px)",
                y: -20
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut"
              }}
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

