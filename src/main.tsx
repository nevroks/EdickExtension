
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



const queryClient = new QueryClient()

const MainAppLayout = ({ children }: { children: ReactNode }) => {



  return (
    <ScreensLayoutWrapper path="main">
      <div className='MainApp-layout'>
        <motion.div className='MainApp-layout-nav'>
          <Link to="main/terminal">Главная</Link>
          <Link to="main/settings">Настройки</Link>
          <Link to="main/subscription">Выход</Link>
          <a href="">
            <img src={tgIcon} alt="tg-icon" />
          </a>

        </motion.div>
        <div className='MainApp-layout-content'>
          {children}
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
        {/* <ScreenWrapper content={<AuthScreen
          animationStep={authScreenAnimationStep}
          setAnimationStep={setAuthScreenAnimationStep}
          successFormAnimationStep={successAuthFormAnimationStep}
          setSuccessFormAnimationStep={setSuccessAuthFormAnimationStep}
        />} path={'auth'} /> */}
        <MainAppLayout>
          <></>
          {/* <ScreenWrapper content={<AuthSecuredScreen screen={<MainScreen />} />} path={'main/settings'} />
          <ScreenWrapper content={<AuthSecuredScreen screen={<MainScreen />} />} path={'main/terminal'} />
          <ScreenWrapper content={<AuthSecuredScreen screen={<MainScreen />} />} path={'main/subscription'} /> */}
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

