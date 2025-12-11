'use client'

import { useState } from 'react'
import Card from '../../components/Card'
import styles from './Alerts.module.css'

export default function Alerts({ alerts }) {
  const [filter, setFilter] = useState('all')

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return '#f87171'
      case 'high':
        return '#fbbf24'
      case 'medium':
        return '#4facfe'
      case 'low':
        return '#94a3b8'
      default:
        return '#94a3b8'
    }
  }

  const getSeverityBg = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'rgba(248, 113, 113, 0.1)'
      case 'high':
        return 'rgba(251, 191, 36, 0.1)'
      case 'medium':
        return 'rgba(79, 172, 254, 0.1)'
      case 'low':
        return 'rgba(148, 163, 184, 0.1)'
      default:
        return 'rgba(148, 163, 184, 0.1)'
    }
  }

  const filteredAlerts =
    filter === 'all'
      ? alerts
      : alerts.filter((alert) => alert.severity.toLowerCase() === filter)

  if (alerts.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No alerts available.</p>
      </div>
    )
  }

  return (
    <div className={styles.alerts}>
      <div className={styles.filters}>
        <button
          onClick={() => setFilter('all')}
          className={`${styles.filterButton} ${
            filter === 'all' ? styles.active : ''
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`${styles.filterButton} ${
            filter === 'critical' ? styles.active : ''
          }`}
        >
          Critical
        </button>
        <button
          onClick={() => setFilter('high')}
          className={`${styles.filterButton} ${
            filter === 'high' ? styles.active : ''
          }`}
        >
          High
        </button>
        <button
          onClick={() => setFilter('medium')}
          className={`${styles.filterButton} ${
            filter === 'medium' ? styles.active : ''
          }`}
        >
          Medium
        </button>
        <button
          onClick={() => setFilter('low')}
          className={`${styles.filterButton} ${
            filter === 'low' ? styles.active : ''
          }`}
        >
          Low
        </button>
      </div>

      <div className={styles.list}>
        {filteredAlerts.map((alert, index) => (
          <Card key={index} className={styles.alertCard}>
            <div className={styles.alertHeader}>
              <div className={styles.alertTitle}>
                <h3>{alert.title}</h3>
                <span
                  className={styles.severity}
                  style={{
                    color: getSeverityColor(alert.severity),
                    backgroundColor: getSeverityBg(alert.severity),
                  }}
                >
                  {alert.severity}
                </span>
              </div>
              <span className={styles.timestamp}>
                {new Date(alert.timestamp).toLocaleString()}
              </span>
            </div>
            <p className={styles.alertMessage}>{alert.message}</p>
            <div className={styles.alertMeta}>
              <span className={styles.airline}>{alert.airline}</span>
              <span className={styles.category}>{alert.category}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}


