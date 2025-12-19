import Link from 'next/link'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>AI</div>
          <div className={styles.logoText}>
            <div className={styles.logoTitle}>AI Intelligence</div>
            <div className={styles.logoSubtitle}>Market Platform</div>
          </div>
        </div>
      </div>
      <div className={styles.rightSection}>

        <Link href="/alerts" className={styles.notificationButton}>
          <span className={styles.bellIcon}>🔔</span>
        </Link>
        <div className={styles.userAvatar}>
          <span>A</span>
        </div>
      </div>
    </header>
  )
}


