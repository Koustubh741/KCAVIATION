'use client'

import { useState, useEffect } from 'react'
import Card from '../../components/Card'
import Heatmap from './Heatmap'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalInsights: 0,
    positiveSentiment: 0,
    activeAirlines: 0,
    avgConfidence: 0,
  })

  useEffect(() => {
    // Mock data loading
    setStats({
      totalInsights: 247,
      positiveSentiment: 68,
      activeAirlines: 12,
      avgConfidence: 0.87,
    })
  }, [])

  return (
    <div className={styles.dashboard}>
      {/* Summary Stats Cards */}
      <div className={styles.summaryCards}>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Total Insights</h3>
            <p className={styles.statValue}>{stats.totalInsights}</p>
          </div>
          <div className={styles.statTrend}>
            <span className={styles.trendUp}>↑ 14%</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Positive Sentiment</h3>
            <p className={styles.statValue}>{stats.positiveSentiment}%</p>
          </div>
          <div className={styles.statTrend}>
            <span className={styles.trendUp}>↑ 8%</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>✈️</div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Active Airlines</h3>
            <p className={styles.statValue}>{stats.activeAirlines}</p>
          </div>
          <div className={styles.statTrend}>
            <span className={styles.trendNeutral}>→ 0%</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Avg Confidence</h3>
            <p className={styles.statValue}>
              {(stats.avgConfidence * 100).toFixed(0)}%
            </p>
          </div>
          <div className={styles.statTrend}>
            <span className={styles.trendUp}>↑ 5%</span>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        <Card className={styles.trendCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Trend Overview</h2>
            <button className={styles.viewAllBtn}>View All →</button>
          </div>
          <div className={styles.trendContent}>
            <div className={styles.trendItem}>
              <span className={styles.trendLabel}>Hiring Trends</span>
              <div className={styles.trendBar}>
                <div
                  className={styles.trendFill}
                  style={{ width: '75%', background: 'linear-gradient(90deg, #4facfe, #00f2fe)' }}
                ></div>
              </div>
              <span className={styles.trendValue}>+15%</span>
            </div>
            <div className={styles.trendItem}>
              <span className={styles.trendLabel}>Expansion Activity</span>
              <div className={styles.trendBar}>
                <div
                  className={styles.trendFill}
                  style={{ width: '60%', background: 'linear-gradient(90deg, #00f2fe, #4facfe)' }}
                ></div>
              </div>
              <span className={styles.trendValue}>+8%</span>
            </div>
            <div className={styles.trendItem}>
              <span className={styles.trendLabel}>Financial Health</span>
              <div className={styles.trendBar}>
                <div
                  className={styles.trendFill}
                  style={{ width: '82%', background: 'linear-gradient(90deg, #4ade80, #22c55e)' }}
                ></div>
              </div>
              <span className={styles.trendValue}>+12%</span>
            </div>
            <div className={styles.trendItem}>
              <span className={styles.trendLabel}>Operations</span>
              <div className={styles.trendBar}>
                <div
                  className={styles.trendFill}
                  style={{ width: '68%', background: 'linear-gradient(90deg, #a78bfa, #8b5cf6)' }}
                ></div>
              </div>
              <span className={styles.trendValue}>+10%</span>
            </div>
          </div>
        </Card>

        <Card className={styles.heatmapCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Market Heatmap</h2>
            <button className={styles.viewAllBtn}>View All →</button>
          </div>
          <Heatmap />
        </Card>
      </div>

      {/* Predictive Analytics Section */}
      <Card className={styles.predictiveCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>Predictive Analytics</h2>
          <button className={styles.viewAllBtn}>View Details →</button>
        </div>
        <div className={styles.predictiveContent}>
          <div className={styles.predictionItem}>
            <div className={styles.predictionIcon}>📈</div>
            <div className={styles.predictionInfo}>
              <span className={styles.predictionLabel}>
                Expected Hiring Surge (Next 30 Days)
              </span>
              <span className={styles.predictionDesc}>Based on 247 market signals</span>
            </div>
            <span className={`${styles.predictionValue} ${styles.high}`}>High Probability</span>
          </div>
          <div className={styles.predictionItem}>
            <div className={styles.predictionIcon}>🌍</div>
            <div className={styles.predictionInfo}>
              <span className={styles.predictionLabel}>
                Route Expansion Forecast
              </span>
              <span className={styles.predictionDesc}>International routes focus</span>
            </div>
            <span className={`${styles.predictionValue} ${styles.medium}`}>Moderate Increase</span>
          </div>
          <div className={styles.predictionItem}>
            <div className={styles.predictionIcon}>💹</div>
            <div className={styles.predictionInfo}>
              <span className={styles.predictionLabel}>
                Market Sentiment Outlook
              </span>
              <span className={styles.predictionDesc}>Overall industry health</span>
            </div>
            <span className={`${styles.predictionValue} ${styles.positive}`}>Positive Trend</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
