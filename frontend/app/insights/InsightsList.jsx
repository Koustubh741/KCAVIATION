import Card from '../../components/Card'
import styles from './InsightsList.module.css'

export default function InsightsList({ insights }) {
  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return '#4ade80'
      case 'negative':
        return '#f87171'
      case 'neutral':
        return '#94a3b8'
      default:
        return '#94a3b8'
    }
  }

  const getThemeColor = (theme) => {
    const colors = {
      hiring: '#4facfe',
      expansion: '#00f2fe',
      financial: '#30cfd0',
      operations: '#fa709a',
      safety: '#fee140',
    }
    return colors[theme?.toLowerCase()] || '#94a3b8'
  }

  if (insights.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No insights available yet.</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {insights.map((insight, index) => (
        <Card key={index} className={styles.insightCard}>
          <div className={styles.header}>
            <h3 className={styles.title}>{insight.transcription}</h3>
            <div className={styles.tags}>
              <span
                className={styles.tag}
                style={{ backgroundColor: getThemeColor(insight.theme) + '20', color: getThemeColor(insight.theme) }}
              >
                {insight.theme}
              </span>
              <span
                className={styles.tag}
                style={{ backgroundColor: getSentimentColor(insight.sentiment) + '20', color: getSentimentColor(insight.sentiment) }}
              >
                {insight.sentiment}
              </span>
              <span className={styles.airlineTag}>{insight.airline}</span>
            </div>
          </div>
          <div className={styles.footer}>
            <span className={styles.score}>
              Confidence: {(insight.score * 100).toFixed(1)}%
            </span>
            <span className={styles.date}>
              {new Date(insight.timestamp || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}


