'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Navbar.module.css'

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/voice-capture', icon: '🎤', label: 'Voice Intel' },
    { href: '/insights', icon: '📊', label: 'Insights' },
    { href: '/dashboard', icon: '📈', label: 'Dashboard' },
    { href: '/updates', icon: '📰', label: 'Updates' },
    { href: '/alerts', icon: '🔔', label: 'Alerts' },
  ]

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoSection}>
        <span className={styles.logoIcon}>✈️</span>
      </div>
      <div className={styles.navItems}>
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              title={item.label}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          )
        })}
      </div>
      <div className={styles.navFooter}>
        <Link href="/auth" className={styles.navItem} title="Login/Logout">
          <span className={styles.navIcon}>🔐</span>
        </Link>
        <button className={styles.navItem} title="Help">
          <span className={styles.navIcon}>❓</span>
        </button>
      </div>
    </nav>
  )
}
