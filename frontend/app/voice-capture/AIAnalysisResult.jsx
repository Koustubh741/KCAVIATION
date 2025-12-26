'use client'

import styles from './AIAnalysisResult.module.css'
import Card from '../../components/Card'
import NewsCorrelation from './NewsCorrelation'
import { DEFAULT_UNKNOWN_AIRLINE } from '../constants'

export default function AIAnalysisResult({ analysis }) {
    if (!analysis) return null
    
    // Ensure all required fields exist with defaults
    const safeAnalysis = {
        summary: analysis.summary || 'No summary available',
        keywords: analysis.keywords || [],
        themes: analysis.themes || [],
        marketSignals: analysis.marketSignals || [],
        sentiment: analysis.sentiment || { overall: 'Neutral', score: 0.5, breakdown: { positive: 33, neutral: 34, negative: 33 } },
        confidenceScore: analysis.confidenceScore || 0.5,
        predictiveProbabilities: analysis.predictiveProbabilities || [],
        airlineSpecifications: analysis.airlineSpecifications || [],
        primaryAirline: analysis.primaryAirline || null,
        allAirlines: analysis.allAirlines || [],
        timestamp: analysis.timestamp || new Date().toISOString(),
        originalTheme: analysis.originalTheme || null,
        airlineThemeMap: analysis.airlineThemeMap || {},
        themeAirlineMap: analysis.themeAirlineMap || {}
    }

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
    
    // Filter airline specifications to remove invalid names
    const filteredAirlineSpecs = (analysis.airlineSpecifications || []).filter(spec => 
        spec && spec.airline && isValidAirlineName(spec.airline)
    )
    
    // If no valid airlines, add default
    if (filteredAirlineSpecs.length === 0 && (analysis.airlineSpecifications || []).length > 0) {
        filteredAirlineSpecs.push({
            airline: DEFAULT_UNKNOWN_AIRLINE,
            relevance: 'Low',
            isPrimary: true,
            signals: ['General'],
            score: 0.0,
            mentionCount: 0
        })
    }

    // Filter airlineThemeMap to remove invalid airline names
    const filteredAirlineThemeMap = {}
    if (analysis.airlineThemeMap) {
        Object.entries(analysis.airlineThemeMap).forEach(([airline, themes]) => {
            if (isValidAirlineName(airline)) {
                filteredAirlineThemeMap[airline] = themes
            }
        })
    }

    // Filter allAirlines to remove invalid names
    const filteredAllAirlines = (analysis.allAirlines || []).filter(a => isValidAirlineName(a))
    if (filteredAllAirlines.length === 0 && (analysis.allAirlines || []).length > 0) {
        filteredAllAirlines.push(DEFAULT_UNKNOWN_AIRLINE)
    }

    // Ensure all required fields exist with defaults
    const safeAnalysis = {
        summary: analysis.summary || 'No summary available',
        keywords: analysis.keywords || [],
        themes: analysis.themes || [],
        marketSignals: analysis.marketSignals || [],
        sentiment: analysis.sentiment || { overall: 'Neutral', score: 0.5, breakdown: { positive: 33, neutral: 34, negative: 33 } },
        confidenceScore: analysis.confidenceScore || 0.5,
        predictiveProbabilities: analysis.predictiveProbabilities || [],
        airlineSpecifications: filteredAirlineSpecs,
        primaryAirline: analysis.primaryAirline && isValidAirlineName(analysis.primaryAirline) ? analysis.primaryAirline : (filteredAllAirlines.length > 0 ? filteredAllAirlines[0] : DEFAULT_UNKNOWN_AIRLINE),
        allAirlines: filteredAllAirlines,
        timestamp: analysis.timestamp || new Date().toISOString(),
        originalTheme: analysis.originalTheme || null,
        airlineThemeMap: filteredAirlineThemeMap,
        themeAirlineMap: analysis.themeAirlineMap || {},
        correlation: analysis.correlation || null
    }

    const getSentimentColor = (sentiment) => {
        switch (sentiment?.toLowerCase()) {
            case 'positive': return '#4ade80'
            case 'negative': return '#f87171'
            case 'neutral': return '#94a3b8'
            default: return '#4ade80'
        }
    }

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return '↑'
            case 'down': return '↓'
            default: return '→'
        }
    }

    const getStrengthColor = (strength) => {
        switch (strength?.toLowerCase()) {
            case 'strong': return '#4ade80'
            case 'moderate': return '#fbbf24'
            case 'weak': return '#f87171'
            default: return '#94a3b8'
        }
    }

    return (
        <div className={styles.analysisContainer}>
            <h2 className={styles.mainTitle}>
                <span className={styles.titleIcon}>🤖</span>
                AI Intelligence Analysis
            </h2>

            {/* Summary */}
            <Card className={styles.summaryCard}>
                <h3 className={styles.cardTitle}>
                    <span>📋</span> Intelligence Summary
                </h3>
                {/* Detected Airlines - Show prominently at top */}
                {safeAnalysis.allAirlines && safeAnalysis.allAirlines.length > 0 && (
                    <div style={{ 
                        marginBottom: '20px', 
                        padding: '14px 16px', 
                        background: 'rgba(74, 222, 128, 0.1)',
                        border: '1px solid rgba(74, 222, 128, 0.3)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: '600', 
                            color: 'rgba(255,255,255,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>✈️</span> Auto-Detected Airlines:
                        </span>
                        {safeAnalysis.allAirlines.map((airline, idx) => (
                            <span 
                                key={idx}
                                style={{
                                    padding: '6px 14px',
                                    background: safeAnalysis.primaryAirline === airline 
                                        ? 'rgba(74, 222, 128, 0.3)' 
                                        : 'rgba(255, 255, 255, 0.1)',
                                    border: safeAnalysis.primaryAirline === airline 
                                        ? '2px solid #4ade80' 
                                        : '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '20px',
                                    color: safeAnalysis.primaryAirline === airline 
                                        ? '#4ade80' 
                                        : '#ffffff',
                                    fontWeight: safeAnalysis.primaryAirline === airline ? '700' : '500',
                                    fontSize: '0.9rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {airline}
                                {safeAnalysis.primaryAirline === airline && (
                                    <span style={{ 
                                        fontSize: '0.85em',
                                        opacity: 0.9
                                    }}>⭐ Primary</span>
                                )}
                            </span>
                        ))}
                    </div>
                )}
                <p className={styles.summaryText}>{safeAnalysis.summary}</p>
                {safeAnalysis.originalTheme && (
                    <div className={styles.themeTag}>
                        Theme: {safeAnalysis.originalTheme}
                    </div>
                )}
            </Card>



            {/* Keywords & Themes Row */}
            <div className={styles.tagsRow}>
                {/* Keywords */}
                <Card className={styles.tagsCard}>
                    <h4 className={styles.cardTitle}>
                        <span>🔑</span> Keywords
                    </h4>
                    <div className={styles.tagsList}>
                        {safeAnalysis.keywords.length > 0 ? (
                            safeAnalysis.keywords.map((keyword, index) => (
                                <span key={index} className={styles.keywordTag}>
                                    {keyword}
                                </span>
                            ))
                        ) : (
                            <span className={styles.keywordTag}>No keywords detected</span>
                        )}
                    </div>
                </Card>

                {/* Themes */}
                <Card className={styles.tagsCard}>
                    <h4 className={styles.cardTitle}>
                        <span>🏷️</span> Themes
                    </h4>
                    <div className={styles.tagsList}>
                        {safeAnalysis.themes.length > 0 ? (
                            safeAnalysis.themes.map((theme, index) => (
                                <span key={index} className={styles.themeTagItem}>
                                    {theme}
                                </span>
                            ))
                        ) : (
                            <span className={styles.themeTagItem}>General</span>
                        )}
                    </div>
                </Card>
            </div>

            {/* Market Signals */}
            <Card className={styles.signalsCard}>
                <h4 className={styles.cardTitle}>
                    <span>📡</span> Market Signals
                </h4>
                <div className={styles.signalsList}>
                    {safeAnalysis.marketSignals.length > 0 ? (
                        safeAnalysis.marketSignals.map((signal, index) => (
                            <div key={index} className={styles.signalItem}>
                                <div className={styles.signalInfo}>
                                    <span className={styles.signalTrend} style={{ color: signal.trend === 'up' ? '#4ade80' : signal.trend === 'down' ? '#f87171' : '#94a3b8' }}>
                                        {getTrendIcon(signal.trend)}
                                    </span>
                                    <span className={styles.signalText}>{signal.signal}</span>
                                </div>
                                <span
                                    className={styles.signalStrength}
                                    style={{ 
                                        backgroundColor: getStrengthColor(signal.strength) + '40',
                                        color: getStrengthColor(signal.strength),
                                        border: `1px solid ${getStrengthColor(signal.strength)}60`
                                    }}
                                >
                                    {signal.strength}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className={styles.signalItem}>
                            <span className={styles.signalText}>No market signals detected</span>
                        </div>
                    )}
                </div>
            </Card>

            {/* Predictive Probabilities */}


            {/* Airline Specifications */}
            <Card className={styles.airlinesCard}>
                <h4 className={styles.cardTitle}>
                    <span>✈️</span> Airline Specifications
                    {safeAnalysis.primaryAirline && (
                        <span style={{ fontSize: '0.8em', marginLeft: '10px', color: '#94a3b8' }}>
                            (Primary: {safeAnalysis.primaryAirline})
                        </span>
                    )}
                </h4>
                <div className={styles.airlinesList}>
                    {safeAnalysis.airlineSpecifications.length > 0 ? (
                        safeAnalysis.airlineSpecifications.map((airline, index) => {
                            const isPrimary = airline.isPrimary || safeAnalysis.primaryAirline === airline.airline
                            return (
                                <div 
                                    key={index} 
                                    className={styles.airlineItem}
                                    style={{
                                        border: isPrimary ? '2px solid #4ade80' : '1px solid transparent',
                                        background: isPrimary ? 'rgba(74,222,128,0.05)' : 'transparent'
                                    }}
                                >
                                    <div className={styles.airlineHeader}>
                                        <span className={styles.airlineName}>
                                            {airline.airline}
                                            {isPrimary && (
                                                <span style={{ 
                                                    marginLeft: '8px', 
                                                    fontSize: '0.75em', 
                                                    color: '#4ade80',
                                                    fontWeight: 'bold'
                                                }}>PRIMARY</span>
                                            )}
                                        </span>
                                        <span
                                            className={styles.airlineRelevance}
                                            style={{
                                                background: airline.relevance === 'High' ? 'rgba(74,222,128,0.2)' :
                                                    airline.relevance === 'Medium' ? 'rgba(251,191,36,0.2)' : 'rgba(148,163,184,0.2)',
                                                color: airline.relevance === 'High' ? '#4ade80' :
                                                    airline.relevance === 'Medium' ? '#fbbf24' : '#94a3b8'
                                            }}
                                        >
                                            {airline.relevance} Relevance
                                        </span>
                                    </div>
                                    {/* Show themes for this airline */}
                                    {airline.themes && airline.themes.length > 0 && (
                                        <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginRight: '8px' }}>Themes:</span>
                                            {airline.themes.map((theme, idx) => (
                                                <span key={idx} className={styles.themeTagItem} style={{ marginRight: '6px' }}>
                                                    {theme}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className={styles.airlineSignals}>
                                        {airline.signals && airline.signals.length > 0 ? (
                                            airline.signals.map((signal, idx) => (
                                                <span key={idx} className={styles.airlineSignalTag}>{signal}</span>
                                            ))
                                        ) : (
                                            <span className={styles.airlineSignalTag}>General</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className={styles.airlineItem}>
                            <span className={styles.airlineName}>No airlines detected</span>
                        </div>
                    )}
                </div>
                {safeAnalysis.allAirlines && safeAnalysis.allAirlines.length > 1 && (
                    <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(148,163,184,0.1)', borderRadius: '8px', fontSize: '0.9em' }}>
                        <strong>All detected airlines:</strong> {safeAnalysis.allAirlines.join(', ')}
                    </div>
                )}
            </Card>

            {/* Airline-Theme Relationships */}
            {(safeAnalysis.airlineThemeMap && Object.keys(safeAnalysis.airlineThemeMap).length > 0) || 
             (safeAnalysis.themeAirlineMap && Object.keys(safeAnalysis.themeAirlineMap).length > 0) ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                    {/* One-to-Many: Airlines with their Themes */}
                    {safeAnalysis.airlineThemeMap && Object.keys(safeAnalysis.airlineThemeMap).length > 0 && (
                        <Card className={styles.relationshipCard}>
                            <h4 className={styles.cardTitle}>
                                <span>🔗</span> Airlines & Their Themes
                            </h4>
                            <div className={styles.relationshipList}>
                                {Object.entries(safeAnalysis.airlineThemeMap).map(([airline, themes]) => (
                                    <div key={airline} className={styles.relationshipItem}>
                                        <div className={styles.relationshipHeader}>
                                            <span className={styles.relationshipPrimary}>{airline}</span>
                                            <span className={styles.relationshipCount}>{themes.length} theme{themes.length !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className={styles.relationshipTags}>
                                            {themes.map((theme, idx) => (
                                                <span key={idx} className={styles.relationshipTag}>
                                                    {theme}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Many-to-One: Themes with their Airlines */}
                    {safeAnalysis.themeAirlineMap && Object.keys(safeAnalysis.themeAirlineMap).length > 0 && (
                        <Card className={styles.relationshipCard}>
                            <h4 className={styles.cardTitle}>
                                <span>📊</span> Themes & Their Airlines
                            </h4>
                            <div className={styles.relationshipList}>
                                {Object.entries(safeAnalysis.themeAirlineMap).map(([theme, airlines]) => (
                                    airlines.length > 0 ? (
                                        <div key={theme} className={styles.relationshipItem}>
                                            <div className={styles.relationshipHeader}>
                                                <span className={styles.relationshipPrimary}>{theme}</span>
                                                <span className={styles.relationshipCount}>{airlines.length} airline{airlines.length !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className={styles.relationshipTags}>
                                                {airlines.map((airline, idx) => (
                                                    <span key={idx} className={styles.relationshipTag}>
                                                        {airline}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            ) : null}

            {/* News Correlation */}
            {safeAnalysis.correlation && (
                <NewsCorrelation correlation={safeAnalysis.correlation} />
            )}

            {/* Timestamp */}
            <div className={styles.timestamp}>
                Analysis generated at: {new Date(safeAnalysis.timestamp).toLocaleString()}
            </div>
        </div>
    )
}
