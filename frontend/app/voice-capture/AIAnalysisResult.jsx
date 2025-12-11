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

            {/* Key Metrics Row */}
            <div className={styles.metricsRow}>
                {/* Sentiment */}
                <Card className={styles.metricCard}>
                    <h4 className={styles.metricTitle}>Sentiment</h4>
                    <div className={styles.sentimentDisplay}>
                        <span
                            className={styles.sentimentLabel}
                            style={{ color: getSentimentColor(analysis.sentiment.overall) }}
                        >
                            {analysis.sentiment.overall}
                        </span>
                        <span className={styles.sentimentScore}>
                            {(analysis.sentiment.score * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className={styles.sentimentBars}>
                        <div className={styles.sentimentBar}>
                            <span>Positive</span>
                            <div className={styles.barTrack}>
                                <div
                                    className={styles.barFill}
                                    style={{ width: `${analysis.sentiment.breakdown.positive}%`, background: '#4ade80' }}
                                />
                            </div>
                            <span>{analysis.sentiment.breakdown.positive}%</span>
                        </div>
                        <div className={styles.sentimentBar}>
                            <span>Neutral</span>
                            <div className={styles.barTrack}>
                                <div
                                    className={styles.barFill}
                                    style={{ width: `${analysis.sentiment.breakdown.neutral}%`, background: '#94a3b8' }}
                                />
                            </div>
                            <span>{analysis.sentiment.breakdown.neutral}%</span>
                        </div>
                        <div className={styles.sentimentBar}>
                            <span>Negative</span>
                            <div className={styles.barTrack}>
                                <div
                                    className={styles.barFill}
                                    style={{ width: `${analysis.sentiment.breakdown.negative}%`, background: '#f87171' }}
                                />
                            </div>
                            <span>{analysis.sentiment.breakdown.negative}%</span>
                        </div>
                    </div>
                </Card>

                {/* Confidence Score */}
                <Card className={styles.metricCard}>
                    <h4 className={styles.metricTitle}>Confidence Score</h4>
                    <div className={styles.confidenceDisplay}>
                        <div className={styles.confidenceCircle}>
                            <svg viewBox="0 0 100 100">
                                <circle
                                    cx="50" cy="50" r="40"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="50" cy="50" r="40"
                                    fill="none"
                                    stroke="#4ade80"
                                    strokeWidth="8"
                                    strokeDasharray={`${analysis.confidenceScore * 251.2} 251.2`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <span className={styles.confidenceValue}>
                                {(analysis.confidenceScore * 100).toFixed(0)}%
                            </span>
                        </div>
                        <p className={styles.confidenceLabel}>High Confidence</p>
                    </div>
                </Card>
            </div>

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
            <Card className={styles.predictionsCard}>
                <h4 className={styles.cardTitle}>
                    <span>🔮</span> Predictive Probabilities
                </h4>
                <div className={styles.predictionsList}>
                    {analysis.predictiveProbabilities.map((pred, index) => (
                        <div key={index} className={styles.predictionItem}>
                            <div className={styles.predictionInfo}>
                                <span className={styles.predictionEvent}>{pred.event}</span>
                                <span className={styles.predictionProb}>{pred.probability}%</span>
                            </div>
                            <div className={styles.predictionBar}>
                                <div
                                    className={styles.predictionFill}
                                    style={{
                                        width: `${pred.probability}%`,
                                        background: pred.probability > 70 ? '#4ade80' : pred.probability > 40 ? '#fbbf24' : '#f87171'
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

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
