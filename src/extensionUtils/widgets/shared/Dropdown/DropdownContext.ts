import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'
import type { DropdownOptionType } from '.'


type DropdownContextType<T extends string> = {
	selectedOption: DropdownOptionType<T>
	setSelectedOption: Dispatch<SetStateAction<DropdownOptionType<T>>>
	options: DropdownOptionType<T>[]
	isMenuOpened: boolean
	setIsMenuOpened: Dispatch<SetStateAction<boolean>>
	onOptionChange?: (option: DropdownOptionType<T>) => void
	closeOnChange: boolean
}

const DropdownContext = createContext<unknown>(null) // Используем unknown

export function useDropdownContext<T extends string>() {
	const context = useContext(DropdownContext) as DropdownContextType<T> // Приведение типа
	if (!context) {
		throw new Error('DropdownContext must be used within a DropdownProvider')
	}
	return context
}

export default DropdownContext
