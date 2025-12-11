import styles from './TranscriptionPreview.module.css'
import Card from '../../components/Card'

export default function TranscriptionPreview({ transcription }) {
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

  return (
    <Card className={styles.preview}>
      <h2 className={styles.title}>Transcription Result</h2>
      <div className={styles.content}>
        <div className={styles.transcription}>
          <p className={styles.label}>Transcription:</p>
          <p className={styles.text}>{transcription.transcription}</p>
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


