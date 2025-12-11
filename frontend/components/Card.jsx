import styles from './Card.module.css'
import clsx from 'clsx'

export default function Card({ children, className, ...props }) {
  return (
    <div className={clsx(styles.card, className)} {...props}>
      {children}
    </div>
  )
}


