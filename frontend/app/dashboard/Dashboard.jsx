'use client'

import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import { DEFAULT_UNKNOWN_AIRLINE } from '../constants'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalInsights: 0,
    positiveSentiment: 0,
    activeAirlines: 0,
    avgConfidence: 0,
  })

  const [recordingHistory, setRecordingHistory] = useState([])

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
  const [themePeriod, setThemePeriod] = useState('month') // day, week, month, quarter, year
  const [loading, setLoading] = useState(true)

  // Backend themes matching backend/src/config/themes.py
  const BACKEND_THEMES = [
    'Hiring', 
    'Firing', 
    'Fleet Expansion', 
    'Market Competition', 
    'Pilot Training Demand', 
    'Operational Efficiency', 
    'Regulatory Compliance', 
    'Financial Performance', 
    'Route Expansion', 
    'Technology & Innovation', 
    'Safety & Security'
  ]

  const calculateStats = (history) => {
    if (!history || history.length === 0) {
      setStats({
        totalInsights: 0,
        positiveSentiment: 0,
        activeAirlines: 0,
        avgConfidence: 0,
      })
      return
    }

    // Total insights
    const totalInsights = history.length

    // Calculate sentiment
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 }
    history.forEach(record => {
      const signal = record.signal?.toLowerCase() || ''
      if (signal.includes('positive')) {
        sentimentCounts.positive++
      } else if (signal.includes('negative')) {
        sentimentCounts.negative++
      } else {
        sentimentCounts.neutral++
      }
    })
    const positiveSentiment = totalInsights > 0 
      ? Math.round((sentimentCounts.positive / totalInsights) * 100) 
      : 0

    // Active airlines (extract individual airlines from both array and string formats)
    const allAirlinesFromHistory = []
    history.forEach(r => {
      if (r.airlines && Array.isArray(r.airlines)) {
        // New format: airlines is an array - filter invalid names
        allAirlinesFromHistory.push(...r.airlines.filter(a => isValidAirlineName(a)))
      } else if (r.airline) {
        // Old format: airline is a string (may be comma-separated) - filter invalid names
        const airlines = r.airline.split(',').map(a => a.trim()).filter(a => a && isValidAirlineName(a))
        allAirlinesFromHistory.push(...airlines)
      }
    })
    const uniqueAirlines = new Set(allAirlinesFromHistory)
    const activeAirlines = uniqueAirlines.size

    // Average confidence (default to 0.85 if not available)
    const avgConfidence = 0.85 // Can be enhanced if confidence scores are stored

    setStats({
      totalInsights,
      positiveSentiment,
      activeAirlines,
      avgConfidence,
    })
  }

  useEffect(() => {
    const loadDashboardData = () => {
      // Load local history
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      const currentEmail = user ? user.email : 'guest'

      const history = JSON.parse(localStorage.getItem('recording_history') || '[]')
      const userSpecificHistory = history.filter(record => record.userId === currentEmail)
      setRecordingHistory(userSpecificHistory)

      // Calculate real stats from history
      calculateStats(userSpecificHistory)
      setLoading(false)
    }

    loadDashboardData()

    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)

    // Listen for storage changes (when new recordings are added)
    window.addEventListener('storage', loadDashboardData)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', loadDashboardData)
    }
  }, [])

  // Calculate Emerging Themes from actual data
  const getEmergingThemes = () => {
    const now = new Date()
    const filteredByTime = recordingHistory.filter(record => {
      if (!record.date) return false
      const recordDate = new Date(record.date)
      
      if (themePeriod === 'day') {
        return recordDate.toDateString() === now.toDateString()
      } else if (themePeriod === 'week') {
        // Get start of current week (Monday)
        const startOfWeek = new Date(now)
        const day = startOfWeek.getDay()
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
        startOfWeek.setDate(diff)
        startOfWeek.setHours(0, 0, 0, 0)
        
        // Get end of current week (Sunday)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)
        
        return recordDate >= startOfWeek && recordDate <= endOfWeek
      } else if (themePeriod === 'month') {
        return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
      } else if (themePeriod === 'quarter') {
        // Calculate current quarter
        const currentQuarter = Math.floor(now.getMonth() / 3) // 0-3 (Q1-Q4)
        const quarterStartMonth = currentQuarter * 3 // 0, 3, 6, or 9
        const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1)
        const quarterEnd = new Date(now.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59, 999)
        
        return recordDate >= quarterStart && recordDate <= quarterEnd
      } else if (themePeriod === 'year') {
        return recordDate.getFullYear() === now.getFullYear()
      }
      return true
    })

    // Count themes from actual records
    const themeCounts = {}
    BACKEND_THEMES.forEach(theme => {
      themeCounts[theme] = 0
    })

    filteredByTime.forEach(record => {
      // Extract themes from both array and string formats
      const recordThemes = record.themes || (record.theme ? record.theme.split(',').map(t => t.trim()) : [])
      
      // Count exact theme matches
      recordThemes.forEach(recordTheme => {
        if (recordTheme && BACKEND_THEMES.includes(recordTheme)) {
          themeCounts[recordTheme]++
        }
      })
    })

    // Convert to array and sort by count
    const themesArray = Object.entries(themeCounts)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .filter(item => item.count > 0) // Only show themes with data

    return themesArray.length > 0 ? themesArray : BACKEND_THEMES.map(theme => ({ theme, count: 0 }))
  }

  // Calculate trend data from history
  const getTrendData = () => {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const thisMonthRecords = recordingHistory.filter(r => {
      if (!r.date) return false
      const recordDate = new Date(r.date)
      return recordDate >= thisMonth
    })

    const lastMonthRecords = recordingHistory.filter(r => {
      if (!r.date) return false
      const recordDate = new Date(r.date)
      return recordDate >= lastMonth && recordDate < thisMonth
    })

    const calculateThemeTrend = (themeName) => {
      const thisMonthCount = thisMonthRecords.filter(r => {
        // Check both theme formats (array and string)
        if (r.themes && Array.isArray(r.themes)) {
          return r.themes.includes(themeName)
        } else if (r.theme) {
          const themes = r.theme.split(',').map(t => t.trim())
          return themes.includes(themeName)
        }
        return false
      }).length

      const lastMonthCount = lastMonthRecords.filter(r => {
        // Check both theme formats (array and string)
        if (r.themes && Array.isArray(r.themes)) {
          return r.themes.includes(themeName)
        } else if (r.theme) {
          const themes = r.theme.split(',').map(t => t.trim())
          return themes.includes(themeName)
        }
        return false
      }).length

      const change = lastMonthCount > 0 
        ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
        : thisMonthCount > 0 ? 100 : 0

      const percentage = thisMonthRecords.length > 0
        ? Math.round((thisMonthCount / thisMonthRecords.length) * 100)
        : 0

      return {
        label: themeName,
        percentage: Math.min(percentage, 100),
        change: change > 0 ? `+${change}%` : `${change}%`,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      }
    }

    return [
      calculateThemeTrend('Hiring'),
      calculateThemeTrend('Fleet Expansion'),
      calculateThemeTrend('Financial Performance'),
      calculateThemeTrend('Operational Efficiency')
    ]
  }

  const emergingThemes = getEmergingThemes()
  const trendData = getTrendData()

  // Calculate airline activity
  const getAirlineActivity = () => {
    const airlineCounts = {}
    let recordsWithNoValidAirlines = 0
    
    recordingHistory.forEach(record => {
      // Extract individual airlines from both array and string formats
      let airlines = []
      if (record.airlines && Array.isArray(record.airlines)) {
        airlines = record.airlines.filter(a => isValidAirlineName(a))
      } else if (record.airline) {
        airlines = record.airline.split(',').map(a => a.trim()).filter(a => isValidAirlineName(a))
      }
      
      // Check if record has no valid airlines
      const hasValidAirline = airlines.some(a => a && a !== DEFAULT_UNKNOWN_AIRLINE)
      
      if (!hasValidAirline) {
        recordsWithNoValidAirlines++
      } else {
        airlines.forEach(airline => {
          if (airline && airline !== DEFAULT_UNKNOWN_AIRLINE) {
            airlineCounts[airline] = (airlineCounts[airline] || 0) + 1
          }
        })
      }
    })
    
    // Add DEFAULT_UNKNOWN_AIRLINE if there are records with no valid airlines
    if (recordsWithNoValidAirlines > 0) {
      airlineCounts[DEFAULT_UNKNOWN_AIRLINE] = recordsWithNoValidAirlines
    }

    return Object.entries(airlineCounts)
      .map(([airline, count]) => ({ airline, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 airlines
  }

  const topAirlines = getAirlineActivity()

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      {/* Summary Stats Cards */}
      <div className={styles.summaryCards}>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Total Insights</h3>
            <p className={styles.statValue}>{stats.totalInsights}</p>
          </div>
          {stats.totalInsights > 0 && (
            <div className={styles.statTrend}>
              <span className={styles.trendUp}>Live Data</span>
            </div>
          )}
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Positive Sentiment</h3>
            <p className={styles.statValue}>{stats.positiveSentiment}%</p>
          </div>
          {stats.positiveSentiment > 50 && (
            <div className={styles.statTrend}>
              <span className={styles.trendUp}>↑ Positive</span>
            </div>
          )}
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>✈️</div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Active Airlines</h3>
            <p className={styles.statValue}>{stats.activeAirlines}</p>
          </div>
          {stats.activeAirlines > 0 && (
            <div className={styles.statTrend}>
              <span className={styles.trendNeutral}>Tracked</span>
            </div>
          )}
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Avg Confidence</h3>
            <p className={styles.statValue}>
              {(stats.avgConfidence * 100).toFixed(0)}%
            </p>
          </div>
          <div className={styles.statTrend}>
            <span className={styles.trendUp}>AI Powered</span>
          </div>
        </Card>
      </div>

      {/* Emerging Themes */}
      <Card className={styles.themesCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>
            <span>✨</span> Emerging Themes
          </h2>
          <select
            className={styles.periodSelect}
            value={themePeriod}
            onChange={(e) => setThemePeriod(e.target.value)}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
        <div className={styles.themesListContainer}>
          {emergingThemes.length > 0 ? (
            emergingThemes.map((item, index) => {
              const maxCount = Math.max(...emergingThemes.map(t => t.count), 1)
              const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0
              
              return (
                <div key={index} className={styles.emergingThemeItem}>
                  <div className={styles.emergingThemeHeader}>
                    <span className={styles.emergingThemeName}>{item.theme}</span>
                    <span className={styles.emergingThemeCount}>{item.count}</span>
                  </div>
                  <div className={styles.emergingThemeBarContainer}>
                    <div
                      className={styles.emergingThemeBar}
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: item.count > 0 ? '#4ade80' : '#334155'
                      }}
                    />
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              No theme data available. Record some voice insights to see themes here.
            </div>
          )}
        </div>
      </Card>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        <Card className={styles.trendCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Trend Overview</h2>
            <button className={styles.viewAllBtn}>View All →</button>
          </div>
          <div className={styles.trendContent}>
            {trendData.length > 0 ? (
              trendData.map((trend, index) => {
                const gradientColors = {
                  'up': 'linear-gradient(90deg, #4facfe, #00f2fe)',
                  'down': 'linear-gradient(90deg, #f87171, #ef4444)',
                  'stable': 'linear-gradient(90deg, #fbbf24, #facc15)'
                }
                
                return (
                  <div key={index} className={styles.trendItem}>
                    <span className={styles.trendLabel}>{trend.label}</span>
                    <div className={styles.trendBar}>
                      <div
                        className={styles.trendFill}
                        style={{ 
                          width: `${trend.percentage}%`, 
                          background: gradientColors[trend.trend] || gradientColors['stable']
                        }}
                      ></div>
                    </div>
                    <span 
                      className={styles.trendValue}
                      style={{ 
                        color: trend.trend === 'up' ? '#4ade80' : 
                               trend.trend === 'down' ? '#f87171' : '#fbbf24'
                      }}
                    >
                      {trend.change}
                    </span>
                  </div>
                )
              })
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                No trend data available. Record insights over time to see trends.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top Airlines Section */}
      {topAirlines.length > 0 && (
        <Card className={styles.predictiveCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Top Airlines by Activity</h2>
          </div>
          <div className={styles.predictiveContent}>
            {topAirlines.map((airline, index) => {
              const maxCount = Math.max(...topAirlines.map(a => a.count), 1)
              const percentage = (airline.count / maxCount) * 100
              
              return (
                <div key={index} className={styles.predictionItem}>
                  <div className={styles.predictionIcon}>✈️</div>
                  <div className={styles.predictionInfo}>
                    <span className={styles.predictionLabel}>
                      {airline.airline}
                    </span>
                    <span className={styles.predictionDesc}>
                      {airline.count} insight{airline.count !== 1 ? 's' : ''} recorded
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '100px', 
                      height: '8px', 
                      background: 'rgba(255,255,255,0.1)', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                    <span className={`${styles.predictionValue} ${styles.high}`}>
                      {airline.count}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Recent Insights Preview */}
      {recordingHistory.length > 0 && (
        <Card className={styles.predictiveCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Recent Insights</h2>
            <button 
              className={styles.viewAllBtn}
              onClick={() => window.location.href = '/insights'}
            >
              View All →
            </button>
          </div>
          <div className={styles.predictiveContent}>
            {recordingHistory.slice(0, 5).map((record, index) => (
              <div key={index} className={styles.predictionItem}>
                <div className={styles.predictionIcon}>
                  {record.signal?.toLowerCase().includes('positive') ? '📈' : 
                   record.signal?.toLowerCase().includes('negative') ? '📉' : '📊'}
                </div>
                <div className={styles.predictionInfo}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                    {(() => {
                      let airlines = record.airlines || (record.airline ? record.airline.split(',').map(a => a.trim()) : [])
                      airlines = airlines.filter(a => isValidAirlineName(a))
                      if (airlines.length === 0) {
                        airlines = [DEFAULT_UNKNOWN_AIRLINE]
                      }
                      return airlines.map((airline, idx) => (
                        <span key={idx} className={styles.airlineBadge}>
                          {airline.trim()}
                        </span>
                      ))
                    })()}
                    {(record.themes || (record.theme ? record.theme.split(',').map(t => t.trim()) : [])).map((theme, idx) => (
                      <span key={idx} className={styles.themeBadge}>
                        {theme.trim()}
                      </span>
                    ))}
                  </div>
                  <span className={styles.predictionDesc}>
                    {record.summary?.substring(0, 80)}{record.summary?.length > 80 ? '...' : ''}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                    {record.date} • {record.time}
                  </span>
                </div>
                <span 
                  className={styles.predictionValue}
                  style={{
                    background: record.signal?.toLowerCase().includes('positive') ? 'rgba(74,222,128,0.2)' :
                               record.signal?.toLowerCase().includes('negative') ? 'rgba(248,113,113,0.2)' :
                               'rgba(148,163,184,0.2)',
                    color: record.signal?.toLowerCase().includes('positive') ? '#4ade80' :
                           record.signal?.toLowerCase().includes('negative') ? '#f87171' : '#94a3b8'
                  }}
                >
                  {record.signal || 'Neutral'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
