
import { createRoot } from 'react-dom/client'
import './index.css'
import { NavigationProvider } from '@/utils/contexts/NavigationContext';
import { ScreenWrapper } from '@/components';
import MainScreen from './screens/MainScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AuthSecuredScreen from "./utils/hocs/AuthSecuredScreen/AuthSecuredScreen";
import AuthScreen from './screens/AuthScreen';


const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <NavigationProvider>
      <div className="App">
        <ScreenWrapper content={<AuthScreen />} path={'auth'} />
        <ScreenWrapper content={<AuthSecuredScreen screen={<MainScreen />} />} path={'main'} />
      </div>

    </NavigationProvider>
  </QueryClientProvider>




)
