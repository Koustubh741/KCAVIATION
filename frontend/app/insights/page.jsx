'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import Card from '../../components/Card'

// Mock data for the dashboard
const mockData = {
  dailySummary: {
    totalSignals: 47,
    newInsights: 12,
    activeAirlines: 8,
    highRiskAlerts: 3,
    avgConfidence: 0.82
  },

  airlineSignals: [
    { airline: 'Indigo', signals: 15, trend: 'up', sentiment: 'Positive', themes: ['Hiring', 'Expansion'] },
    { airline: 'Air India', signals: 12, trend: 'up', sentiment: 'Positive', themes: ['Fleet', 'Training'] },
    { airline: 'SpiceJet', signals: 8, trend: 'down', sentiment: 'Negative', themes: ['Finance', 'Operations'] },
    { airline: 'Vistara', signals: 7, trend: 'stable', sentiment: 'Neutral', themes: ['Regulatory'] },
    { airline: 'GoAir', signals: 5, trend: 'down', sentiment: 'Negative', themes: ['Operations'] }
  ],

  trendShifts: [
    { theme: 'Pilot Training Demand', change: '+23%', direction: 'up', severity: 'high' },
    { theme: 'Fleet Expansion', change: '+15%', direction: 'up', severity: 'medium' },
    { theme: 'Hiring Activity', change: '+12%', direction: 'up', severity: 'medium' },
    { theme: 'Regulatory Concerns', change: '-8%', direction: 'down', severity: 'low' },
    { theme: 'Pricing Signals', change: '+5%', direction: 'up', severity: 'low' }
  ],

  forecasts: [
    { prediction: 'Major hiring surge expected in Q1 2025', probability: 85, timeframe: 'Next 60 days', category: 'Hiring' },
    { prediction: 'Aircraft delivery delays for regional carriers', probability: 72, timeframe: 'Next 90 days', category: 'Fleet' },
    { prediction: 'Simulator capacity constraints', probability: 68, timeframe: 'Next 45 days', category: 'Training' },
    { prediction: 'New regulatory framework implementation', probability: 55, timeframe: 'Next 120 days', category: 'Regulatory' }
  ],

  highRiskWarnings: [
    { title: 'SpiceJet Financial Distress', level: 'Critical', description: 'Multiple signals indicate severe financial constraints affecting operations', timestamp: '2 hours ago' },
    { title: 'Pilot Shortage Crisis', level: 'High', description: 'Industry-wide shortage expected to intensify in coming months', timestamp: '5 hours ago' },
    { title: 'Regulatory Compliance Gap', level: 'Medium', description: 'Several carriers showing recency lapse issues', timestamp: '1 day ago' }
  ],

  heatmapData: [
    { airline: 'Indigo', hiring: 85, training: 70, fleet: 90, finance: 75, operations: 80 },
    { airline: 'Air India', hiring: 75, training: 85, fleet: 80, finance: 70, operations: 65 },
    { airline: 'SpiceJet', hiring: 40, training: 45, fleet: 35, finance: 25, operations: 50 },
    { airline: 'Vistara', hiring: 65, training: 70, fleet: 60, finance: 80, operations: 75 },
    { airline: 'GoAir', hiring: 50, training: 55, fleet: 45, finance: 40, operations: 55 }
  ],

  recordingHistory: [
    {
      time: '10:30 AM',
      date: '2023-12-18',
      airline: 'Indigo',
      country: 'India',
      theme: 'Hiring',
      signal: 'Strong Positive',
      summary: 'Discussion about new pilot recruitment drive and training centers.',
      transcript: 'We are seeing a significant need for more pilots. The recruitment drive is starting next week with a focus on experienced captains. New training centers are being set up in Bangalore and Delhi to handle the influx.'
    },
    {
      time: '02:15 PM',
      date: '2023-12-17',
      airline: 'Air India',
      country: 'India',
      theme: 'Fleet',
      signal: 'Moderate Positive',
      summary: 'Analysis of recent Boeing order announcements and delivery timelines.',
      transcript: 'The recent order from Boeing is confirmed. Delivery timelines are expected to be slightly delayed, but the fleet expansion plan remains on track. We need to prepare for the induction of the wide-body aircraft.'
    },
    {
      time: '09:00 AM',
      date: '2023-12-16',
      airline: 'SpiceJet',
      country: 'India',
      theme: 'Finance',
      signal: 'High Negative',
      summary: 'Review of quarterly financial results and operational costs.',
      transcript: 'Quarterly results are showing increased operational costs due to fuel prices. Cash flow is tight, and we strictly need to monitor expenditure in the coming months. Some routes might need to be rationalized.'
    },
    {
      time: '04:45 PM',
      date: '2023-12-15',
      airline: 'Vistara',
      country: 'India',
      theme: 'Regulatory',
      signal: 'Neutral',
      summary: 'Impact of new DGCA regulations on flight duty time limitations.',
      transcript: 'The new DGCA regulations on FDTL will impact our rostering. We need to ensure compliance without disrupting the schedule. A meeting with the crew scheduling team is required.'
    },
    {
      time: '11:20 AM',
      date: '2023-12-14',
      airline: 'Indigo',
      country: 'India',
      theme: 'Operations',
      signal: 'Strong Positive',
      summary: 'Operational efficiency improvements in ground handling.',
      transcript: 'Ground handling times have improved by 15% this month. The new automated baggage system is working well. We should look into replicating this model at other major hubs.'
    },
    {
      time: '08:00 AM',
      date: '2023-12-13',
      airline: 'Emirates',
      country: 'UAE',
      theme: 'Fleet',
      signal: 'Strong Positive',
      summary: 'Expansion of premium economy cabins across the fleet.',
      transcript: 'Customer feedback on the Premium Economy cabin has been excellent. We are proceeding with the retrofit of the A380 fleet. Marketing needs to push this new offering aggressively.'
    },
    {
      time: '03:30 PM',
      date: '2023-12-12',
      airline: 'Lufthansa',
      country: 'Germany',
      theme: 'Hiring',
      signal: 'Moderate Positive',
      summary: 'Recruitment strategies for cabin crew in European markets.',
      transcript: 'Competition for cabin crew in Europe is intensifying. We need to revise our compensation packages and look into recruiting from new markets to meet the summer schedule demands.'
    }
  ],

  airlineInsights: [
    { airline: 'Indigo', totalInsights: 145, hiringStatus: 'Active', activePositions: 24 },
    { airline: 'Air India', totalInsights: 98, hiringStatus: 'Hiring', activePositions: 18 },
    { airline: 'SpiceJet', totalInsights: 45, hiringStatus: 'Frozen', activePositions: 0 },
    { airline: 'Vistara', totalInsights: 76, hiringStatus: 'Active', activePositions: 12 },
    { airline: 'Emirates', totalInsights: 112, hiringStatus: 'Hiring', activePositions: 35 },
    { airline: 'Lufthansa', totalInsights: 88, hiringStatus: 'Reviewing', activePositions: 5 }
  ]
}

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

  // Derived filter options
  const filterOptions = {
    airlines: ['Indigo', 'Air India', 'SpiceJet', 'Vistara', 'GoAir', 'Emirates', 'Lufthansa'],
    countries: ['India', 'UAE', 'Germany', 'USA', 'UK'],
    themes: ['Hiring', 'Fleet', 'Finance', 'Regulatory', 'Operations', 'Training']
  }

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
  const filteredHistory = data?.recordingHistory.filter(item => {
    // Search Query (matches airline, theme, summary)
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      item.airline.toLowerCase().includes(searchLower) ||
      item.theme.toLowerCase().includes(searchLower) ||
      item.summary.toLowerCase().includes(searchLower)

    // Filters
    const matchesAirline = filters.airline ? item.airline === filters.airline : true
    const matchesCountry = filters.country ? item.country === filters.country : true
    const matchesTheme = filters.theme ? item.theme === filters.theme : true
    const matchesDate = filters.date ? item.date === filters.date : true

    return matchesSearch && matchesAirline && matchesCountry && matchesTheme && matchesDate
  })

  useEffect(() => {
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

    // Simulated data loading
    setTimeout(() => {
      // Load local history
      const localHistory = JSON.parse(localStorage.getItem('recording_history') || '[]')
      const userSpecificHistory = localHistory.filter(record => record.userId === currentEmail)

      const fullData = {
        ...mockData,
        recordingHistory: userSpecificHistory
      }

      setData(fullData)
      setLoading(false)
    }, 1000)
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
            {filterOptions.airlines.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
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
            <span className={styles.statValue}>{data.dailySummary.totalSignals}</span>
            <span className={styles.statLabel}>Total Signals</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>💡</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{data.dailySummary.newInsights}</span>
            <span className={styles.statLabel}>New Insights</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>✈️</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{data.dailySummary.activeAirlines}</span>
            <span className={styles.statLabel}>Active Airlines</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>⚠️</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue} style={{ color: '#f87171' }}>
              {data.dailySummary.highRiskAlerts}
            </span>
            <span className={styles.statLabel}>High-Risk Alerts</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {(data.dailySummary.avgConfidence * 100).toFixed(0)}%
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
      <Card className={styles.airlineInsightsCard}>
        <h2 className={styles.cardTitle}>
          <span>✈️</span> Airline Insights
        </h2>
        <div className={styles.airlineGrid}>
          {data.airlineInsights.map((airline, index) => {
            // Calculate real-time count from recordingHistory
            const realTimeCount = data.recordingHistory.filter(r => r.airline === airline.airline).length;

            return (
              <div
                key={index}
                className={styles.airlineBox}
                onClick={() => setSelectedAirline(airline.airline)}
              >
                <h3 className={styles.airlineBoxTitle}>{airline.airline}</h3>
                <div className={styles.airlineBoxStats}>
                  <div className={styles.airlineBoxRow}>
                    <span>Total Insights:</span>
                    <strong>{realTimeCount}</strong>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

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

        {/* Airline-wise Signals */}
        <Card className={styles.airlinesCard}>
          <h2 className={styles.cardTitle}>
            <span>✈️</span> Airline-wise Signals
          </h2>
          <div className={styles.airlinesList}>
            {data.airlineSignals.map((airline, index) => (
              <div key={index} className={styles.airlineRow}>
                <div className={styles.airlineInfo}>
                  <span className={styles.airlineName}>{airline.airline}</span>
                </div>
                <div className={styles.airlineSignalBar}>
                  <div
                    className={styles.airlineSignalFill}
                    style={{
                      width: `${(airline.signals / 20) * 100}%`,
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
            ))}
          </div>
        </Card>

        {/* Trend Shifts */}
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

        {/* Forecast Models */}
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
      </div>

      {/* Market Heatmap */}
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
    </div>
  )
}
