import {  useState, type ReactNode } from 'react'
import { useDropdownContext } from './DropdownContext'
import {
	AnimatePresence,
	motion,
    type HTMLMotionProps,
    type Variants,
	
} from 'motion/react'
import classNames from 'classnames'
import styles from './style.module.css'
import DropdownMenuItem from './DropdownMenuItem'


const DropdownMenuVariants: Variants = {
	hidden: { opacity: 0, height: 0 },
	visible: {
		opacity: 1,
		height: 'auto',
		transition: {
			staggerChildren: 0.1
		}
	},
	exit: { opacity: 0, height: 0 }
}

type DropdownMenuProps = HTMLMotionProps<'ul'> & {
	children: ReactNode
}

const DropdownMenu = ({ children, className, ...rest }: DropdownMenuProps) => {
	const { isMenuOpened } = useDropdownContext()
	const [isAnimationComplete, setIsAnimationComplete] = useState(false)

	return (
		<AnimatePresence>
			{isMenuOpened && (
				<motion.ul
					{...rest}
					className={classNames(styles['DropdownMenu'], {
						[styles.opened]: isMenuOpened,
						[className!]: Boolean(className),
						[styles.animationGoing]: Boolean(!isAnimationComplete)
					})}
					initial='hidden'
					animate='visible'
					exit='exit'
					variants={DropdownMenuVariants}
					onAnimationComplete={() => setIsAnimationComplete(true)}
					onAnimationStart={() => setIsAnimationComplete(false)}
				>
					{children}
				</motion.ul>
			)}
		</AnimatePresence>
	)
}

DropdownMenu.Item = DropdownMenuItem

export default DropdownMenu
