import React, { useMemo } from 'react'
import { useDropdownContext } from './DropdownContext'
import { motion, type HTMLMotionProps, type Variants,  } from 'motion/react'
import classNames from 'classnames'
import styles from './style.module.css'
import type { DropdownOptionType } from '.'


type DropdownMenuItemProps<T extends string> = HTMLMotionProps<'li'> & {
	option: DropdownOptionType<T>
}
const DropdownMenuItemVariants: Variants = {
	hidden: { opacity: 0, y: -10 },
	visible: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -10 }
}
function DropdownMenuItem<T extends string>({
	option,
	onClick,
	...props
}: DropdownMenuItemProps<T>) {
	const {
		setSelectedOption,
		selectedOption,
		onOptionChange,
		setIsMenuOpened,
		closeOnChange
	} = useDropdownContext()

	const isOptionSelected = useMemo(() => {
		if (!selectedOption) {
			return false
		} else {
			return selectedOption.value === option.value
		}
	}, [JSON.stringify(selectedOption)])

	const handleOptionClick = (event: React.MouseEvent<HTMLLIElement>) => {
		onClick && onClick(event)
		if (isOptionSelected) {
			return
		} else {
			setSelectedOption(option)
			closeOnChange && setIsMenuOpened(false)
			onOptionChange && onOptionChange(option)
		}
	}

	return (
		<motion.li
			onClick={handleOptionClick}
			className={classNames(styles['DropdownMenuItem'], {
				[styles.selected]: isOptionSelected
			})}
			variants={DropdownMenuItemVariants}
			initial='hidden'
			animate='visible'
			exit='exit'
			{...props}
		>
			{option.text}
		</motion.li>
	)
}

export default DropdownMenuItem
