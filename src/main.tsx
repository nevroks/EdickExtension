
import { createRoot } from 'react-dom/client'
import './index.css'
import { NavigationProvider } from '@/utils/contexts/NavigationContext';
import { ScreenWrapper } from '@/components';
import MainScreen from './screens/MainScreen';



createRoot(document.getElementById('root')!).render(
  <NavigationProvider>
    <ScreenWrapper content={<MainScreen />} path={'main'} />
  </NavigationProvider>


)
