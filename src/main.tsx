
import { createRoot } from 'react-dom/client'
import './index.css'
import { NavigationProvider } from '@/utils/contexts/NavigationContext';
import { ScreenWrapper } from '@/components';
import MainScreen from './screens/MainScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AuthSecuredScreen from "./utils/hocs/AuthSecuredScreen/AuthSecuredScreen";
import AuthScreen, { LogoVariants, type AnimationSteps } from './screens/AuthScreen';
import { AnimatePresence, motion } from 'motion/react';
import logo from './assets/logo.svg';
import { useState } from 'react';



const queryClient = new QueryClient()


const App = () => {


  const [authScreenAnimationStep, setAuthScreenAnimationStep] = useState<AnimationSteps>("0");
  const [successAuthFormAnimationStep, setSuccessAuthFormAnimationStep] = useState<"0" | "1" | "2" | "3">("0");

  return (
    <div className="App">
      <div className='App-light1'></div>
      <div className='App-light2'></div>
      <AnimatePresence>
        {successAuthFormAnimationStep === "0" &&
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
        <ScreenWrapper content={<AuthSecuredScreen screen={<MainScreen />} />} path={'main'} />
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

