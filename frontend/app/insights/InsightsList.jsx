import Card from '../../components/Card'
import styles from './InsightsList.module.css'
import { DEFAULT_UNKNOWN_AIRLINE } from '../constants'

export default function InsightsList({ insights }) {
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
      {insights.map((insight, index) => {
        // Get themes - support both old format (string) and new format (array)
        // Handle both comma-space and comma separators
        const themes = insight.themes || (insight.theme ? insight.theme.split(',').map(t => t.trim()).filter(t => t) : [])
        
        return (
        <Card key={index} className={styles.insightCard}>
          <div className={styles.header}>
            <h3 className={styles.title}>{insight.transcription}</h3>
            <div className={styles.tags}>
              {themes.length > 0 ? (
                themes.map((theme, idx) => (
                  <span
                    key={idx}
                    className={styles.tag}
                    style={{ backgroundColor: getThemeColor(theme) + '20', color: getThemeColor(theme) }}
                  >
                    {theme.trim()}
                  </span>
                ))
              ) : (
                <span
                  className={styles.tag}
                  style={{ backgroundColor: getThemeColor(insight.theme) + '20', color: getThemeColor(insight.theme) }}
                >
                  {insight.theme || 'General'}
                </span>
              )}
              <span
                className={styles.tag}
                style={{ backgroundColor: getSentimentColor(insight.sentiment) + '20', color: getSentimentColor(insight.sentiment) }}
              >
                {insight.sentiment}
              </span>
              <span className={styles.airlineTag}>
                {insight.airline && isValidAirlineName(insight.airline) ? insight.airline : DEFAULT_UNKNOWN_AIRLINE}
              </span>
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
        )
      })}
    </div>
  )
}


