'use client'

import styles from './AIAnalysisResult.module.css'
import Card from '../../components/Card'

export default function AIAnalysisResult({ analysis }) {
    if (!analysis) return null

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
                <p className={styles.summaryText}>{analysis.summary}</p>
                {analysis.originalTheme && (
                    <div className={styles.themeTag}>
                        Theme: {analysis.originalTheme}
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
                        {analysis.keywords.map((keyword, index) => (
                            <span key={index} className={styles.keywordTag}>
                                {keyword}
                            </span>
                        ))}
                    </div>
                </Card>

                {/* Themes */}
                <Card className={styles.tagsCard}>
                    <h4 className={styles.cardTitle}>
                        <span>🏷️</span> Themes
                    </h4>
                    <div className={styles.tagsList}>
                        {analysis.themes.map((theme, index) => (
                            <span key={index} className={styles.themeTagItem}>
                                {theme}
                            </span>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Market Signals */}
            <Card className={styles.signalsCard}>
                <h4 className={styles.cardTitle}>
                    <span>📡</span> Market Signals
                </h4>
                <div className={styles.signalsList}>
                    {analysis.marketSignals.map((signal, index) => (
                        <div key={index} className={styles.signalItem}>
                            <div className={styles.signalInfo}>
                                <span className={styles.signalTrend} style={{ color: signal.trend === 'up' ? '#4ade80' : signal.trend === 'down' ? '#f87171' : '#94a3b8' }}>
                                    {getTrendIcon(signal.trend)}
                                </span>
                                <span className={styles.signalText}>{signal.signal}</span>
                            </div>
                            <span
                                className={styles.signalStrength}
                                style={{ color: getStrengthColor(signal.strength) }}
                            >
                                {signal.strength}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Predictive Probabilities */}


            {/* Airline Specifications */}
            <Card className={styles.airlinesCard}>
                <h4 className={styles.cardTitle}>
                    <span>✈️</span> Airline Specifications
                </h4>
                <div className={styles.airlinesList}>
                    {analysis.airlineSpecifications.map((airline, index) => (
                        <div key={index} className={styles.airlineItem}>
                            <div className={styles.airlineHeader}>
                                <span className={styles.airlineName}>{airline.airline}</span>
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
                            <div className={styles.airlineSignals}>
                                {airline.signals.map((signal, idx) => (
                                    <span key={idx} className={styles.airlineSignalTag}>{signal}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Timestamp */}
            <div className={styles.timestamp}>
                Analysis generated at: {new Date(analysis.timestamp).toLocaleString()}
            </div>
        </div>
    )
}
