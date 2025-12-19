'use client'

import { useState } from 'react'
import styles from './page.module.css'
import Card from '../../components/Card'

export default function UpdatesPage() {
    const [activeTab, setActiveTab] = useState('news')

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Market Updates</h1>
                <p className={styles.subtitle}>Latest news and market correlations</p>
            </header>

            <div className={styles.tabContainer}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'news' ? styles.active : ''}`}
                    onClick={() => setActiveTab('news')}
                >
                    <span>📰</span> Top News
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'correlation' ? styles.active : ''}`}
                    onClick={() => setActiveTab('correlation')}
                >
                    <span>🔗</span> Correlation
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'news' ? (
                    <div className={styles.newsGrid}>
                        <Card className={styles.newsCard}>
                            <h3>Industry Hiring Surge</h3>
                            <p>Major airlines are increasing pilot recruitment drives across Asia-Pacific.</p>
                            <span className={styles.date}>2 hours ago</span>
                        </Card>
                        <Card className={styles.newsCard}>
                            <h3>Fuel Price Updates</h3>
                            <p>Global aviation fuel prices show a slight decline, impacting operational costs positively.</p>
                            <span className={styles.date}>5 hours ago</span>
                        </Card>
                        <Card className={styles.newsCard}>
                            <h3>New Regulatory Compliance</h3>
                            <p>DGCA announces new safety protocols for international carriers.</p>
                            <span className={styles.date}>1 day ago</span>
                        </Card>
                    </div>
                ) : (
                    <div className={styles.correlationView}>
                        <Card className={styles.correlationCard}>
                            <h3>Market Correlation Analysis</h3>
                            <div className={styles.correlationContent}>
                                <p>Analyzing correlation between hiring trends and expansion announcements.</p>
                                {/* Placeholder for correlation visualization */}
                                <div className={styles.placeholderChart}>Correlation Chart Placeholder</div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
