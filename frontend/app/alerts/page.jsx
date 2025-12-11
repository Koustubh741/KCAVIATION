'use client'

import { useState, useEffect } from 'react'
import Alerts from './Alerts'
import styles from './page.module.css'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      const data = await response.json()
      setAlerts(data)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Alerts</h1>
        <p className={styles.subtitle}>
          Real-time market intelligence alerts and notifications
        </p>
      </div>
      {loading ? (
        <div className={styles.loading}>Loading alerts...</div>
      ) : (
        <Alerts alerts={alerts} />
      )}
    </div>
  )
}


