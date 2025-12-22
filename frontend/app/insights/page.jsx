'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import Card from '../../components/Card'

export default function InsightsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')

  // Modal State
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [selectedAirline, setSelectedAirline] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')


  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    airline: '',
    country: '',
    theme: '',
    date: ''
  })

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

  // Calculate filter options from real data
  const calculateFilterOptions = (history) => {
    const airlines = [...new Set(history.map(r => r.airline).filter(a => a && a !== 'Unknown Airline'))].sort()
    const countries = [...new Set(history.map(r => r.country).filter(c => c))].sort()
    const themes = [...new Set(history.map(r => r.theme).filter(t => t))].sort()
    
    return {
      airlines: airlines.length > 0 ? airlines : [],
      countries: countries.length > 0 ? countries : ['India'],
      themes: themes.length > 0 ? themes : BACKEND_THEMES
    }
  }

  const [filterOptions, setFilterOptions] = useState({
    airlines: [],
    countries: ['India'],
    themes: BACKEND_THEMES
  })

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleRowClick = (record) => {
    setSelectedRecord(record)
    setActiveTab('overview')
  }

  const handleCloseModal = () => {
    setSelectedRecord(null)
  }

  // Filtered Data Logic
  const filteredHistory = data?.recordingHistory?.filter(item => {
    if (!item) return false
    
    // Search Query (matches airline, theme, summary, transcript)
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery ||
      (item.airline || '').toLowerCase().includes(searchLower) ||
      (item.theme || '').toLowerCase().includes(searchLower) ||
      (item.summary || '').toLowerCase().includes(searchLower) ||
      (item.transcript || '').toLowerCase().includes(searchLower)

    // Filters
    const matchesAirline = !filters.airline || item.airline === filters.airline
    const matchesCountry = !filters.country || item.country === filters.country
    const matchesTheme = !filters.theme || item.theme === filters.theme
    const matchesDate = !filters.date || item.date === filters.date

    return matchesSearch && matchesAirline && matchesCountry && matchesTheme && matchesDate
  }) || []

  // Calculate all data from recordings
  const calculateDataFromHistory = (history) => {
    if (!history || history.length === 0) {
      return {
        dailySummary: {
          totalSignals: 0,
          newInsights: 0,
          activeAirlines: 0,
          highRiskAlerts: 0,
          avgConfidence: 0.85
        },
        airlineSignals: [],
        trendShifts: [],
        forecasts: [],
        highRiskWarnings: [],
        heatmapData: [],
        airlineInsights: [],
        recordingHistory: history
      }
    }

    // Calculate daily summary
    const today = new Date().toISOString().split('T')[0]
    const todayRecords = history.filter(r => r.date === today)
    
    const uniqueAirlines = [...new Set(history.map(r => r.airline).filter(a => a && a !== 'Unknown Airline'))]
    
    // Count high-risk alerts (negative signals)
    const highRiskAlerts = history.filter(r => {
      const signal = (r.signal || '').toLowerCase()
      return signal.includes('negative') || signal.includes('critical')
    }).length

    const dailySummary = {
      totalSignals: history.length,
      newInsights: todayRecords.length,
      activeAirlines: uniqueAirlines.length,
      highRiskAlerts: highRiskAlerts,
      avgConfidence: 0.85
    }

    // Calculate airline signals
    const airlineSignals = uniqueAirlines.map(airline => {
      const airlineRecords = history.filter(r => r.airline === airline)
      const positiveCount = airlineRecords.filter(r => 
        (r.signal || '').toLowerCase().includes('positive')
      ).length
      const negativeCount = airlineRecords.filter(r => 
        (r.signal || '').toLowerCase().includes('negative')
      ).length
      
      let trend = 'stable'
      if (positiveCount > negativeCount * 1.5) trend = 'up'
      else if (negativeCount > positiveCount * 1.5) trend = 'down'
      
      const sentiment = positiveCount > negativeCount ? 'Positive' : 
                       negativeCount > positiveCount ? 'Negative' : 'Neutral'
      
      const themes = [...new Set(airlineRecords.map(r => r.theme).filter(t => t))]
      
      return {
        airline,
        signals: airlineRecords.length,
        trend,
        sentiment,
        themes: themes.slice(0, 3)
      }
    }).sort((a, b) => b.signals - a.signals)

    // Calculate trend shifts (month over month)
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const thisMonthRecords = history.filter(r => {
      if (!r.date) return false
      const recordDate = new Date(r.date)
      return recordDate >= thisMonthStart
    })
    
    const lastMonthRecords = history.filter(r => {
      if (!r.date) return false
      const recordDate = new Date(r.date)
      return recordDate >= lastMonth && recordDate < thisMonthStart
    })

    const calculateThemeTrend = (themeName) => {
      const thisMonthCount = thisMonthRecords.filter(r => 
        (r.theme || '').toLowerCase().includes(themeName.toLowerCase())
      ).length
      const lastMonthCount = lastMonthRecords.filter(r => 
        (r.theme || '').toLowerCase().includes(themeName.toLowerCase())
      ).length
      
      const change = lastMonthCount > 0 
        ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
        : thisMonthCount > 0 ? 100 : 0
      
      return {
        theme: themeName,
        change: change > 0 ? `+${change}%` : `${change}%`,
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        severity: Math.abs(change) > 20 ? 'high' : Math.abs(change) > 10 ? 'medium' : 'low'
      }
    }

    const trendShifts = BACKEND_THEMES.map(theme => calculateThemeTrend(theme))
      .filter(t => t.change !== '0%')
      .sort((a, b) => {
        const aChange = parseInt(a.change)
        const bChange = parseInt(b.change)
        return Math.abs(bChange) - Math.abs(aChange)
      })
      .slice(0, 5)

    // Generate forecasts from recent trends
    const forecasts = []
    const hiringTrend = trendShifts.find(t => t.theme.toLowerCase().includes('hiring'))
    const fleetTrend = trendShifts.find(t => t.theme.toLowerCase().includes('fleet'))
    const trainingTrend = trendShifts.find(t => t.theme.toLowerCase().includes('training'))
    
    if (hiringTrend && parseInt(hiringTrend.change) > 10) {
      forecasts.push({
        prediction: 'Hiring surge expected based on current trends',
        probability: Math.min(85, 50 + parseInt(hiringTrend.change)),
        timeframe: 'Next 60 days',
        category: 'Hiring'
      })
    }
    if (fleetTrend && parseInt(fleetTrend.change) > 10) {
      forecasts.push({
        prediction: 'Fleet expansion activity increasing',
        probability: Math.min(75, 50 + parseInt(fleetTrend.change)),
        timeframe: 'Next 90 days',
        category: 'Fleet'
      })
    }
    if (trainingTrend && parseInt(trainingTrend.change) > 10) {
      forecasts.push({
        prediction: 'Training demand expected to rise',
        probability: Math.min(70, 50 + parseInt(trainingTrend.change)),
        timeframe: 'Next 45 days',
        category: 'Training'
      })
    }

    // Generate high-risk warnings from negative signals
    const highRiskWarnings = []
    const negativeRecords = history.filter(r => {
      const signal = (r.signal || '').toLowerCase()
      return signal.includes('negative') || signal.includes('critical')
    }).slice(0, 5)

    negativeRecords.forEach((record, index) => {
      const recordDate = new Date(record.date + 'T' + record.time)
      const hoursAgo = Math.floor((Date.now() - recordDate.getTime()) / (1000 * 60 * 60))
      const timeAgo = hoursAgo < 1 ? 'Less than an hour ago' :
                     hoursAgo < 24 ? `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago` :
                     `${Math.floor(hoursAgo / 24)} day${Math.floor(hoursAgo / 24) > 1 ? 's' : ''} ago`
      
      const signal = (record.signal || '').toLowerCase()
      const level = signal.includes('critical') || signal.includes('strong negative') ? 'Critical' :
                   signal.includes('high negative') ? 'High' : 'Medium'
      
      highRiskWarnings.push({
        title: `${record.airline} - ${record.theme} Alert`,
        level,
        description: record.summary || 'Negative signal detected',
        timestamp: timeAgo
      })
    })

    // Calculate heatmap data
    const heatmapData = uniqueAirlines.map(airline => {
      const airlineRecords = history.filter(r => r.airline === airline)
      
      const calculateThemeScore = (themeKeyword) => {
        const matching = airlineRecords.filter(r => {
          const theme = (r.theme || '').toLowerCase()
          return theme.includes(themeKeyword.toLowerCase())
        }).length
        return airlineRecords.length > 0 
          ? Math.round((matching / airlineRecords.length) * 100)
          : 0
      }
      
      return {
        airline,
        hiring: calculateThemeScore('hiring'),
        training: calculateThemeScore('training'),
        fleet: calculateThemeScore('fleet'),
        finance: calculateThemeScore('financial'),
        operations: calculateThemeScore('operational')
      }
    })

    // Calculate airline insights
    const airlineInsights = uniqueAirlines.map(airline => {
      const airlineRecords = history.filter(r => r.airline === airline)
      const hiringRecords = airlineRecords.filter(r => 
        (r.theme || '').toLowerCase().includes('hiring')
      )
      
      return {
        airline,
        totalInsights: airlineRecords.length,
        hiringStatus: hiringRecords.length > 0 ? 'Active' : 'Inactive',
        activePositions: hiringRecords.length
      }
    }).sort((a, b) => b.totalInsights - a.totalInsights)

    return {
      dailySummary,
      airlineSignals,
      trendShifts,
      forecasts,
      highRiskWarnings,
      heatmapData,
      airlineInsights,
      recordingHistory: history
    }
  }

  useEffect(() => {
    const loadData = () => {
      // Get user from local storage
      const userStr = localStorage.getItem('user')
      let currentEmail = ''
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          currentEmail = user.email
          setUserEmail(user.email)
          setUserName(user.name || 'User')
        } catch (e) {
          console.error('Error parsing user data', e)
        }
      }

      // Load local history
      const localHistory = JSON.parse(localStorage.getItem('recording_history') || '[]')
      const userSpecificHistory = localHistory.filter(record => record.userId === currentEmail)

      // Calculate all data from real history
      const calculatedData = calculateDataFromHistory(userSpecificHistory)
      setData(calculatedData)
      
      // Update filter options
      const options = calculateFilterOptions(userSpecificHistory)
      setFilterOptions(options)
      
      setLoading(false)
    }

    loadData()

    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    window.addEventListener('storage', loadData)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', loadData)
    }
  }, [])

  const getHeatmapColor = (value) => {
    if (value >= 75) return '#4ade80'
    if (value >= 50) return '#fbbf24'
    return '#f87171'
  }

  const getRiskLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return '#ef4444'
      case 'high': return '#f97316'
      case 'medium': return '#fbbf24'
      default: return '#94a3b8'
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading Intelligence Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data || !data.recordingHistory || data.recordingHistory.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Insights Dashboard</h1>
          <p className={styles.subtitle}>
            Real-time market intelligence for aviation leadership
          </p>
        </div>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          color: 'rgba(255,255,255,0.6)',
          background: 'rgba(20, 30, 45, 0.5)',
          borderRadius: '16px',
          marginTop: '30px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
          <h2 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '10px' }}>No Insights Yet</h2>
          <p style={{ marginBottom: '20px' }}>Start recording voice insights to see your intelligence dashboard here.</p>
          <button 
            onClick={() => window.location.href = '/voice-capture'}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #4ade80, #22c55e)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Record Voice Insight →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Insights Dashboard</h1>
          <p className={styles.subtitle}>
            Real-time market intelligence for aviation leadership
          </p>
        </div>

      </div>

      {/* Search and Filters */}
      <div className={styles.searchFilterContainer}>
        {/* Search Bar */}
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Filters */}
        <div className={styles.filtersGroup}>
          <select
            className={styles.filterDropdown}
            value={filters.airline}
            onChange={(e) => handleFilterChange('airline', e.target.value)}
          >
            <option value="">All Airlines</option>
            {filterOptions.airlines.length > 0 ? (
              filterOptions.airlines.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))
            ) : (
              <option disabled>No airlines found</option>
            )}
          </select>

          <select
            className={styles.filterDropdown}
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
          >
            <option value="">All Countries</option>
            {filterOptions.countries.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <select
            className={styles.filterDropdown}
            value={filters.theme}
            onChange={(e) => handleFilterChange('theme', e.target.value)}
          >
            <option value="">All Themes</option>
            {filterOptions.themes.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <input
            type="date"
            className={styles.filterDropdown}
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles.summaryGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>📡</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{data?.dailySummary?.totalSignals || 0}</span>
            <span className={styles.statLabel}>Total Signals</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>💡</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{data?.dailySummary?.newInsights || 0}</span>
            <span className={styles.statLabel}>New Insights (Today)</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>✈️</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{data?.dailySummary?.activeAirlines || 0}</span>
            <span className={styles.statLabel}>Active Airlines</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>⚠️</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue} style={{ color: '#f87171' }}>
              {data?.dailySummary?.highRiskAlerts || 0}
            </span>
            <span className={styles.statLabel}>High-Risk Alerts</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {data?.dailySummary?.avgConfidence ? (data.dailySummary.avgConfidence * 100).toFixed(0) : 85}%
            </span>
            <span className={styles.statLabel}>Avg Confidence</span>
          </div>
        </Card>
      </div>

      {/* Recording History */}
      <Card className={styles.historyCard}>
        <h2 className={styles.cardTitle}>
          <span>📜</span> Recording History
          {userEmail && <span style={{ fontSize: '1rem', fontWeight: '400', color: 'rgba(255,255,255,0.5)', marginLeft: '12px' }}>({userEmail})</span>}
        </h2>
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Date</th>
              <th>Airline</th>
              <th>Country</th>
              <th>Theme</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((record, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(record)}
                  className={styles.clickableRow}
                >
                  <td>{record.time}</td>
                  <td>{record.date}</td>
                  <td>{record.airline}</td>
                  <td>{record.country}</td>
                  <td><span className={styles.themeBadge}>{record.theme}</span></td>
                  <td>{record.summary}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>
                  No records found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Airline Insights */}
      {data?.airlineInsights && data.airlineInsights.length > 0 && (
        <Card className={styles.airlineInsightsCard}>
          <h2 className={styles.cardTitle}>
            <span>✈️</span> Airline Insights
          </h2>
          <div className={styles.airlineGrid}>
            {data.airlineInsights.map((airline, index) => (
              <div
                key={index}
                className={styles.airlineBox}
                onClick={() => setSelectedAirline(airline.airline)}
              >
                <h3 className={styles.airlineBoxTitle}>{airline.airline}</h3>
                <div className={styles.airlineBoxStats}>
                  <div className={styles.airlineBoxRow}>
                    <span>Total Insights:</span>
                    <strong>{airline.totalInsights}</strong>
                  </div>
                  <div className={styles.airlineBoxRow}>
                    <span>Hiring Status:</span>
                    <strong>{airline.hiringStatus}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Airline Details Modal */}
      {selectedAirline && (
        <div className={styles.modalOverlay} onClick={() => setSelectedAirline(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedAirline} Insights</h2>
              <button className={styles.closeButton} onClick={() => setSelectedAirline(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.insightsList}>
                {data.recordingHistory.filter(r => r.airline === selectedAirline).length > 0 ? (
                  data.recordingHistory
                    .filter(r => r.airline === selectedAirline)
                    .map((record, index) => (
                      <div key={index} className={styles.insightItem} onClick={() => {
                        setSelectedAirline(null);
                        handleRowClick(record);
                      }}>
                        <div className={styles.insightHeader}>
                          <span className={styles.insightDate}>{record.date} • {record.time}</span>
                          <span className={styles.themeBadge}>{record.theme}</span>
                        </div>
                        <p className={styles.insightSummary}>{record.summary}</p>
                      </div>
                    ))
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>No insights recorded for this airline yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Insight Details</h2>
              <button className={styles.closeButton} onClick={handleCloseModal}>×</button>
            </div>

            <div className={styles.modalTabs}>
              <button
                className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'transcript' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('transcript')}
              >
                Transcript
              </button>
            </div>

            <div className={styles.modalBody}>
              {activeTab === 'overview' ? (
                <div className={styles.overviewGrid}>
                  <div className={styles.detailItem}>
                    <label>Time & Date</label>
                    <p>{selectedRecord.time}, {selectedRecord.date}</p>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Logged-in User</label>
                    <p>{userName || 'N/A'}</p>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Country</label>
                    <p>{selectedRecord.country}</p>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Airline</label>
                    <p>{selectedRecord.airline}</p>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Theme</label>
                    <span className={styles.themeBadge}>{selectedRecord.theme}</span>
                  </div>

                </div>
              ) : (
                <div className={styles.transcriptView}>
                  <div className={styles.aiSummaryBox}>
                    <h3>AI Summary</h3>
                    <p>{selectedRecord.summary}</p>
                  </div>
                  <div className={styles.transcriptBox}>
                    <h3>Full Transcript</h3>
                    <p>"{selectedRecord.transcript}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>

        {/* Emerging Themes */}


        {/* High-Risk Warnings */}
        {data?.highRiskWarnings && data.highRiskWarnings.length > 0 ? (
          <Card className={styles.warningsCard}>
            <h2 className={styles.cardTitle}>
              <span>🚨</span> High-Risk Warnings
            </h2>
            <div className={styles.warningsList}>
              {data.highRiskWarnings.map((warning, index) => (
                <div key={index} className={styles.warningItem}>
                  <div className={styles.warningHeader}>
                    <span
                      className={styles.warningLevel}
                      style={{
                        background: `${getRiskLevelColor(warning.level)}20`,
                        color: getRiskLevelColor(warning.level),
                        borderColor: getRiskLevelColor(warning.level)
                      }}
                    >
                      {warning.level}
                    </span>
                    <span className={styles.warningTime}>{warning.timestamp}</span>
                  </div>
                  <h4 className={styles.warningTitle}>{warning.title}</h4>
                  <p className={styles.warningDesc}>{warning.description}</p>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        {/* Airline-wise Signals */}
        {data?.airlineSignals && data.airlineSignals.length > 0 ? (
          <Card className={styles.airlinesCard}>
            <h2 className={styles.cardTitle}>
              <span>✈️</span> Airline-wise Signals
            </h2>
            <div className={styles.airlinesList}>
              {data.airlineSignals.map((airline, index) => {
                const maxSignals = Math.max(...data.airlineSignals.map(a => a.signals), 1)
                const percentage = (airline.signals / maxSignals) * 100
                
                return (
                  <div key={index} className={styles.airlineRow}>
                    <div className={styles.airlineInfo}>
                      <span className={styles.airlineName}>{airline.airline}</span>
                    </div>
                    <div className={styles.airlineSignalBar}>
                      <div
                        className={styles.airlineSignalFill}
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          background: airline.trend === 'up' ? '#4ade80' :
                            airline.trend === 'down' ? '#f87171' : '#fbbf24'
                        }}
                      />
                    </div>
                    <span className={styles.airlineSignalCount}>{airline.signals}</span>
                    <span className={styles.airlineTrend}>
                      {airline.trend === 'up' ? '↑' : airline.trend === 'down' ? '↓' : '→'}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        ) : null}

        {/* Trend Shifts */}
        {data?.trendShifts && data.trendShifts.length > 0 ? (
          <Card className={styles.trendsCard}>
            <h2 className={styles.cardTitle}>
              <span>📈</span> Trend Shifts
            </h2>
            <div className={styles.trendsList}>
              {data.trendShifts.map((trend, index) => (
                <div key={index} className={styles.trendItem}>
                  <span className={styles.trendTheme}>{trend.theme}</span>
                  <span
                    className={styles.trendChange}
                    style={{ color: trend.direction === 'up' ? '#4ade80' : '#f87171' }}
                  >
                    {trend.change}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        {/* Forecast Models */}
        {data?.forecasts && data.forecasts.length > 0 ? (
          <Card className={styles.forecastsCard}>
            <h2 className={styles.cardTitle}>
              <span>🔮</span> Forecast Models
            </h2>
            <div className={styles.forecastsList}>
              {data.forecasts.map((forecast, index) => (
                <div key={index} className={styles.forecastItem}>
                  <div className={styles.forecastHeader}>
                    <span className={styles.forecastCategory}>{forecast.category}</span>
                    <span className={styles.forecastTimeframe}>{forecast.timeframe}</span>
                  </div>
                  <p className={styles.forecastPrediction}>{forecast.prediction}</p>
                  <div className={styles.forecastProbability}>
                    <div className={styles.probBar}>
                      <div
                        className={styles.probFill}
                        style={{
                          width: `${forecast.probability}%`,
                          background: forecast.probability > 70 ? '#4ade80' :
                            forecast.probability > 50 ? '#fbbf24' : '#f87171'
                        }}
                      />
                    </div>
                    <span className={styles.probValue}>{forecast.probability}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>

      {/* Market Heatmap */}
      {data?.heatmapData && data.heatmapData.length > 0 ? (
        <Card className={styles.heatmapCard}>
          <h2 className={styles.cardTitle}>
            <span>🗺️</span> Market Intelligence Heatmap
          </h2>
          <div className={styles.heatmapContainer}>
            <div className={styles.heatmapHeader}>
              <div className={styles.heatmapCorner}></div>
              {['Hiring', 'Training', 'Fleet', 'Finance', 'Operations'].map(header => (
                <div key={header} className={styles.heatmapHeaderCell}>{header}</div>
              ))}
            </div>
            <div className={styles.heatmapBody}>
              {data.heatmapData.map((row, index) => (
                <div key={index} className={styles.heatmapRow}>
                  <div className={styles.heatmapRowLabel}>{row.airline}</div>
                  {['hiring', 'training', 'fleet', 'finance', 'operations'].map(key => (
                    <div
                      key={key}
                      className={styles.heatmapCell}
                      style={{
                        backgroundColor: getHeatmapColor(row[key]),
                        opacity: 0.3 + (row[key] / 100) * 0.7
                      }}
                      title={`${row.airline} - ${key}: ${row[key]}%`}
                    >
                      {row[key]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className={styles.heatmapLegend}>
              <span>Low</span>
              <div className={styles.legendGradient}></div>
              <span>High</span>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
