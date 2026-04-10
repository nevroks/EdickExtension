import classNames from 'classnames'
import styles from './style.module.css'
import { useDropdownContext } from './DropdownContext'
import type { ButtonHTMLAttributes } from 'react'
import arrowIcon from './../../../../assets/arrow.svg'



export type DropdownButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    defaultText?: string
    textClassName?: string
    arrowColor?: 'default'
}

const DropdownButton = ({
    className,
    children,
    onClick,
    defaultText,
    textClassName,
    arrowColor = 'default',
    ...props
}: DropdownButtonProps) => {
    const { setIsMenuOpened, selectedOption, isMenuOpened } = useDropdownContext()

    const selectButtonClickHandler = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        setIsMenuOpened(prevState => !prevState)
        {
            onClick && onClick(event)
        }
    }

    return (
        <button
            onClick={selectButtonClickHandler}
            className={classNames(styles['DropdownButton'], {
                [styles.active]: isMenuOpened,
                [className!]: Boolean(className)
            })}
            {...props}
        >
            <div className={styles['DropdownButton-content']}>
                {children}
                <p
                    className={classNames(styles['DropdownButton-text'], {
                        'button-large-medium': !Boolean(textClassName),
                        [textClassName!]: Boolean(textClassName),
                        [styles.unselected]: !Boolean(selectedOption)
                    })}
                >
                    {defaultText && !selectedOption
                        ? defaultText
                        : selectedOption
                            ? selectedOption.text
                            : ''}
                </p>
            </div>
            <img src={arrowIcon} alt="arrow" className={classNames(styles['DropdownButton-arrow'], {
            })} />
        </button>
    )
}

export default DropdownButton
