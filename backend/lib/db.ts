import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Database file path
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Types
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'analyst' | 'manager' | 'executive' | 'admin';
  createdAt: string;
  isActive: boolean;
}

export interface Insight {
  id: string;
  userId: string;
  userName: string;
  transcription: string;
  airline: string;
  country: string;
  theme: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  score: number;
  summary: string;
  keywords: string[];
  analysis: any;
  timestamp: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  airline: string;
  country: string;
  category: 'Hiring' | 'Expansion' | 'Financial' | 'Operations' | 'Safety' | 'Training' | 'Firing';
  timestamp: string;
  relatedInsightIds: string[];
  actionRequired: boolean;
  acknowledged: boolean;
}

interface Database {
  users: User[];
  insights: Insight[];
  alerts: Alert[];
}

// Initialize database
function initDb(): Database {
  const dataDir = path.dirname(DB_PATH);
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create database file if it doesn't exist
  if (!fs.existsSync(DB_PATH)) {
    const initialData: Database = {
      users: [],
      insights: [],
      alerts: generateInitialAlerts(),
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }

  // Read existing database
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// Generate initial mock alerts
function generateInitialAlerts(): Alert[] {
  return [
    {
      id: uuidv4(),
      title: 'High Hiring Activity Detected',
      message: 'Indigo has announced a significant increase in pilot hiring for the next quarter. This indicates strong growth expectations.',
      severity: 'High',
      airline: 'Indigo',
      country: 'India',
      category: 'Hiring',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      relatedInsightIds: [],
      actionRequired: false,
      acknowledged: false,
    },
    {
      id: uuidv4(),
      title: 'Route Expansion Alert',
      message: 'Air India is planning to launch 15 new routes to Southeast Asia, indicating aggressive expansion strategy.',
      severity: 'Medium',
      airline: 'Air India',
      country: 'India',
      category: 'Expansion',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      relatedInsightIds: [],
      actionRequired: false,
      acknowledged: false,
    },
    {
      id: uuidv4(),
      title: 'Financial Performance Update',
      message: 'SpiceJet Q3 earnings exceeded market expectations by 12%, showing strong financial health.',
      severity: 'Medium',
      airline: 'SpiceJet',
      country: 'India',
      category: 'Financial',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      relatedInsightIds: [],
      actionRequired: false,
      acknowledged: false,
    },
    {
      id: uuidv4(),
      title: 'Operational Delay Warning',
      message: 'Vistara reports delays in fleet expansion due to supply chain disruptions. Expected impact on Q4 operations.',
      severity: 'Critical',
      airline: 'Vistara',
      country: 'India',
      category: 'Operations',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      relatedInsightIds: [],
      actionRequired: true,
      acknowledged: false,
    },
    {
      id: uuidv4(),
      title: 'Safety Protocol Update',
      message: 'GoAir has updated safety protocols following regulatory review. All operations remain normal.',
      severity: 'Low',
      airline: 'GoAir',
      country: 'India',
      category: 'Safety',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      relatedInsightIds: [],
      actionRequired: false,
      acknowledged: false,
    },
    {
      id: uuidv4(),
      title: 'Training Capacity Expansion',
      message: 'Multiple airlines are investing in new simulator facilities and training centers to address pilot shortage.',
      severity: 'High',
      airline: 'Market Wide',
      country: 'Global',
      category: 'Training',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      relatedInsightIds: [],
      actionRequired: false,
      acknowledged: false,
    },
  ];
}

// Save database
function saveDb(data: Database): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Read database
function readDb(): Database {
  try {
    return initDb();
  } catch (error) {
    console.error('Error reading database:', error);
    return { users: [], insights: [], alerts: [] };
  }
}

// ==================== USER OPERATIONS ====================

export function findUserByEmail(email: string): User | undefined {
  const db = readDb();
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  const db = readDb();
  return db.users.find((user) => user.id === id);
}

export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'isActive'>): User {
  const db = readDb();
  
  const newUser: User = {
    id: uuidv4(),
    ...userData,
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  
  db.users.push(newUser);
  saveDb(db);
  
  return newUser;
}

export function getAllUsers(): User[] {
  const db = readDb();
  return db.users;
}

// ==================== INSIGHT OPERATIONS ====================

export interface InsightFilters {
  airline?: string;
  theme?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  startDate?: string;
  endDate?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

export function getInsights(filters: InsightFilters = {}): { insights: Insight[]; pagination: any } {
  const db = readDb();
  let insights = [...db.insights];

  // Apply filters
  if (filters.airline) {
    insights = insights.filter((i) => i.airline.toLowerCase().includes(filters.airline!.toLowerCase()));
  }
  if (filters.theme) {
    insights = insights.filter((i) => i.theme.toLowerCase().includes(filters.theme!.toLowerCase()));
  }
  if (filters.sentiment) {
    insights = insights.filter((i) => i.sentiment === filters.sentiment);
  }
  if (filters.userId) {
    insights = insights.filter((i) => i.userId === filters.userId);
  }
  if (filters.startDate) {
    insights = insights.filter((i) => new Date(i.timestamp) >= new Date(filters.startDate!));
  }
  if (filters.endDate) {
    insights = insights.filter((i) => new Date(i.timestamp) <= new Date(filters.endDate!));
  }

  // Sort by timestamp (newest first)
  insights.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Pagination
  const total = insights.length;
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  const paginatedInsights = insights.slice(offset, offset + limit);

  return {
    insights: paginatedInsights,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
}

export function createInsight(insightData: Omit<Insight, 'id' | 'timestamp'>): Insight {
  const db = readDb();
  
  const newInsight: Insight = {
    id: uuidv4(),
    ...insightData,
    timestamp: new Date().toISOString(),
  };
  
  db.insights.push(newInsight);
  saveDb(db);
  
  // Check if alert should be generated
  checkAndGenerateAlert(newInsight, db);
  
  return newInsight;
}

export function getInsightById(id: string): Insight | undefined {
  const db = readDb();
  return db.insights.find((i) => i.id === id);
}

// ==================== ALERT OPERATIONS ====================

export interface AlertFilters {
  severity?: 'Critical' | 'High' | 'Medium' | 'Low';
  airline?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export function getAlerts(filters: AlertFilters = {}): { alerts: Alert[]; pagination: any } {
  const db = readDb();
  let alerts = [...db.alerts];

  // Apply filters
  if (filters.severity) {
    alerts = alerts.filter((a) => a.severity === filters.severity);
  }
  if (filters.airline) {
    alerts = alerts.filter((a) => a.airline.toLowerCase().includes(filters.airline!.toLowerCase()));
  }
  if (filters.category) {
    alerts = alerts.filter((a) => a.category === filters.category);
  }

  // Sort by timestamp (newest first)
  alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Pagination
  const total = alerts.length;
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;
  const paginatedAlerts = alerts.slice(offset, offset + limit);

  return {
    alerts: paginatedAlerts,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
}

export function createAlert(alertData: Omit<Alert, 'id' | 'timestamp'>): Alert {
  const db = readDb();
  
  const newAlert: Alert = {
    id: uuidv4(),
    ...alertData,
    timestamp: new Date().toISOString(),
  };
  
  db.alerts.push(newAlert);
  saveDb(db);
  
  return newAlert;
}

export function acknowledgeAlert(id: string): Alert | null {
  const db = readDb();
  const alert = db.alerts.find((a) => a.id === id);
  
  if (!alert) return null;
  
  alert.acknowledged = true;
  saveDb(db);
  
  return alert;
}

// ==================== ALERT GENERATION ====================

function checkAndGenerateAlert(insight: Insight, db: Database): void {
  const enableAlerts = process.env.ENABLE_ALERT_GENERATION !== 'false';
  if (!enableAlerts) return;

  // Generate alerts based on sentiment and theme
  let shouldCreateAlert = false;
  let severity: Alert['severity'] = 'Low';
  let title = '';
  let message = '';
  let category: Alert['category'] = 'Operations'; // Default category

  // Critical/Negative sentiment
  if (insight.sentiment === 'Negative' && insight.score < 0.4) {
    shouldCreateAlert = true;
    severity = 'High';
    title = `Negative Signal Detected: ${insight.airline}`;
    message = `A negative market signal has been detected for ${insight.airline} regarding ${insight.theme}. ${insight.summary}`;
    category = mapThemeToCategory(insight.theme);
  }

  // Strong positive signals
  if (insight.sentiment === 'Positive' && insight.score > 0.8) {
    shouldCreateAlert = true;
    severity = 'Medium';
    title = `Strong Positive Signal: ${insight.airline}`;
    message = `A strong positive market signal has been detected for ${insight.airline}. ${insight.summary}`;
    category = mapThemeToCategory(insight.theme);
  }

  // Hiring/Expansion/Firing themes - all important for alerts
  const themeLower = insight.theme.toLowerCase();
  if (themeLower.includes('hiring') || themeLower.includes('expansion') || themeLower.includes('firing')) {
    shouldCreateAlert = true;
    
    // Firing is usually negative news, so higher severity
    if (themeLower.includes('firing')) {
      severity = 'High';
      title = `Workforce Reduction Alert: ${insight.airline}`;
      message = `Layoffs or workforce reductions detected at ${insight.airline}. ${insight.summary}`;
      category = 'Firing';
    } else if (themeLower.includes('hiring')) {
      severity = insight.sentiment === 'Positive' ? 'Medium' : 'High';
      title = `${insight.theme} Activity: ${insight.airline}`;
      message = insight.summary;
      category = 'Hiring';
    } else {
      severity = insight.sentiment === 'Positive' ? 'Medium' : 'High';
      title = `${insight.theme} Activity: ${insight.airline}`;
      message = insight.summary;
      category = 'Expansion';
    }
  }

  if (shouldCreateAlert) {
    const newAlert: Alert = {
      id: uuidv4(),
      title,
      message,
      severity,
      airline: insight.airline,
      country: insight.country,
      category,
      timestamp: new Date().toISOString(),
      relatedInsightIds: [insight.id],
      actionRequired: severity === 'High',
      acknowledged: false,
    };

    db.alerts.push(newAlert);
    saveDb(db);
  }
}

function mapThemeToCategory(theme: string): Alert['category'] {
  const themeLower = theme.toLowerCase();
  if (themeLower.includes('hiring') || themeLower.includes('recruit')) return 'Hiring';
  if (themeLower.includes('firing') || themeLower.includes('layoff') || themeLower.includes('terminat') || themeLower.includes('downsiz') || themeLower.includes('phased out') || themeLower.includes('furlough') || themeLower.includes('redundanc')) return 'Firing';
  if (themeLower.includes('expansion') || themeLower.includes('fleet') || themeLower.includes('route')) return 'Expansion';
  if (themeLower.includes('financ') || themeLower.includes('revenue') || themeLower.includes('profit')) return 'Financial';
  if (themeLower.includes('operation') || themeLower.includes('delay') || themeLower.includes('maintenance')) return 'Operations';
  if (themeLower.includes('safety') || themeLower.includes('incident') || themeLower.includes('compliance')) return 'Safety';
  if (themeLower.includes('training') || themeLower.includes('simulator') || themeLower.includes('certification')) return 'Training';
  return 'Operations'; // Default to Operations
}

// ==================== DASHBOARD STATS ====================

export function getDashboardStats(userId?: string): any {
  const db = readDb();
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  let insights = db.insights;
  if (userId) {
    insights = insights.filter((i) => i.userId === userId);
  }

  const todayInsights = insights.filter((i) => new Date(i.timestamp) >= todayStart);
  const weekInsights = insights.filter((i) => new Date(i.timestamp) >= weekStart);

  // Calculate sentiment breakdown
  const sentimentCounts = {
    positive: insights.filter((i) => i.sentiment === 'Positive').length,
    neutral: insights.filter((i) => i.sentiment === 'Neutral').length,
    negative: insights.filter((i) => i.sentiment === 'Negative').length,
  };

  const total = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative || 1;
  const sentimentBreakdown = {
    positive: Math.round((sentimentCounts.positive / total) * 100),
    neutral: Math.round((sentimentCounts.neutral / total) * 100),
    negative: Math.round((sentimentCounts.negative / total) * 100),
  };

  // Top airlines by insight count
  const airlineCounts: Record<string, number> = {};
  insights.forEach((i) => {
    airlineCounts[i.airline] = (airlineCounts[i.airline] || 0) + 1;
  });
  const topAirlines = Object.entries(airlineCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top themes by count
  const themeCounts: Record<string, number> = {};
  insights.forEach((i) => {
    themeCounts[i.theme] = (themeCounts[i.theme] || 0) + 1;
  });
  const topThemes = Object.entries(themeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Unique countries
  const countries = new Set(insights.map((i) => i.country));

  // Active alerts
  const activeAlerts = db.alerts.filter((a) => !a.acknowledged);

  return {
    totalInsights: insights.length,
    activeAlerts: activeAlerts.length,
    airlinesMonitored: Object.keys(airlineCounts).length,
    countriesCovered: countries.size,
    todayInsights: todayInsights.length,
    weekInsights: weekInsights.length,
    sentimentBreakdown,
    topAirlines,
    topThemes,
    avgConfidence: insights.length > 0
      ? insights.reduce((sum, i) => sum + i.score, 0) / insights.length
      : 0,
  };
}

