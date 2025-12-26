'use client'

import { useState, useEffect } from 'react'
import Alerts from './Alerts'
import styles from './page.module.css'
import { DEFAULT_UNKNOWN_AIRLINE } from '../constants'

export default function AlertsPage() {
    // Helper function to validate airline names
    const isValidAirlineName = (name) => {
        if (!name || typeof name !== 'string') return false
        
        const nameLower = name.toLowerCase().trim()
        
        // Filter out error messages and invalid text
        const invalidPatterns = [
            'no airline',
            'there are no',
            'not mentioned',
            'no specific',
            'cannot identify',
            'unable to',
            'provided text',
            'mentioned in',
            'the provided',
            "i'm sorry",
            'does not contain',
            'sorry, but'
        ]
        
        // Check if name contains any invalid pattern
        for (const pattern of invalidPatterns) {
            if (nameLower.includes(pattern)) {
                return false
            }
        }
        
        // Filter out names that are too long (likely error messages)
        if (name.length > 50) {
            return false
        }
        
        return true
    }
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
        // Filter airline name
        let airline = record.airline
        if (record.airlines && Array.isArray(record.airlines)) {
          const validAirlines = record.airlines.filter(a => isValidAirlineName(a))
          airline = validAirlines.length > 0 ? validAirlines[0] : DEFAULT_UNKNOWN_AIRLINE
        } else if (record.airline) {
          const airlines = record.airline.split(',').map(a => a.trim()).filter(a => isValidAirlineName(a))
          airline = airlines.length > 0 ? airlines[0] : DEFAULT_UNKNOWN_AIRLINE
        } else {
          airline = DEFAULT_UNKNOWN_AIRLINE
        }
        
        const key = `${airline}_${record.theme}`
        if (!airlineThemeMap[key]) {
          airlineThemeMap[key] = []
        }
        airlineThemeMap[key].push({ ...record, airline })
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

          // Get themes - support both old format (string) and new format (array)
          const recordThemes = latestRecord.themes || (latestRecord.theme ? latestRecord.theme.split(',').map(t => t.trim()).filter(t => t) : [])
          const displayThemes = recordThemes.length > 0 ? recordThemes : (theme ? [theme] : [])
          
          generatedAlerts.push({
            title: `${airline} - ${displayThemes.join(', ')} Activity`,
            message: latestRecord.summary || `Multiple ${displayThemes.join(', ').toLowerCase()} signals detected for ${airline}`,
            severity,
            airline,
            category: displayThemes.join(', '),
            categories: displayThemes,
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
        // Filter airline name
        let airline = record.airline
        if (record.airlines && Array.isArray(record.airlines)) {
          const validAirlines = record.airlines.filter(a => isValidAirlineName(a))
          airline = validAirlines.length > 0 ? validAirlines[0] : DEFAULT_UNKNOWN_AIRLINE
        } else if (record.airline) {
          const airlines = record.airline.split(',').map(a => a.trim()).filter(a => isValidAirlineName(a))
          airline = airlines.length > 0 ? airlines[0] : DEFAULT_UNKNOWN_AIRLINE
        } else {
          airline = DEFAULT_UNKNOWN_AIRLINE
        }

        const signal = (record.signal || '').toLowerCase()
        const severity = signal.includes('critical') || signal.includes('strong negative') ? 'Critical' :
                        signal.includes('high negative') ? 'High' : 'Medium'

        const recordDate = new Date(record.date + 'T' + record.time)
        const timestamp = recordDate.toISOString()

        // Get themes - support both old format (string) and new format (array)
        const recordThemes = record.themes || (record.theme ? record.theme.split(',').map(t => t.trim()).filter(t => t) : [])
        const displayThemes = recordThemes.length > 0 ? recordThemes : (record.theme ? [record.theme] : ['General'])
        
        generatedAlerts.push({
          title: `${airline} - ${displayThemes.join(', ')} Alert`,
          message: record.summary || `Negative signal detected for ${airline}`,
          severity,
          airline: airline,
          category: displayThemes.join(', '),
          categories: displayThemes,
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


