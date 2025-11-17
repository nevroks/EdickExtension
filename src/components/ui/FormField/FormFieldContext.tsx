import { createContext, useContext } from "react"



type FormFieldContextType = {
    error: string
}

const FormFieldContext = createContext<unknown>(null) // Используем unknown

export function useFormFieldContext() {
    const context = useContext(FormFieldContext) as FormFieldContextType
    if (!context) {
        throw new Error('FormFieldContext must be used within a DropdownProvider')
    }
    return context
}

export default FormFieldContext
