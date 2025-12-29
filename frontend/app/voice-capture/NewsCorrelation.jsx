'use client'
import { useState } from 'react'
import Card from '../../components/Card'
import styles from './NewsCorrelation.module.css'

export default function NewsCorrelation({ correlation }) {
  if (!correlation) {
    return null
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return '#4ade80'
      case 'partial': return '#fbbf24'
      case 'unverified': return '#f87171'
      default: return '#94a3b8'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return '✅'
      case 'partial': return '⚠️'
      case 'unverified': return '❌'
      default: return '❓'
    }
  }

  const matchedArticles = correlation.matchedArticles || []
  const supportingReferences = correlation.supportingReferences || []

  if (matchedArticles.length === 0 && supportingReferences.length === 0) {
    return (
      <Card className={styles.correlationCard}>
        <div className={styles.correlationHeader}>
          <h3>
            <span>📰</span> News Correlation
          </h3>
          <div className={styles.statusBadge} style={{ 
            backgroundColor: getStatusColor(correlation.verificationStatus) + '20',
            color: getStatusColor(correlation.verificationStatus)
          }}>
            {getStatusIcon(correlation.verificationStatus)} {correlation.verificationStatus?.toUpperCase() || 'UNVERIFIED'}
          </div>
        </div>
        <div className={styles.noArticles}>
          <p>No matching news articles found to verify this intelligence.</p>
          <span className={styles.hint}>This may indicate new/unreported information or requires manual verification.</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className={styles.correlationCard}>
      <div className={styles.correlationHeader}>
        <h3>
          <span>📰</span> News Correlation
        </h3>
        <div className={styles.statusBadge} style={{ 
          backgroundColor: getStatusColor(correlation.verificationStatus) + '20',
          color: getStatusColor(correlation.verificationStatus)
        }}>
          {getStatusIcon(correlation.verificationStatus)} {correlation.verificationStatus?.toUpperCase() || 'UNVERIFIED'}
        </div>
      </div>
      
      <div className={styles.correlationScore}>
        <span>Correlation Score: </span>
        <strong style={{ color: getStatusColor(correlation.verificationStatus) }}>
          {(correlation.correlationScore * 100).toFixed(0)}%
        </strong>
      </div>

      <div className={styles.articlesList}>
        <h4>Supporting References:</h4>
        {supportingReferences.map((article, index) => (
          <div key={index} className={styles.articleItem}>
            <div className={styles.articleHeader}>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.articleTitle}
              >
                {article.title || 'Untitled Article'}
              </a>
              <span className={styles.relevanceScore}>
                {(article.relevanceScore * 100).toFixed(0)}% match
              </span>
            </div>
            <div className={styles.articleMeta}>
              <span>{article.source || 'Unknown Source'}</span>
              {article.publishedAt && (
                <>
                  <span>•</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

