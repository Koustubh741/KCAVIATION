import styles from './Heatmap.module.css'

export default function Heatmap() {
  // Mock heatmap data
  const airlines = ['Indigo', 'Air India', 'SpiceJet', 'Vistara', 'GoAir']
  const themes = ['Hiring', 'Expansion', 'Financial', 'Operations', 'Safety']

  const getIntensity = (airline, theme) => {
    // Mock intensity calculation
    const hash = (airline + theme).split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    return Math.abs(hash % 100)
  }

  const getColor = (intensity) => {
    if (intensity >= 70) return '#4ade80' // Green - high
    if (intensity >= 40) return '#fbbf24' // Yellow - medium
    return '#f87171' // Red - low
  }

  return (
    <div className={styles.heatmap}>
      <div className={styles.header}>
        <div className={styles.corner}></div>
        {airlines.map((airline) => (
          <div key={airline} className={styles.airlineHeader}>
            {airline}
          </div>
        ))}
      </div>
      <div className={styles.body}>
        {themes.map((theme) => (
          <div key={theme} className={styles.row}>
            <div className={styles.themeLabel}>{theme}</div>
            {airlines.map((airline) => {
              const intensity = getIntensity(airline, theme)
              return (
                <div
                  key={`${airline}-${theme}`}
                  className={styles.cell}
                  style={{
                    backgroundColor: getColor(intensity),
                    opacity: 0.3 + (intensity / 100) * 0.7,
                  }}
                  title={`${airline} - ${theme}: ${intensity}%`}
                >
                  <span className={styles.cellValue}>{intensity}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className={styles.legend}>
        <span className={styles.legendLabel}>Intensity:</span>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ background: '#f87171' }}></div>
          <span>Low</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ background: '#fbbf24' }}></div>
          <span>Medium</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ background: '#4ade80' }}></div>
          <span>High</span>
        </div>
      </div>
    </div>
  )
}


