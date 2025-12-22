'use client'

import { useState, useEffect } from 'react'
import Alerts from './Alerts'
import styles from './page.module.css'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateAlertsFromRecordings()
    
    // Refresh every 30 seconds
    const interval = setInterval(generateAlertsFromRecordings, 30000)
    window.addEventListener('storage', generateAlertsFromRecordings)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', generateAlertsFromRecordings)
    }
  }, [])

  const generateAlertsFromRecordings = () => {
    try {
      // Get user
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      const currentEmail = user ? user.email : 'guest'

      // Load recordings
      const history = JSON.parse(localStorage.getItem('recording_history') || '[]')
      const userRecords = history.filter(record => record.userId === currentEmail)

      if (userRecords.length === 0) {
        setAlerts([])
        setLoading(false)
        return
      }

      // Generate alerts from recordings
      const generatedAlerts = []

      // Group by airline and theme to find patterns
      const airlineThemeMap = {}
      userRecords.forEach(record => {
        const key = `${record.airline}_${record.theme}`
        if (!airlineThemeMap[key]) {
          airlineThemeMap[key] = []
        }
        airlineThemeMap[key].push(record)
      })

      // Generate alerts for significant patterns
      Object.entries(airlineThemeMap).forEach(([key, records]) => {
        if (records.length >= 2) { // Multiple signals for same airline+theme
          const [airline, theme] = key.split('_')
          const signal = records[0].signal || 'Neutral'
          const signalLower = signal.toLowerCase()
          
          let severity = 'Medium'
          if (signalLower.includes('critical') || signalLower.includes('strong negative')) {
            severity = 'Critical'
          } else if (signalLower.includes('high negative') || signalLower.includes('strong positive')) {
            severity = 'High'
          } else if (signalLower.includes('low') || signalLower.includes('neutral')) {
            severity = 'Low'
          }

          const latestRecord = records.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time)
            const dateB = new Date(b.date + 'T' + b.time)
            return dateB - dateA
          })[0]

          const recordDate = new Date(latestRecord.date + 'T' + latestRecord.time)
          const hoursAgo = Math.floor((Date.now() - recordDate.getTime()) / (1000 * 60 * 60))
          const timestamp = hoursAgo < 1 
            ? new Date(Date.now() - 30 * 60 * 1000).toISOString()
            : new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()

          generatedAlerts.push({
            title: `${airline} - ${theme} Activity`,
            message: latestRecord.summary || `Multiple ${theme.toLowerCase()} signals detected for ${airline}`,
            severity,
            airline,
            category: theme,
            timestamp
          })
        }
      })

      // Add alerts for negative signals
      const negativeRecords = userRecords
        .filter(r => {
          const signal = (r.signal || '').toLowerCase()
          return signal.includes('negative') || signal.includes('critical')
        })
        .slice(0, 5)

      negativeRecords.forEach(record => {
        const signal = (record.signal || '').toLowerCase()
        const severity = signal.includes('critical') || signal.includes('strong negative') ? 'Critical' :
                        signal.includes('high negative') ? 'High' : 'Medium'

        const recordDate = new Date(record.date + 'T' + record.time)
        const timestamp = recordDate.toISOString()

        generatedAlerts.push({
          title: `${record.airline} - ${record.theme} Alert`,
          message: record.summary || `Negative signal detected for ${record.airline}`,
          severity,
          airline: record.airline,
          category: record.theme,
          timestamp
        })
      })

      // Sort by timestamp (newest first)
      generatedAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      setAlerts(generatedAlerts.slice(0, 20)) // Limit to 20 most recent
      setLoading(false)
    } catch (error) {
      console.error('Error generating alerts:', error)
      setAlerts([])
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


