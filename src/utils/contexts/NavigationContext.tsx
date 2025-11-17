import { createContext, useContext, useState, type ReactNode } from "react";

export type View = 'main' | 'settings' | 'about' | 'profile' | 'auth';

export interface NavigationContextType {
    currentView: View;
    navigateTo: (view: View) => void;
    // Можно добавить back/forward если понадобится
}

// Дефолтные значения
const defaultContext: NavigationContextType = {
    currentView: 'main',
    navigateTo: () => {
        console.warn('NavigationContext not implemented');
    },
};

// Создаем контекст
const NavigationContext = createContext<NavigationContextType>(defaultContext);

// Props для провайдера
interface NavigationProviderProps {
    children: ReactNode;
    initialView?: View;
}

// Провайдер контекста
export function NavigationProvider({
    children,
    initialView = 'main'
}: NavigationProviderProps) {
    const [currentView, setCurrentView] = useState<View>(initialView);

    const navigateTo = (view: View) => {
        setCurrentView(view);
    };

    const value: NavigationContextType = {
        currentView,
        navigateTo,
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
}

// Хук для использования контекста
export function useNavigation(): NavigationContextType {
    const context = useContext(NavigationContext);

    if (!context) {
        throw new Error('useNavigation must be used within NavigationProvider');
    }

    return context;
}