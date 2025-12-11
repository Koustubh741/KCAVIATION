import Link from 'next/link'
import Card from '../components/Card'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.greeting}>
        <div>
          <h1 className={styles.greetingTitle}>Hello, User</h1>
          <p className={styles.greetingSubtitle}>
            View and control your market intelligence here!
          </p>
        </div>
        <div className={styles.userAvatars}>
          <div className={styles.avatar}>A</div>
          <div className={styles.avatar}>I</div>
          <div className={styles.avatar}>M</div>
        </div>
      </div>

      <div className={styles.cardsGrid}>
        <Card className={styles.balanceCard}>
          <h3 className={styles.cardTitle}>Market Statistics</h3>
          <div className={styles.balanceAmount}>
            <span className={styles.amount}>247</span>
            <span className={styles.amountLabel}>Total Insights</span>
          </div>
          <div className={styles.trend}>
            <span className={styles.trendIcon}>↑</span>
            <span className={styles.trendValue}>14%</span>
          </div>
          <p className={styles.balanceNote}>Always see your insights updates</p>
          <div className={styles.chart}>
            <div className={styles.bar} style={{ height: '40%' }}></div>
            <div className={styles.bar} style={{ height: '60%' }}></div>
            <div className={styles.bar} style={{ height: '80%' }}></div>
            <div className={styles.bar} style={{ height: '100%' }}></div>
            <div className={styles.bar} style={{ height: '90%' }}></div>
          </div>
        </Card>

        <Card className={styles.creditCard}>
          <h3 className={styles.cardTitle}>Recent Activity</h3>
          <div className={styles.cardVisual}>
            <div className={styles.cardChip}>💳</div>
            <div className={styles.cardInfo}>
              <div className={styles.cardNumber}>.... 2734</div>
              <div className={styles.cardName}>Market Intelligence</div>
            </div>
          </div>
        </Card>

        <Card className={styles.analyticsCard}>
          <h3 className={styles.cardTitle}>Analytics</h3>
          <div className={styles.analyticsList}>
            <div className={styles.analyticsItem}>
              <span className={styles.bullet} style={{ color: '#4facfe' }}>•</span>
              <span>Done</span>
            </div>
            <div className={styles.analyticsItem}>
              <span className={styles.bullet} style={{ color: '#fbbf24' }}>•</span>
              <span>In progress</span>
            </div>
            <div className={styles.analyticsItem}>
              <span className={styles.bullet} style={{ color: '#f87171' }}>•</span>
              <span>To do</span>
            </div>
          </div>
          <div className={styles.donutChart}>
            <div className={styles.donutSegment} style={{ '--percentage': '90%', '--color': '#4facfe' }}></div>
            <div className={styles.donutCenter}>
              <span className={styles.donutPercentage}>90%</span>
              <span className={styles.donutLabel}>Done</span>
            </div>
          </div>
        </Card>

        <Card className={styles.transactionsCard}>
          <h3 className={styles.cardTitle}>Last Transactions</h3>
          <div className={styles.transactionsList}>
            <div className={styles.transaction}>
              <div className={styles.transactionIcon}>✈️</div>
              <div className={styles.transactionInfo}>
                <div className={styles.transactionName}>Indigo</div>
                <div className={styles.transactionDate}>03 April, 2024</div>
              </div>
              <div className={styles.transactionAmount}>$653</div>
            </div>
            <div className={styles.transaction}>
              <div className={styles.transactionIcon}>🛫</div>
              <div className={styles.transactionInfo}>
                <div className={styles.transactionName}>Air India</div>
                <div className={styles.transactionDate}>01 April, 2024</div>
              </div>
              <div className={styles.transactionAmount}>$2,643</div>
            </div>
            <div className={styles.transaction}>
              <div className={styles.transactionIcon}>✈️</div>
              <div className={styles.transactionInfo}>
                <div className={styles.transactionName}>SpiceJet</div>
                <div className={styles.transactionDate}>27 March, 2024</div>
              </div>
              <div className={styles.transactionAmount}>$20</div>
            </div>
          </div>
        </Card>

        <Card className={styles.expensesCard}>
          <h3 className={styles.cardTitle}>Insights & Alerts</h3>
          <div className={styles.expenseItem}>
            <span className={styles.expenseLabel}>60% Insights</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '60%', background: '#4facfe' }}></div>
            </div>
          </div>
          <div className={styles.expenseItem}>
            <span className={styles.expenseLabel}>40% Alerts</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '40%', background: '#fbbf24' }}></div>
            </div>
          </div>
        </Card>

        <Card className={styles.premiumCard}>
          <div className={styles.premiumIcon}>💎</div>
          <h3 className={styles.premiumTitle}>More features?</h3>
          <p className={styles.premiumText}>
            Update your account to premium to get more features
          </p>
          <Link href="/dashboard" className={styles.premiumButton}>
            Go to premium
          </Link>
        </Card>
      </div>
    </div>
  )
}

