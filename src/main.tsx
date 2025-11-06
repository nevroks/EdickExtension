
import { createRoot } from 'react-dom/client'
import './index.css'
import { NavigationProvider } from '@/utils/contexts/NavigationContext';
import { ScreenWrapper } from '@/components';
import MainScreen from './screens/MainScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <NavigationProvider>
      <ScreenWrapper content={<MainScreen />} path={'main'} />
    </NavigationProvider>
  </QueryClientProvider>




)
