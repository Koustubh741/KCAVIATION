'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import Card from '../../components/Card'
import { DEFAULT_UNKNOWN_AIRLINE, BACKEND_URL } from '../constants'

export default function UpdatesPage() {
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
    const [activeTab, setActiveTab] = useState('news')
    const [updates, setUpdates] = useState([])
    const [correlationData, setCorrelationData] = useState(null)
    const [aviationNews, setAviationNews] = useState([])
    const [loadingNews, setLoadingNews] = useState(false)
    const [newsFilters, setNewsFilters] = useState({
        airline: '',
        theme: '',
        days: 7
    })
    const [selectedNewsForCorrelation, setSelectedNewsForCorrelation] = useState(null)
    const [correlationResult, setCorrelationResult] = useState(null)
    
    // Backend themes for filter dropdown
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

    useEffect(() => {
        loadUpdates()
        
        const interval = setInterval(loadUpdates, 30000)
        window.addEventListener('storage', loadUpdates)

        return () => {
            clearInterval(interval)
            window.removeEventListener('storage', loadUpdates)
        }
    }, [])

    useEffect(() => {
        if (activeTab === 'aviation-news') {
            fetchAviationNews()
        }
    }, [activeTab, newsFilters])

    const loadUpdates = () => {
        // Get user
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : null
        const currentEmail = user ? user.email : 'guest'

        // Load recordings
        const history = JSON.parse(localStorage.getItem('recording_history') || '[]')
        const userRecords = history.filter(record => record.userId === currentEmail)

        // Generate updates from recent recordings
        const recentUpdates = userRecords
            .sort((a, b) => {
                const dateA = new Date(a.date + 'T' + a.time)
                const dateB = new Date(b.date + 'T' + b.time)
                return dateB - dateA
            })
            .slice(0, 10)
            .map(record => {
                const recordDate = new Date(record.date + 'T' + record.time)
                const hoursAgo = Math.floor((Date.now() - recordDate.getTime()) / (1000 * 60 * 60))
                const timeAgo = hoursAgo < 1 ? 'Less than an hour ago' :
                               hoursAgo < 24 ? `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago` :
                               `${Math.floor(hoursAgo / 24)} day${Math.floor(hoursAgo / 24) > 1 ? 's' : ''} ago`

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

                // Get themes - support both old format (string) and new format (array)
                const recordThemes = record.themes || (record.theme ? record.theme.split(',').map(t => t.trim()).filter(t => t) : [])
                const displayThemes = recordThemes.length > 0 ? recordThemes : (record.theme ? [record.theme] : ['General'])
                
                return {
                    title: `${airline} - ${displayThemes.join(', ')}`,
                    description: record.summary || 'New intelligence signal detected',
                    date: timeAgo,
                    airline: airline,
                    theme: displayThemes.join(', '),
                    themes: displayThemes,
                    signal: record.signal
                }
            })

        setUpdates(recentUpdates)

        // Calculate correlation data
        if (userRecords.length > 0) {
            const hiringRecords = userRecords.filter(r => 
                (r.theme || '').toLowerCase().includes('hiring')
            )
            const expansionRecords = userRecords.filter(r => 
                (r.theme || '').toLowerCase().includes('expansion') || 
                (r.theme || '').toLowerCase().includes('fleet')
            )
            const financialRecords = userRecords.filter(r => 
                (r.theme || '').toLowerCase().includes('financial')
            )

            // Calculate news correlation statistics
            const recordsWithCorrelation = userRecords.filter(r => r.correlation && r.correlation.correlationScore > 0)
            let avgCorrelationScore = 0
            let verifiedCount = 0
            let partialCount = 0
            let unverifiedCount = 0

            if (recordsWithCorrelation.length > 0) {
                avgCorrelationScore = recordsWithCorrelation.reduce((sum, r) => {
                    return sum + (r.correlation?.correlationScore || 0)
                }, 0) / recordsWithCorrelation.length

                verifiedCount = recordsWithCorrelation.filter(r => 
                    r.correlation?.verificationStatus === 'verified'
                ).length
                partialCount = recordsWithCorrelation.filter(r => 
                    r.correlation?.verificationStatus === 'partial'
                ).length
                unverifiedCount = recordsWithCorrelation.filter(r => 
                    r.correlation?.verificationStatus === 'unverified'
                ).length
            }

            // Determine overall correlation status
            let correlationStatus = 'Insufficient data for correlation'
            if (recordsWithCorrelation.length > 0) {
                if (avgCorrelationScore >= 0.8) {
                    correlationStatus = 'Strong correlation detected'
                } else if (avgCorrelationScore >= 0.5) {
                    correlationStatus = 'Partial correlation detected'
                } else {
                    correlationStatus = 'Weak correlation detected'
                }
            }

            setCorrelationData({
                hiringCount: hiringRecords.length,
                expansionCount: expansionRecords.length,
                financialCount: financialRecords.length,
                totalRecords: userRecords.length,
                correlation: correlationStatus,
                avgCorrelationScore: avgCorrelationScore,
                verifiedCount: verifiedCount,
                partialCount: partialCount,
                unverifiedCount: unverifiedCount,
                totalWithCorrelation: recordsWithCorrelation.length
            })
        } else {
            setCorrelationData(null)
        }
    }

    const fetchAviationNews = async () => {
        setLoadingNews(true)
        try {
            const backendUrl = BACKEND_URL
            const params = new URLSearchParams({
                days: newsFilters.days.toString(),
                max_results: '50'
            })
            
            if (newsFilters.airline) {
                params.append('airline', newsFilters.airline)
            }
            
            if (newsFilters.theme) {
                params.append('theme', newsFilters.theme)
            }
            
            const url = `${backendUrl}/api/news?${params}`
            console.log('Fetching news from:', url)
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            
            if (!response.ok) {
                let errorMessage = `Failed to fetch news (Status: ${response.status})`
                try {
                    const errorText = await response.text()
                    if (errorText) {
                        try {
                            const errorData = JSON.parse(errorText)
                            errorMessage = errorData.detail || errorData.message || errorMessage
                        } catch (e) {
                            errorMessage = errorText || errorMessage
                        }
                    }
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`
                }
                
                // Check if it's a connection error
                if (response.status === 0 || errorMessage.includes('Failed to fetch')) {
                    errorMessage = 'Cannot connect to backend server. Please ensure the backend is running on ' + backendUrl
                }
                
                throw new Error(errorMessage)
            }
            
            const data = await response.json()
            console.log('News fetched successfully:', data.count, 'articles')
            
            setAviationNews(data.articles || [])
        } catch (error) {
            console.error('Failed to fetch aviation news:', error)
            console.error('Backend URL:', BACKEND_URL)
            console.error('Error details:', error.message)
            
            // Show user-friendly error
            if (error.message.includes('Cannot connect') || error.message.includes('Failed to fetch')) {
                alert('Cannot connect to backend server. Please ensure:\n1. Backend server is running\n2. Backend URL is correct (check .env file)\n3. No firewall is blocking the connection')
            } else {
                alert(`Failed to fetch news: ${error.message}`)
            }
            
            setAviationNews([])
        } finally {
            setLoadingNews(false)
        }
    }

    const handleCorrelateNews = async (article) => {
        // Get user's recent transcripts
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : null
        const currentEmail = user ? user.email : 'guest'
        
        const history = JSON.parse(localStorage.getItem('recording_history') || '[]')
        const userRecords = history.filter(r => r.userId === currentEmail)
        
        if (userRecords.length === 0) {
            alert('No transcripts available for correlation. Please record some insights first.')
            return
        }
        
        // Use the most recent transcript, or let user select
        const selectedRecord = userRecords[0]
        const selectedTranscript = selectedRecord.transcript || selectedRecord.summary || ''
        
        if (!selectedTranscript) {
            alert('Selected record has no transcript available.')
            return
        }
        
        setSelectedNewsForCorrelation(article)
        
        try {
            const backendUrl = BACKEND_URL
            const formData = new URLSearchParams({
                transcript: selectedTranscript,
                airlines: newsFilters.airline || '',
                themes: newsFilters.theme || ''
            })
            
            const response = await fetch(`${backendUrl}/api/correlate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            })
            
            if (!response.ok) {
                let errorMessage = `Correlation failed (Status: ${response.status})`
                try {
                    const errorText = await response.text()
                    if (errorText) {
                        try {
                            const errorData = JSON.parse(errorText)
                            errorMessage = errorData.detail || errorData.message || errorMessage
                        } catch (e) {
                            errorMessage = errorText || errorMessage
                        }
                    }
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`
                }
                
                // Check if it's a connection error
                if (response.status === 0 || errorMessage.includes('Failed to fetch')) {
                    errorMessage = 'Cannot connect to backend server. Please ensure the backend is running on ' + backendUrl
                }
                
                throw new Error(errorMessage)
            }
            
            const correlation = await response.json()
            setCorrelationResult(correlation)
        } catch (error) {
            console.error('Correlation failed:', error)
            console.error('Backend URL:', BACKEND_URL)
            console.error('Error details:', error.message)
            
            // Show user-friendly error
            if (error.message.includes('Cannot connect') || error.message.includes('Failed to fetch')) {
                alert('Cannot connect to backend server. Please ensure:\n1. Backend server is running\n2. Backend URL is correct (check .env file)\n3. No firewall is blocking the connection')
            } else {
                alert(`Failed to correlate news article: ${error.message}`)
            }
        }
    }

    const getAvailableAirlines = () => {
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : null
        const currentEmail = user ? user.email : 'guest'
        const history = JSON.parse(localStorage.getItem('recording_history') || '[]')
        const userRecords = history.filter(record => record.userId === currentEmail)
        
        const airlines = new Set()
        userRecords.forEach(record => {
            if (record.airlines && Array.isArray(record.airlines)) {
                record.airlines.filter(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE).forEach(a => airlines.add(a))
            } else if (record.airline) {
                record.airline.split(',').map(a => a.trim()).filter(a => isValidAirlineName(a) && a !== DEFAULT_UNKNOWN_AIRLINE).forEach(a => airlines.add(a))
            }
        })
        
        return Array.from(airlines).sort()
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Market Updates</h1>
                <p className={styles.subtitle}>Latest intelligence signals and market correlations</p>
            </header>

            <div className={styles.tabContainer}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'news' ? styles.active : ''}`}
                    onClick={() => setActiveTab('news')}
                >
                    <span>📰</span> Recent Signals
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'aviation-news' ? styles.active : ''}`}
                    onClick={() => setActiveTab('aviation-news')}
                >
                    <span>✈️</span> Aviation News
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'correlation' ? styles.active : ''}`}
                    onClick={() => setActiveTab('correlation')}
                >
                    <span>🔗</span> Correlation
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'aviation-news' ? (
                    <div>
                        {/* Filters */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '1rem', 
                            marginBottom: '2rem', 
                            flexWrap: 'wrap',
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px'
                        }}>
                            <select
                                value={newsFilters.days}
                                onChange={(e) => setNewsFilters({...newsFilters, days: parseInt(e.target.value)})}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value={7}>Last 7 Days</option>
                                <option value={30}>Last Month</option>
                            </select>
                            
                            <select
                                value={newsFilters.airline}
                                onChange={(e) => setNewsFilters({...newsFilters, airline: e.target.value})}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    minWidth: '150px'
                                }}
                            >
                                <option value="">All Airlines</option>
                                {getAvailableAirlines().map(airline => (
                                    <option key={airline} value={airline}>{airline}</option>
                                ))}
                            </select>
                            
                            <select
                                value={newsFilters.theme}
                                onChange={(e) => setNewsFilters({...newsFilters, theme: e.target.value})}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    minWidth: '200px'
                                }}
                            >
                                <option value="">All Themes</option>
                                {BACKEND_THEMES.map(theme => (
                                    <option key={theme} value={theme}>{theme}</option>
                                ))}
                            </select>
                            
                            <button
                                onClick={fetchAviationNews}
                                disabled={loadingNews}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '8px',
                                    background: loadingNews ? 'rgba(74, 222, 128, 0.5)' : '#4ade80',
                                    border: 'none',
                                    color: '#0f172a',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    cursor: loadingNews ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {loadingNews ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>
                        
                        {/* News Grid */}
                        {loadingNews ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
                                <p>Loading aviation news...</p>
                            </div>
                        ) : aviationNews.length > 0 ? (
                            <div className={styles.newsGrid}>
                                {aviationNews.map((article, index) => (
                                    <Card key={index} className={styles.newsCard}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                            <h3 style={{ flex: 1, marginRight: '10px' }}>{article.title}</h3>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                background: 'rgba(99, 102, 241, 0.2)',
                                                color: '#818cf8',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {article.source || 'Unknown Source'}
                                            </span>
                                        </div>
                                        <p style={{ 
                                            color: 'rgba(255, 255, 255, 0.7)', 
                                            fontSize: '0.9rem', 
                                            lineHeight: '1.6',
                                            marginBottom: '12px'
                                        }}>
                                            {article.description || article.fullText?.substring(0, 200) || 'No description available'}...
                                        </p>
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            marginTop: '12px',
                                            fontSize: '0.85rem', 
                                            color: 'rgba(255,255,255,0.5)'
                                        }}>
                                            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                            <a 
                                                href={article.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ 
                                                    color: '#4ade80', 
                                                    textDecoration: 'none',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                Read More →
                                            </a>
                                        </div>
                                        <button 
                                            onClick={() => handleCorrelateNews(article)}
                                            style={{
                                                marginTop: '12px',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                background: 'rgba(74, 222, 128, 0.15)',
                                                border: '1px solid rgba(74, 222, 128, 0.3)',
                                                color: '#4ade80',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                width: '100%',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = 'rgba(74, 222, 128, 0.25)'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = 'rgba(74, 222, 128, 0.15)'
                                            }}
                                        >
                                            🔗 Correlate with Transcripts
                                        </button>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>
                                <p>No news found for selected filters. Try adjusting your filters or check back later.</p>
                            </div>
                        )}
                        
                        {/* Correlation Result Modal */}
                        {correlationResult && selectedNewsForCorrelation && (
                            <div style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000,
                                padding: '2rem'
                            }} onClick={() => {
                                setCorrelationResult(null)
                                setSelectedNewsForCorrelation(null)
                            }}>
                                <Card style={{
                                    maxWidth: '600px',
                                    width: '100%',
                                    maxHeight: '80vh',
                                    overflow: 'auto',
                                    background: 'rgba(30, 41, 59, 0.95)'
                                }} onClick={(e) => e.stopPropagation()}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <h2 style={{ color: '#fff', margin: 0 }}>Correlation Results</h2>
                                        <button
                                            onClick={() => {
                                                setCorrelationResult(null)
                                                setSelectedNewsForCorrelation(null)
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#fff',
                                                fontSize: '1.5rem',
                                                cursor: 'pointer',
                                                padding: '0 0.5rem'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h3 style={{ color: '#4ade80', fontSize: '1rem', marginBottom: '0.5rem' }}>News Article:</h3>
                                        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>{selectedNewsForCorrelation.title}</p>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                Correlation Score: <strong style={{ color: '#4ade80' }}>{(correlationResult.correlationScore * 100).toFixed(0)}%</strong>
                                            </span>
                                            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                Status: <strong style={{ 
                                                    color: correlationResult.verificationStatus === 'verified' ? '#4ade80' :
                                                           correlationResult.verificationStatus === 'partial' ? '#fbbf24' : '#f87171'
                                                }}>{correlationResult.verificationStatus}</strong>
                                            </span>
                                        </div>
                                    </div>
                                    {correlationResult.supportingReferences && correlationResult.supportingReferences.length > 0 && (
                                        <div>
                                            <h3 style={{ color: '#4ade80', fontSize: '1rem', marginBottom: '0.5rem' }}>Supporting References:</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {correlationResult.supportingReferences.slice(0, 3).map((ref, idx) => (
                                                    <div key={idx} style={{
                                                        padding: '0.75rem',
                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <a 
                                                            href={ref.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            style={{ 
                                                                color: '#4ade80', 
                                                                textDecoration: 'none',
                                                                fontWeight: '500',
                                                                display: 'block',
                                                                marginBottom: '0.25rem'
                                                            }}
                                                        >
                                                            {ref.title}
                                                        </a>
                                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                                            {ref.source} • {new Date(ref.publishedAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'news' ? (
                    updates.length > 0 ? (
                        <div className={styles.newsGrid}>
                            {updates.map((update, index) => (
                                <Card key={index} className={styles.newsCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                        <h3>{update.title}</h3>
                                        <span 
                                            style={{
                                                fontSize: '0.75rem',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                background: update.signal?.toLowerCase().includes('positive') ? 'rgba(74,222,128,0.2)' :
                                                           update.signal?.toLowerCase().includes('negative') ? 'rgba(248,113,113,0.2)' :
                                                           'rgba(148,163,184,0.2)',
                                                color: update.signal?.toLowerCase().includes('positive') ? '#4ade80' :
                                                       update.signal?.toLowerCase().includes('negative') ? '#f87171' : '#94a3b8'
                                            }}
                                        >
                                            {update.signal || 'Neutral'}
                                        </span>
                                    </div>
                                    <p>{update.description}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px', marginBottom: '8px' }}>
                                        {(update.themes || (update.theme ? update.theme.split(',').map(t => t.trim()).filter(t => t) : [])).map((theme, idx) => (
                                            <span
                                                key={idx}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    background: 'rgba(74, 222, 128, 0.15)',
                                                    border: '1px solid rgba(74, 222, 128, 0.3)',
                                                    color: '#4ade80'
                                                }}
                                            >
                                                {theme.trim()}
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                                        <span>{update.airline}</span>
                                        <span className={styles.date}>{update.date}</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>
                            <p>No updates available. Record some voice insights to see updates here.</p>
                        </div>
                    )
                ) : (
                    <div className={styles.correlationView}>
                        <Card className={styles.correlationCard}>
                            <h3>Market Correlation Analysis</h3>
                            <div className={styles.correlationContent}>
                                {correlationData ? (
                                    <>
                                        <div style={{ marginBottom: '15px' }}>
                                            <p style={{ marginBottom: '8px', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
                                                {correlationData.correlation}
                                            </p>
                                            {correlationData.totalWithCorrelation > 0 && (
                                                <div style={{ 
                                                    display: 'flex', 
                                                    gap: '15px', 
                                                    fontSize: '0.85rem',
                                                    color: 'rgba(255,255,255,0.6)',
                                                    marginTop: '10px',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    <span>Avg Score: <strong style={{ color: '#4ade80' }}>{(correlationData.avgCorrelationScore * 100).toFixed(0)}%</strong></span>
                                                    <span>Verified: <strong style={{ color: '#4ade80' }}>{correlationData.verifiedCount}</strong></span>
                                                    <span>Partial: <strong style={{ color: '#fbbf24' }}>{correlationData.partialCount}</strong></span>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                    <span>Hiring Signals:</span>
                                                    <strong>{correlationData.hiringCount}</strong>
                                                </div>
                                                <div style={{ 
                                                    width: '100%', 
                                                    height: '8px', 
                                                    background: 'rgba(255,255,255,0.1)', 
                                                    borderRadius: '4px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{ 
                                                        width: `${(correlationData.hiringCount / Math.max(correlationData.totalRecords, 1)) * 100}%`, 
                                                        height: '100%', 
                                                        background: '#4ade80' 
                                                    }}></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                    <span>Expansion Signals:</span>
                                                    <strong>{correlationData.expansionCount}</strong>
                                                </div>
                                                <div style={{ 
                                                    width: '100%', 
                                                    height: '8px', 
                                                    background: 'rgba(255,255,255,0.1)', 
                                                    borderRadius: '4px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{ 
                                                        width: `${(correlationData.expansionCount / Math.max(correlationData.totalRecords, 1)) * 100}%`, 
                                                        height: '100%', 
                                                        background: '#4facfe' 
                                                    }}></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                    <span>Financial Signals:</span>
                                                    <strong>{correlationData.financialCount}</strong>
                                                </div>
                                                <div style={{ 
                                                    width: '100%', 
                                                    height: '8px', 
                                                    background: 'rgba(255,255,255,0.1)', 
                                                    borderRadius: '4px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{ 
                                                        width: `${(correlationData.financialCount / Math.max(correlationData.totalRecords, 1)) * 100}%`, 
                                                        height: '100%', 
                                                        background: '#fbbf24' 
                                                    }}></div>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                                <strong>Total Signals:</strong> {correlationData.totalRecords}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p>No correlation data available. Record insights to see correlations.</p>
                                )}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
