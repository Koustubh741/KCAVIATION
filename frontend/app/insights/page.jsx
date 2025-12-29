'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import Card from '../../components/Card'
import { DEFAULT_UNKNOWN_AIRLINE } from '../constants'

export default function InsightsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')

  // Modal State
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [selectedAirline, setSelectedAirline] = useState(null)

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
      'sorry, but',
      'i\'m sorry, but',
      'the provided text',
      'does not contain any',
      'there are no airline',
      'there are no specific',
      'no airline names',
      'no specific airline'
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
    
    // Filter out names that start with common error prefixes
    if (nameLower.startsWith('i\'m sorry') || 
        nameLower.startsWith('sorry,') ||
        nameLower.startsWith('there are no') ||
        nameLower.startsWith('the provided')) {
      return false
    }
    
    return true
  }
  const [activeTab, setActiveTab] = useState('overview')
  
  // Expanded summaries state
  const [expandedSummaries, setExpandedSummaries] = useState({})
  
  // Theme summaries state
  const [themeSummaries, setThemeSummaries] = useState({})
  const [loadingThemes, setLoadingThemes] = useState(false)


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
    // Extract individual airlines (handle both array and comma-separated string formats)
    const allAirlinesFromHistory = []
    history.forEach(r => {
      if (r.airlines && Array.isArray(r.airlines)) {
        // New format: airlines is an array - filter invalid names
        const validAirlines = r.airlines.filter(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
        allAirlinesFromHistory.push(...validAirlines)
      } else if (r.airline) {
        // Old format: airline is a string (may be comma-separated)
        const airlines = r.airline.split(',').map(a => a.trim()).filter(a => a && isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
        allAirlinesFromHistory.push(...airlines)
      }
    })
    const uniqueAirlines = [...new Set(allAirlinesFromHistory)].sort()
    
    // Fixed countries list: India, Philippines, Indonesia
    const countries = ['India', 'Philippines', 'Indonesia']
    
    // Extract all themes from history (handle both string and array formats)
    const allThemesFromHistory = []
    history.forEach(r => {
      if (r.themes && Array.isArray(r.themes)) {
        // New format: themes is an array
        allThemesFromHistory.push(...r.themes)
      } else if (r.theme) {
        // Old format: theme is a string (may be comma-separated)
        const themes = r.theme.split(',').map(t => t.trim()).filter(t => t)
        allThemesFromHistory.push(...themes)
      }
    })
    const uniqueThemesFromHistory = [...new Set(allThemesFromHistory)].sort()
    
    // Always merge with BACKEND_THEMES to ensure all backend themes are available
    const allThemes = [...new Set([...BACKEND_THEMES, ...uniqueThemesFromHistory])].sort()
    
    return {
      airlines: uniqueAirlines.length > 0 ? uniqueAirlines : [],
      countries: countries,
      themes: allThemes
    }
  }

  const [filterOptions, setFilterOptions] = useState({
    airlines: [],
    countries: ['India', 'Philippines', 'Indonesia'],
    themes: BACKEND_THEMES
  })

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleRowClick = (record) => {
    setSelectedRecord(record)
    setActiveTab('overview')
    setThemeSummaries({}) // Reset theme summaries when opening new record
  }

  const handleCloseModal = () => {
    setSelectedRecord(null)
    setThemeSummaries({}) // Reset theme summaries when closing modal
  }

  const fetchThemeSummaries = async (themes, transcript) => {
    if (!themes || themes.length === 0 || !transcript) {
      setThemeSummaries({})
      return
    }

    setLoadingThemes(true)
    const summaries = {}

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      
      // Fetch summary for each theme
      const themePromises = themes.map(async (theme) => {
        try {
          const formData = new URLSearchParams()
          formData.append('text', transcript)
          formData.append('theme_filter', theme)

          const response = await fetch(`${backendUrl}/api/analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
          })

          if (response.ok) {
            const data = await response.json()
            return {
              theme,
              summary: data.summary || 'No summary available for this theme'
            }
          } else {
            return {
              theme,
              summary: 'Failed to generate summary for this theme'
            }
          }
        } catch (error) {
          console.error(`Error fetching summary for theme ${theme}:`, error)
          return {
            theme,
            summary: 'Error generating summary'
          }
        }
      })

      const results = await Promise.all(themePromises)
      results.forEach(({ theme, summary }) => {
        summaries[theme] = summary
      })

      setThemeSummaries(summaries)
    } catch (error) {
      console.error('Error fetching theme summaries:', error)
    } finally {
      setLoadingThemes(false)
    }
  }
  
  // Helper functions for summary expansion
  const toggleSummary = (index) => {
    setExpandedSummaries(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }
  
  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
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
    // Check airline match - support both array and string formats
    const itemAirlines = item.airlines || (item.airline ? item.airline.split(',').map(a => a.trim()) : [])
    const matchesAirline = !filters.airline || 
      item.airline === filters.airline || 
      (itemAirlines && itemAirlines.includes(filters.airline))
    
    const matchesCountry = !filters.country || item.country === filters.country
    
    // Check theme match - support both array and string formats
    const itemThemes = item.themes || (item.theme ? item.theme.split(',').map(t => t.trim()) : [])
    const matchesTheme = !filters.theme || 
      item.theme === filters.theme || 
      (itemThemes && itemThemes.includes(filters.theme)) ||
      (item.theme && item.theme.includes(filters.theme))
    
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
    
    // Extract individual airlines (handle both array and comma-separated string formats)
    // Filter out invalid airline names and DEFAULT_UNKNOWN_AIRLINE from unique list
    const allAirlinesFromHistory = []
    history.forEach(r => {
      if (r.airlines && Array.isArray(r.airlines)) {
        // New format: airlines is an array - filter invalid names
        const validAirlines = r.airlines.filter(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
        allAirlinesFromHistory.push(...validAirlines)
      } else if (r.airline) {
        // Old format: airline is a string (may be comma-separated) - filter invalid names
        const airlines = r.airline.split(',').map(a => a.trim()).filter(a => a && isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
        allAirlinesFromHistory.push(...airlines)
      }
    })
    // Only include valid airline names (exclude DEFAULT_UNKNOWN_AIRLINE from unique list)
    const uniqueAirlines = [...new Set(allAirlinesFromHistory)].sort()
    
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
    // First, find records with no valid airlines and group them under DEFAULT_UNKNOWN_AIRLINE
    const recordsWithNoValidAirlines = history.filter(r => {
      let hasValidAirline = false
      if (r.airlines && Array.isArray(r.airlines)) {
        hasValidAirline = r.airlines.some(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
      } else if (r.airline) {
        const airlines = r.airline.split(',').map(a => a.trim()).filter(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
        hasValidAirline = airlines.length > 0
      }
      return !hasValidAirline
    })
    
    // Add DEFAULT_UNKNOWN_AIRLINE to uniqueAirlines if there are records with no valid airlines
    const airlinesForSignals = recordsWithNoValidAirlines.length > 0 
      ? [...uniqueAirlines, DEFAULT_UNKNOWN_AIRLINE]
      : uniqueAirlines
    
    // Filter out any invalid airline names from airlinesForSignals before mapping
    const validAirlinesForSignals = airlinesForSignals.filter(airline => 
      airline === DEFAULT_UNKNOWN_AIRLINE || isValidAirlineName(airline)
    )
    
    const airlineSignals = validAirlinesForSignals.map(airline => {
      // Filter records that contain this specific airline
      const airlineRecords = history.filter(r => {
        if (airline === DEFAULT_UNKNOWN_AIRLINE) {
          // For DEFAULT_UNKNOWN_AIRLINE, match records with no valid airlines
          let hasValidAirline = false
          if (r.airlines && Array.isArray(r.airlines)) {
            hasValidAirline = r.airlines.some(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
          } else if (r.airline) {
            const airlines = r.airline.split(',').map(a => a.trim()).filter(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
            hasValidAirline = airlines.length > 0
          }
          return !hasValidAirline
        } else {
          // For valid airlines, check if record contains this airline
          if (r.airlines && Array.isArray(r.airlines)) {
            // Filter invalid names from array before checking
            const validAirlines = r.airlines.filter(a => isValidAirlineName(a))
            return validAirlines.includes(airline)
          } else if (r.airline) {
            const airlines = r.airline.split(',').map(a => a.trim()).filter(a => isValidAirlineName(a))
            return airlines.includes(airline)
          }
        }
        return false
      })
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
    // Use same airlines list as airlineSignals (includes DEFAULT_UNKNOWN_AIRLINE if needed)
    const airlinesForHeatmap = recordsWithNoValidAirlines.length > 0 
      ? [...uniqueAirlines, DEFAULT_UNKNOWN_AIRLINE]
      : uniqueAirlines
    
    // Filter out any invalid airline names from airlinesForHeatmap before mapping
    const validAirlinesForHeatmap = airlinesForHeatmap.filter(airline => 
      airline === DEFAULT_UNKNOWN_AIRLINE || isValidAirlineName(airline)
    )
    
    const heatmapData = validAirlinesForHeatmap.map(airline => {
      // Filter records that contain this specific airline
      const airlineRecords = history.filter(r => {
        if (airline === DEFAULT_UNKNOWN_AIRLINE) {
          // For DEFAULT_UNKNOWN_AIRLINE, match records with no valid airlines
          let hasValidAirline = false
          if (r.airlines && Array.isArray(r.airlines)) {
            hasValidAirline = r.airlines.some(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
          } else if (r.airline) {
            const airlines = r.airline.split(',').map(a => a.trim()).filter(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
            hasValidAirline = airlines.length > 0
          }
          return !hasValidAirline
        } else {
          // For valid airlines, check if record contains this airline
          if (r.airlines && Array.isArray(r.airlines)) {
            // Filter invalid names from array before checking
            const validAirlines = r.airlines.filter(a => isValidAirlineName(a))
            return validAirlines.includes(airline)
          } else if (r.airline) {
            const airlines = r.airline.split(',').map(a => a.trim()).filter(a => isValidAirlineName(a))
            return airlines.includes(airline)
          }
        }
        return false
      })
      
      // Calculate score for each backend theme (exact match)
      const calculateThemeScore = (themeName) => {
        const matching = airlineRecords.filter(r => {
          // Check both theme formats (array and string)
          if (r.themes && Array.isArray(r.themes)) {
            return r.themes.some(t => t.trim() === themeName)
          } else if (r.theme) {
            // Handle comma-separated themes
            const themes = r.theme.split(',').map(t => t.trim())
            return themes.includes(themeName)
          }
          return false
        }).length
        return airlineRecords.length > 0 
          ? Math.round((matching / airlineRecords.length) * 100)
          : 0
      }
      
      // Create object with all backend themes as keys (using theme name directly)
      const themeScores = {}
      BACKEND_THEMES.forEach(theme => {
        themeScores[theme] = calculateThemeScore(theme)
      })
      
      return {
        airline,
        ...themeScores
      }
    })

    // Calculate airline insights
    // Use same airlines list as airlineSignals (includes DEFAULT_UNKNOWN_AIRLINE if needed)
    const airlinesForInsights = recordsWithNoValidAirlines.length > 0 
      ? [...uniqueAirlines, DEFAULT_UNKNOWN_AIRLINE]
      : uniqueAirlines
    
    // Filter out any invalid airline names from airlinesForInsights before mapping
    const validAirlinesForInsights = airlinesForInsights.filter(airline => 
      airline === DEFAULT_UNKNOWN_AIRLINE || isValidAirlineName(airline)
    )
    
    const airlineInsights = validAirlinesForInsights.map(airline => {
      // Filter records that contain this specific airline
      const airlineRecords = history.filter(r => {
        if (airline === DEFAULT_UNKNOWN_AIRLINE) {
          // For DEFAULT_UNKNOWN_AIRLINE, match records with no valid airlines
          let hasValidAirline = false
          if (r.airlines && Array.isArray(r.airlines)) {
            hasValidAirline = r.airlines.some(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
          } else if (r.airline) {
            const airlines = r.airline.split(',').map(a => a.trim()).filter(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
            hasValidAirline = airlines.length > 0
          }
          return !hasValidAirline
        } else {
          // For valid airlines, check if record contains this airline
          if (r.airlines && Array.isArray(r.airlines)) {
            // Filter invalid names from array before checking
            const validAirlines = r.airlines.filter(a => isValidAirlineName(a))
            return validAirlines.includes(airline)
          } else if (r.airline) {
            const airlines = r.airline.split(',').map(a => a.trim()).filter(a => isValidAirlineName(a))
            return airlines.includes(airline)
          }
        }
        return false
      })
      const hiringRecords = airlineRecords.filter(r => {
        // Check both theme formats
        if (r.themes && Array.isArray(r.themes)) {
          return r.themes.some(t => t.toLowerCase().includes('hiring'))
        } else if (r.theme) {
          return (r.theme || '').toLowerCase().includes('hiring')
        }
        return false
      })
      
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
              filteredHistory.map((record, index) => {
                const isExpanded = expandedSummaries[index]
                const summary = record.summary || 'No summary available'
                const shouldTruncate = summary.length > 150
                const displaySummary = isExpanded || !shouldTruncate ? summary : truncateText(summary)
                
                // Get airlines - support both old format (string) and new format (array)
                let airlines = record.airlines || (record.airline ? record.airline.split(', ').map(a => a.trim()) : [])
                // Filter out invalid airline names
                airlines = airlines.filter(airline => isValidAirlineName(airline))
                // If no valid airlines after filtering, use default
                if (airlines.length === 0) {
                  airlines = [DEFAULT_UNKNOWN_AIRLINE]
                }
                // Get themes - support both old format (string) and new format (array)
                // Handle both comma-space and comma separators
                const themes = record.themes || (record.theme ? record.theme.split(',').map(t => t.trim()).filter(t => t) : [])
                
                return (
                  <tr
                    key={index}
                    onClick={() => handleRowClick(record)}
                    className={styles.clickableRow}
                  >
                    <td>{record.time}</td>
                    <td>{record.date}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {airlines.map((airline, idx) => (
                          <span key={idx} className={styles.airlineBadge}>
                            {airline.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{record.country}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {themes.length > 0 ? (
                          themes.map((theme, idx) => (
                            <span key={idx} className={styles.themeBadge}>
                              {theme.trim()}
                            </span>
                          ))
                        ) : (
                          <span className={styles.themeBadge}>{record.theme || 'General'}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ lineHeight: '1.6' }}>
                        {displaySummary}
                        {shouldTruncate && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleSummary(index)
                            }}
                            className={styles.moreButton}
                          >
                            {isExpanded ? ' -less' : ' +more'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
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
            {data.airlineInsights
              .filter(airline => 
                airline.airline === DEFAULT_UNKNOWN_AIRLINE || isValidAirlineName(airline.airline)
              )
              .map((airline, index) => (
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
                {data.recordingHistory.filter(r => {
                  // Check if record contains this specific airline
                  if (selectedAirline === DEFAULT_UNKNOWN_AIRLINE) {
                    // For DEFAULT_UNKNOWN_AIRLINE, match records with no valid airlines
                    let hasValidAirline = false
                    if (r.airlines && Array.isArray(r.airlines)) {
                      hasValidAirline = r.airlines.some(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
                    } else if (r.airline) {
                      const airlines = r.airline.split(',').map(a => a.trim()).filter(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
                      hasValidAirline = airlines.length > 0
                    }
                    return !hasValidAirline
                  } else {
                    if (r.airlines && Array.isArray(r.airlines)) {
                      return r.airlines.includes(selectedAirline)
                    } else if (r.airline) {
                      const airlines = r.airline.split(',').map(a => a.trim())
                      return airlines.includes(selectedAirline)
                    }
                  }
                  return false
                }).length > 0 ? (
                  data.recordingHistory
                    .filter(r => {
                      // Check if record contains this specific airline
                      if (selectedAirline === DEFAULT_UNKNOWN_AIRLINE) {
                        // For DEFAULT_UNKNOWN_AIRLINE, match records with no valid airlines
                        let hasValidAirline = false
                        if (r.airlines && Array.isArray(r.airlines)) {
                          hasValidAirline = r.airlines.some(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
                        } else if (r.airline) {
                          const airlines = r.airline.split(',').map(a => a.trim()).filter(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE)
                          hasValidAirline = airlines.length > 0
                        }
                        return !hasValidAirline
                      } else {
                        if (r.airlines && Array.isArray(r.airlines)) {
                          return r.airlines.includes(selectedAirline)
                        } else if (r.airline) {
                          const airlines = r.airline.split(',').map(a => a.trim())
                          return airlines.includes(selectedAirline)
                        }
                      }
                      return false
                    })
                    .map((record, index) => {
                      // Get themes - support both old format (string) and new format (array)
                      // Handle both comma-space and comma separators
                      const themes = record.themes || (record.theme ? record.theme.split(',').map(t => t.trim()).filter(t => t) : [])
                      
                      return (
                      <div key={index} className={styles.insightItem} onClick={() => {
                        setSelectedAirline(null);
                        handleRowClick(record);
                      }}>
                        <div className={styles.insightHeader}>
                          <span className={styles.insightDate}>{record.date} • {record.time}</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {themes.length > 0 ? (
                              themes.map((theme, idx) => (
                                <span key={idx} className={styles.themeBadge}>
                                  {theme.trim()}
                                </span>
                              ))
                            ) : (
                              <span className={styles.themeBadge}>{record.theme || 'General'}</span>
                            )}
                          </div>
                        </div>
                        <p className={styles.insightSummary}>{record.summary}</p>
                      </div>
                    )})
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
              <button
                className={`${styles.tabBtn} ${activeTab === 'themes' ? styles.activeTab : ''}`}
                onClick={() => {
                  setActiveTab('themes')
                  // Fetch theme summaries when themes tab is clicked
                  const themes = selectedRecord.themes || (selectedRecord.theme ? selectedRecord.theme.split(',').map(t => t.trim()) : [])
                  if (themes.length > 0 && selectedRecord.transcript) {
                    fetchThemeSummaries(themes, selectedRecord.transcript)
                  }
                }}
              >
                Themes
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                      {(() => {
                        const recordAirlines = (selectedRecord.airlines || (selectedRecord.airline ? selectedRecord.airline.split(',').map(a => a.trim()) : []))
                          .filter(airline => isValidAirlineName(airline))
                        const displayAirlines = recordAirlines.length > 0 ? recordAirlines : [DEFAULT_UNKNOWN_AIRLINE]
                        return displayAirlines.map((airline, idx) => (
                          <span key={idx} className={styles.airlineBadge}>
                            {airline.trim()}
                          </span>
                        ))
                      })()}
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Theme</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                      {(selectedRecord.themes || (selectedRecord.theme ? selectedRecord.theme.split(',').map(t => t.trim()) : [])).map((theme, idx) => (
                        <span key={idx} className={styles.themeBadge}>
                          {theme.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              ) : activeTab === 'transcript' ? (
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
              ) : activeTab === 'themes' ? (
                <div className={styles.themesView}>
                  <h3 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.2rem' }}>Theme-wise Analysis</h3>
                  {(() => {
                    const themes = selectedRecord.themes || (selectedRecord.theme ? selectedRecord.theme.split(',').map(t => t.trim()) : [])
                    
                    if (themes.length === 0) {
                      return (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                          <p>No themes found for this record.</p>
                        </div>
                      )
                    }

                    if (loadingThemes) {
                      return (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <div className={styles.loadingSpinner} style={{ margin: '0 auto' }}></div>
                          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '16px' }}>Generating theme summaries...</p>
                        </div>
                      )
                    }

                    return (
                      <div className={styles.themesList}>
                        {themes.map((theme, idx) => (
                          <div key={idx} className={styles.themeSummaryCard}>
                            <div className={styles.themeSummaryHeader}>
                              <span className={styles.themeBadge}>{theme}</span>
                            </div>
                            <div className={styles.themeSummaryContent}>
                              <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '1rem' }}>AI Summary for {theme}</h4>
                              <div style={{ 
                                color: 'rgba(255,255,255,0.8)', 
                                lineHeight: '1.8',
                                fontSize: '0.95rem'
                              }}>
                                {themeSummaries[theme] ? (
                                  <ul style={{ 
                                    listStyle: 'none', 
                                    padding: 0, 
                                    margin: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                  }}>
                                    {themeSummaries[theme].split('\n').filter(line => line.trim()).map((point, pointIdx) => {
                                      // Remove leading "- " if present
                                      const cleanPoint = point.replace(/^-\s*/, '').trim()
                                      return cleanPoint ? (
                                        <li key={pointIdx} style={{ 
                                          display: 'flex',
                                          alignItems: 'flex-start',
                                          gap: '10px'
                                        }}>
                                          <span style={{ color: '#4ade80', fontSize: '1.2rem', lineHeight: '1.2', marginTop: '2px' }}>•</span>
                                          <span style={{ flex: 1 }}>{cleanPoint}</span>
                                        </li>
                                      ) : null
                                    })}
                                  </ul>
                                ) : (
                                  <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading summary...</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              ) : null}
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
              {data.airlineSignals
                .filter(airline => 
                  airline.airline === DEFAULT_UNKNOWN_AIRLINE || isValidAirlineName(airline.airline)
                )
                .map((airline, index) => {
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
              {BACKEND_THEMES.map(theme => (
                <div key={theme} className={styles.heatmapHeaderCell} title={theme}>
                  {theme.length > 15 ? theme.substring(0, 12) + '...' : theme}
                </div>
              ))}
            </div>
            <div className={styles.heatmapBody}>
              {data.heatmapData
                .filter(row => 
                  row.airline === DEFAULT_UNKNOWN_AIRLINE || isValidAirlineName(row.airline)
                )
                .map((row, index) => (
                <div key={index} className={styles.heatmapRow}>
                  <div className={styles.heatmapRowLabel}>{row.airline}</div>
                  {BACKEND_THEMES.map(theme => (
                    <div
                      key={theme}
                      className={styles.heatmapCell}
                      style={{
                        backgroundColor: getHeatmapColor(row[theme] || 0),
                        opacity: 0.3 + ((row[theme] || 0) / 100) * 0.7
                      }}
                      title={`${row.airline} - ${theme}: ${row[theme] || 0}%`}
                    >
                      {row[theme] || 0}
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
