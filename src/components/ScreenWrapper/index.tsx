import { useNavigation, type View } from '@/utils/contexts/NavigationContext';
import  { type ReactNode } from 'react';

type ScreenWrapperProps = {
    content: ReactNode;
    path: View;

};

const ScreenWrapper = ({ content, path }: ScreenWrapperProps) => {

    const { currentView } = useNavigation()

    return currentView === path ? content : null
}

export default ScreenWrapper;
