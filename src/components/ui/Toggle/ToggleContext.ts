import { createContext, useContext } from 'react'



type ToggleContextType = {
    isChecked: boolean
}

export const ToggleContext = createContext<ToggleContextType | null>(
    null
)

export function useToggleContext() {
    const context = useContext(ToggleContext)
    if (!context) {
        throw new Error(
            "Toggle.* components must be wrapped in a Toggle component"
        )
    }
    return context
}
