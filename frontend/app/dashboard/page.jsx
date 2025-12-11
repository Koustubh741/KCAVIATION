'use client'

import Dashboard from './Dashboard'
import styles from './page.module.css'

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          Overview of market intelligence and predictive analytics
        </p>
      </div>
      <Dashboard />
    </div>
  )
}
