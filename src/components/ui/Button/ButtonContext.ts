import { createContext, useContext } from 'react'
import type { ButtonVariant } from './Button'


type ButtonContextType = {
    disabled: boolean
    variant: ButtonVariant
}

export const ButtonContext = createContext<ButtonContextType | null>(
    null
)

export function useButtonContext() {
    const context = useContext(ButtonContext)
    if (!context) {
        throw new Error(
            "Button.* components must be wrapped in a Button component"
        )
    }
    return context
}
