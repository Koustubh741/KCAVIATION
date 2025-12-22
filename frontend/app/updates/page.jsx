'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import Card from '../../components/Card'

export default function UpdatesPage() {
    const [activeTab, setActiveTab] = useState('news')
    const [updates, setUpdates] = useState([])
    const [correlationData, setCorrelationData] = useState(null)

    useEffect(() => {
        loadUpdates()
        
        const interval = setInterval(loadUpdates, 30000)
        window.addEventListener('storage', loadUpdates)

        return () => {
            clearInterval(interval)
            window.removeEventListener('storage', loadUpdates)
        }
    }, [])

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

                return {
                    title: `${record.airline} - ${record.theme}`,
                    description: record.summary || 'New intelligence signal detected',
                    date: timeAgo,
                    airline: record.airline,
                    theme: record.theme,
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

            setCorrelationData({
                hiringCount: hiringRecords.length,
                expansionCount: expansionRecords.length,
                financialCount: financialRecords.length,
                totalRecords: userRecords.length,
                correlation: userRecords.length > 5 ? 'Strong correlation detected' : 'Insufficient data for correlation'
            })
        } else {
            setCorrelationData(null)
        }
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
                    className={`${styles.tabButton} ${activeTab === 'correlation' ? styles.active : ''}`}
                    onClick={() => setActiveTab('correlation')}
                >
                    <span>🔗</span> Correlation
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'news' ? (
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
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
                                        <p>{correlationData.correlation}</p>
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
