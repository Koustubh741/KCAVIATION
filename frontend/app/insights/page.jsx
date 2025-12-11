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

  weeklyTrends: [
    { day: 'Mon', signals: 8 },
    { day: 'Tue', signals: 12 },
    { day: 'Wed', signals: 15 },
    { day: 'Thu', signals: 9 },
    { day: 'Fri', signals: 18 },
    { day: 'Sat', signals: 6 },
    { day: 'Sun', signals: 4 }
  ],

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
  ]
}

export default function InsightsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('daily')

  useEffect(() => {
    // Simulated data loading
    setTimeout(() => {
      setData(mockData)
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
        <div className={styles.periodToggle}>
          {['daily', 'weekly', 'monthly'].map(period => (
            <button
              key={period}
              className={`${styles.periodBtn} ${selectedPeriod === period ? styles.active : ''}`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
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

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>
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
                  <span
                    className={styles.airlineSentiment}
                    style={{
                      color: airline.sentiment === 'Positive' ? '#4ade80' :
                        airline.sentiment === 'Negative' ? '#f87171' : '#94a3b8'
                    }}
                  >
                    {airline.sentiment}
                  </span>
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

      {/* Weekly Trend Chart */}
      <Card className={styles.chartCard}>
        <h2 className={styles.cardTitle}>
          <span>📊</span> Weekly Intelligence Summary
        </h2>
        <div className={styles.chartContainer}>
          <div className={styles.chartBars}>
            {data.weeklyTrends.map((day, index) => (
              <div key={index} className={styles.chartBarGroup}>
                <div
                  className={styles.chartBar}
                  style={{ height: `${(day.signals / 20) * 100}%` }}
                />
                <span className={styles.chartLabel}>{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
