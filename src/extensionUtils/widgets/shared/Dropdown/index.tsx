import {
	
	useEffect,
	useRef,
	useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction
} from 'react'

import styles from './style.module.css'
import DropdownContext from './DropdownContext'
import DropdownButton from './DropdownButton'
import DropdownMenu from './DropdownMenu'

export type DropdownOptionType<T extends number | string> = {
	value: T
	text: string
}

export type DropdownPropsType<T extends string> = {
	children: ReactNode
	optionsArr: DropdownOptionType<T>[]
	setSelectedOption: Dispatch<SetStateAction<DropdownOptionType<T> | null>>
	selectedOption: DropdownOptionType<T> | null
	onOptionChange?: (option: DropdownOptionType<T>) => void
	closeOnChange?: boolean
}

function Dropdown<T extends string>({
	children,
	optionsArr,
	setSelectedOption,
	selectedOption,
	onOptionChange,
	closeOnChange = true
}: DropdownPropsType<T>) {
	const [isMenuOpened, setIsMenuOpened] = useState(false)

	const DropdownRef = useRef<HTMLDivElement | null>(null)

	//close on click out of the dropdown
	useEffect(() => {
		const handler = (event: MouseEvent) => {
			if (
				DropdownRef.current &&
				!DropdownRef.current.contains(event.target as Node)
			) {
				setIsMenuOpened(false)
			}
		}

		document.addEventListener('click', handler)

		return () => {
			document.removeEventListener('click', handler)
		}
	}, [DropdownRef])

	return (
		<DropdownContext.Provider
			value={{
				selectedOption: selectedOption,
				setSelectedOption: setSelectedOption,
				options: optionsArr,
				setIsMenuOpened: setIsMenuOpened,
				isMenuOpened: isMenuOpened,
				onOptionChange: onOptionChange,
				closeOnChange: closeOnChange
			}}
		>
			<div ref={DropdownRef} className={styles['Dropdown-wrapper']}>
				{children}
			</div>
		</DropdownContext.Provider>
	)
}

Dropdown.Button = DropdownButton
Dropdown.Menu = DropdownMenu
export default Dropdown
