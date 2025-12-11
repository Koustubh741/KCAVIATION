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
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search me..."
            className={styles.searchInput}
          />
        </div>
        <button className={styles.notificationButton}>
          <span className={styles.bellIcon}>🔔</span>
        </button>
        <div className={styles.userAvatar}>
          <span>A</span>
        </div>
      </div>
    </header>
  )
}


