import styles from './TranscriptionPreview.module.css'
import Card from '../../components/Card'

export default function TranscriptionPreview({ transcription, keywords = [] }) {
  if (!transcription) return null

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

  // Highlight keywords in transcription text
  const highlightKeywords = (text, keywords) => {
    if (!text || !keywords || keywords.length === 0) {
      return text
    }

    // Sort keywords by length (longer first) to avoid partial matches
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length)
    
    // Create a regex pattern that matches keywords (case-insensitive, whole words)
    const pattern = new RegExp(
      `\\b(${sortedKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
      'gi'
    )

    // Split text and highlight matches
    const parts = []
    let lastIndex = 0
    let match

    while ((match = pattern.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }
      
      // Add highlighted match
      parts.push(
        <mark key={match.index} className={styles.highlightedKeyword}>
          {match[0]}
        </mark>
      )
      
      lastIndex = pattern.lastIndex
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts.length > 0 ? parts : text
  }

  return (
    <Card className={styles.preview}>
      <h2 className={styles.title}>Transcription Result</h2>
      <div className={styles.content}>
        <div className={styles.transcription}>
          <p className={styles.label}>Transcription:</p>
          <p className={styles.text}>
            {highlightKeywords(transcription.transcription, keywords)}
          </p>
        </div>
        <div className={styles.metadata}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Airline:</span>
            <span className={styles.metaValue}>{transcription.airline}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Theme:</span>
            <span className={styles.metaValue}>{transcription.theme}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Sentiment:</span>
            <span
              className={styles.sentiment}
              style={{ color: getSentimentColor(transcription.sentiment) }}
            >
              {transcription.sentiment}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Score:</span>
            <span className={styles.score}>
              {(transcription.score * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}


