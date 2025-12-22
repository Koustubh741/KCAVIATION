# AeroIntel Platform - System Design

## Executive Summary

**AeroIntel** is an AI-powered aviation intelligence platform that captures voice notes, transcribes them, performs AI analysis, and delivers actionable market insights. The platform uses OpenAI's Whisper for transcription and GPT-4 for intelligent analysis.

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Frontend)                      │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 15 (React 18) - Port 3000                              │
│  - Voice Capture UI                                              │
│  - Dashboard & Analytics                                         │
│  - Alerts Management                                             │
│  - Insights Viewer                                               │
│  - 3D Globe Visualization                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST API
                             │ (Axios Client)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY / MIDDLEWARE                      │
├─────────────────────────────────────────────────────────────────┤
│  - JWT Authentication                                            │
│  - Rate Limiting (15 min window, 100 req/limit)                 │
│  - CORS Handling                                                 │
│  - Request Validation                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND API LAYER (Next.js)                     │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 14 (TypeScript) - Port 3001                            │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐    │
│  │  Auth Routes    │  │  Core Routes    │  │ Utility Routes│   │
│  ├─────────────────┤  ├─────────────────┤  ├──────────────┤    │
│  │ /auth/login     │  │ /transcribe     │  │ /health      │    │
│  │ /auth/register  │  │ /analyze       │  │              │    │
│  │ /auth/refresh   │  │ /insights      │  │              │    │
│  │                 │  │ /alerts        │  │              │    │
│  │                 │  │ /dashboard     │  │              │    │
│  └─────────────────┘  └─────────────────┘  └──────────────┘    │
│                                                                   │
│  Libraries: bcryptjs, jsonwebtoken, openai, uuid                │
└────────────┬───────────────────────────────────────────┬────────┘
             │                                           │
             ↓                                           ↓
    ┌──────────────────┐                    ┌─────────────────────┐
    │ External APIs    │                    │  Data Persistence   │
    ├──────────────────┤                    ├─────────────────────┤
    │ OpenAI Whisper   │                    │  JSON Database      │
    │ (Transcription)  │                    │  (db.json)          │
    │                  │                    │                     │
    │ OpenAI GPT-4     │                    │  - Users            │
    │ (AI Analysis)    │                    │  - Insights         │
    │                  │                    │  - Alerts           │
    │                  │                    │  - Metadata         │
    └──────────────────┘                    └─────────────────────┘
```

---

## 2. Frontend Architecture (Port 3000)

### Tech Stack
- **Framework**: Next.js 15 with React 18
- **Language**: JSX (JavaScript)
- **3D Visualization**: Three.js + React Three Fiber
- **HTTP Client**: Axios
- **Styling**: CSS Modules

### Key Pages & Components

| Page | Purpose | Key Components |
|------|---------|---|
| `/auth` | User authentication | Login form |
| `/voice-capture` | Record & submit audio | VoiceRecorder, TranscriptionPreview, AIAnalysisResult |
| `/dashboard` | Analytics overview | Dashboard, Heatmap, Globe |
| `/insights` | View saved insights | InsightsList, search/filter UI |
| `/alerts` | Manage alerts | Alerts list, acknowledge functionality |
| `/updates` | System updates | Update feed |

### Components Structure
```
frontend/
├── components/
│   ├── Header.jsx          # Top navigation
│   ├── Navbar.jsx          # Sidebar navigation
│   ├── Card.jsx            # Reusable card wrapper
│
├── app/
│   ├── globals.css         # Global styles
│   ├── layout.jsx          # Root layout
│   │
│   ├── voice-capture/
│   │   ├── VoiceRecorder.jsx           # Audio recording UI
│   │   ├── TranscriptionPreview.jsx    # Shows transcribed text
│   │   ├── AIAnalysisResult.jsx        # Displays AI analysis
│   │   └── page.jsx                    # Main voice-capture page
│   │
│   ├── dashboard/
│   │   ├── Dashboard.jsx     # Main dashboard component
│   │   ├── Heatmap.jsx       # Airline x Theme matrix
│   │   └── page.jsx
│   │
│   ├── insights/
│   │   ├── InsightsList.jsx  # Insights display
│   │   └── page.jsx
│   │
│   ├── alerts/
│   │   └── page.jsx          # Alerts list
│   │
│   └── three/
│       └── Globe.jsx         # 3D globe visualization
```

### Data Flow (Frontend)

```
User Records Audio
    ↓
VoiceRecorder captures WebM
    ↓
Submit to /transcribe endpoint
    ↓
Display TranscriptionPreview (interim text)
    ↓
Display AIAnalysisResult (keywords, themes, sentiment)
    ↓
Store insight in database
    ↓
Update Dashboard & InsightsList
```

---

## 3. Backend Architecture (Port 3001)

### Tech Stack
- **Framework**: Next.js 14 with TypeScript
- **Authentication**: JWT + bcryptjs
- **AI Services**: OpenAI (Whisper + GPT-4)
- **Database**: JSON file (db.json)
- **ID Generation**: UUID

### Core Services

#### 3.1 Authentication Service (`lib/auth.ts`)
```typescript
Functions:
- getAuthUser(request) → Extracts & verifies JWT token
- hashPassword(password) → bcryptjs hashing
- verifyPassword(password, hash) → Validation
- generateToken(userId, email, role) → JWT creation
```

**JWT Structure**:
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "analyst|manager|executive|admin",
  "iat": timestamp,
  "exp": timestamp + 7 days
}
```

#### 3.2 Database Service (`lib/db.ts`)
**In-Memory JSON Storage** (Production should migrate to PostgreSQL/MongoDB)

```typescript
Data Models:
- User: id, email, passwordHash, name, role, createdAt, isActive
- Insight: id, userId, transcription, airline, country, theme, 
           sentiment, score, summary, keywords, analysis, timestamp
- Alert: id, title, message, severity, airline, theme, 
         status, createdAt, acknowledgedAt
- Metadata: theme categories, sentiment types, airline list
```

#### 3.3 AI Processing Pipeline

```
1. Audio Upload (FormData with audio/webm file)
   ↓
2. Whisper Transcription (OpenAI API)
   Input: Audio file
   Output: Text transcript
   ↓
3. GPT-4 Analysis (OpenAI API)
   Input: Transcription + system prompt
   Output: {
     theme: enum [Hiring, Expansion, Financial, Operations, Safety, Training],
     sentiment: enum [Positive, Neutral, Negative],
     score: 0-100 (confidence),
     summary: string,
     keywords: string[],
     signals: [{ signal, confidence, airline }]
   }
   ↓
4. Alert Generation
   If score >= threshold → Create Alert
   Severity determined by theme + signal type
   ↓
5. Store Insight to Database
   ↓
6. Return to Frontend
```

#### 3.4 Rate Limiting

```typescript
- Window: 15 minutes (configurable via RATE_LIMIT_WINDOW_MS)
- Limit: 100 requests per IP (configurable via RATE_LIMIT_MAX_REQUESTS)
- Storage: In-memory Map (production: Redis)
- Reset: Automatic after window expires
```

---

## 4. API Endpoints

### Authentication
```
POST   /api/auth/login
       Body: { email, password }
       Response: { success, token, user, exp }

POST   /api/auth/register
       Body: { email, password, name }
       Response: { success, userId, token }

POST   /api/auth/refresh
       Header: Authorization: Bearer {token}
       Response: { token, exp }
```

### Voice Intelligence
```
POST   /api/transcribe
       Body: FormData { audio: File }
       Header: Authorization: Bearer {token}
       Response: { 
         transcription: string,
         analysis: { theme, sentiment, score, keywords },
         insightId: string
       }

GET    /api/insights
       Header: Authorization: Bearer {token}
       Query: ?airline=&theme=&sentiment=&limit=
       Response: { insights: Insight[], total: number }

GET    /api/insights/[id]
       Header: Authorization: Bearer {token}
       Response: { insight: Insight }

POST   /api/analyze
       Body: { text, airline?, country? }
       Header: Authorization: Bearer {token}
       Response: { analysis result }
```

### Alerts
```
GET    /api/alerts
       Header: Authorization: Bearer {token}
       Response: { alerts: Alert[] }

POST   /api/alerts/[id]/acknowledge
       Header: Authorization: Bearer {token}
       Response: { success: boolean }
```

### Dashboard
```
GET    /api/dashboard/stats
       Header: Authorization: Bearer {token}
       Response: {
         totalInsights: number,
         insightsByTheme: {},
         insightsByAirline: {},
         alertCount: number,
         activeUsers: number
       }
```

### System
```
GET    /api/health
       Response: { status: "ok", timestamp }
```

---

## 5. Data Model & Database Schema

### Database File: `backend/data/db.json`

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "analyst@company.com",
      "passwordHash": "bcrypt_hash",
      "name": "John Analyst",
      "role": "analyst",
      "createdAt": "2025-01-01T00:00:00Z",
      "isActive": true
    }
  ],
  
  "insights": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "John Analyst",
      "transcription": "We heard that United is hiring pilots...",
      "airline": "United Airlines",
      "country": "USA",
      "theme": "Hiring",
      "sentiment": "Positive",
      "score": 92,
      "summary": "United Airlines expanding workforce",
      "keywords": ["hiring", "pilots", "expansion"],
      "analysis": { /* GPT-4 analysis object */ },
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ],
  
  "alerts": [
    {
      "id": "uuid",
      "title": "Major Hiring Signal - United",
      "message": "United Airlines hiring pilots indicates market expansion",
      "severity": "High",
      "airline": "United Airlines",
      "theme": "Hiring",
      "status": "unacknowledged",
      "createdAt": "2025-01-15T10:30:00Z",
      "acknowledgedAt": null
    }
  ],
  
  "metadata": {
    "themes": [
      { "name": "Hiring", "icon": "👥", "color": "#FF6B6B" },
      { "name": "Expansion", "icon": "🚀", "color": "#4ECDC4" },
      { "name": "Financial", "icon": "💰", "color": "#FFD93D" },
      { "name": "Operations", "icon": "⚙️", "color": "#6C5CE7" },
      { "name": "Safety", "icon": "🛡️", "color": "#A29BFE" },
      { "name": "Training", "icon": "📚", "color": "#74B9FF" }
    ],
    "airlines": ["United", "American", "Delta", "Southwest", ...],
    "countries": ["USA", "UK", "Canada", ...]
  }
}
```

---

## 6. Authentication & Security

### JWT Token Flow

```
1. User Credentials → /auth/login
   ↓
2. Verify Email + Password Hash (bcryptjs)
   ↓
3. Generate JWT with payload:
   {
     userId: uuid,
     email: user.email,
     role: user.role,
     iat: now,
     exp: now + 7 days
   }
   ↓
4. Return token to client
   ↓
5. Client stores in sessionStorage/localStorage
   ↓
6. Include in Authorization header:
   "Authorization: Bearer {token}"
   ↓
7. Backend verifies token on each API call
   ↓
8. On expiry → /auth/refresh generates new token
```

### Security Measures

| Layer | Measure |
|-------|---------|
| **Authentication** | JWT with 7-day expiration |
| **Passwords** | bcryptjs hashing (salt rounds: 10) |
| **API** | Authentication middleware required |
| **CORS** | Configured for frontend domain |
| **Rate Limiting** | 100 requests per 15 minutes per IP |
| **Input Validation** | Audio format, file size, text length |

---

## 7. AI Processing Pipeline Details

### Whisper Transcription
```
Input: Audio file (WebM, MP3, WAV, M4A, OGG)
API: OpenAI Whisper (whisper-1 model)
Output: 
{
  text: "We heard that United is hiring...",
  language: "en"
}
Cost: ~$0.02 per minute of audio
```

### GPT-4 Analysis
```
System Prompt:
"You are an aviation intelligence analyst. Analyze the 
provided text and extract: theme, sentiment, keywords, 
and business signals."

User Input: [Transcription]

Output:
{
  theme: "Hiring" (enum),
  sentiment: "Positive" (enum),
  confidence_score: 92,
  summary: "Brief executive summary",
  keywords: ["hiring", "pilots", "expansion"],
  business_signals: [
    {
      signal: "Workforce expansion",
      airline: "United Airlines",
      confidence: 95,
      implications: "..."
    }
  ]
}
Cost: ~$0.03 per request
```

### Alert Trigger Logic
```
If insight.confidence_score >= 80 AND insight.theme in [Hiring, Expansion, Financial]:
  Create Alert with:
  - severity: "High" if theme in [Hiring, Expansion]
            else "Medium"
  - title: "{airline} detected {theme} signal"
  - message: insight.summary
```

---

## 8. Key Features & User Flows

### Feature 1: Voice Capture to Insight

```
1. User clicks "Record"
   ↓
2. Browser requests microphone access
   ↓
3. MediaRecorder captures WebM stream
   ↓
4. User speaks intelligence notes
   ↓
5. User clicks "Stop"
   ↓
6. Audio sent to /api/transcribe
   ↓
7. Whisper returns transcription
   ↓
8. GPT-4 analyzes transcription
   ↓
9. Database stores insight
   ↓
10. Frontend displays analysis (themes, keywords, sentiment)
   ↓
11. If alert-worthy → Alert created
```

### Feature 2: Dashboard Analytics

```
Dashboard displays:
- Total insights (count)
- Insights by theme (bar/pie chart)
- Insights by airline (bar chart)
- Sentiment distribution
- Recent alerts
- 3D globe with airline markers
- Heatmap: Airline x Theme matrix
```

### Feature 3: Alert Management

```
1. Alerts auto-generated on high-confidence insights
   ↓
2. Display in /api/alerts
   ↓
3. User can acknowledge alert
   ↓
4. Updates alert.status = "acknowledged"
   ↓
5. Acknowledged alerts don't reappear
```

---

## 9. Deployment Architecture

### Development Environment
```
Backend:   npm run dev → Next.js Dev Server (Port 3001)
Frontend:  npm run dev → Next.js Dev Server (Port 3000)
Database:  data/db.json (local file)
API Keys:  .env file (local)
```

### Production Environment (Recommended)
```
Frontend:
- Next.js Static Export or Vercel
- CDN for static assets
- Environment: Node.js 20+

Backend:
- Next.js running on Node.js
- Database: PostgreSQL/MongoDB (migrate from JSON)
- Cache: Redis (for rate limiting, session store)
- API Keys: Environment variables (AWS Secrets Manager)
- Monitoring: Logging service (Datadog, New Relic)

Infrastructure:
- Docker containers for services
- Kubernetes for orchestration
- Load balancer (nginx, HAProxy)
- SSL/TLS certificates (Let's Encrypt)
```

---

## 10. Environment Configuration

### Backend `.env` Requirements
```
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000

# Database (optional for production)
DATABASE_URL=postgresql://user:password@localhost:5432/aerointel
```

### Frontend `.env.local` Requirements
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 11. Scaling Considerations

### Current Limitations
- **Database**: JSON file not suitable for >1000 concurrent users
- **Rate Limiting**: In-memory storage doesn't scale across servers
- **API Calls**: Sequential OpenAI calls create bottleneck
- **File Storage**: Audio files not persisted; re-uploaded each time

### Scalability Improvements

| Component | Current | Scalable Solution |
|-----------|---------|---|
| **Database** | JSON file | PostgreSQL + Redis cache |
| **File Storage** | Memory/Temp | S3/Cloud Storage |
| **Rate Limiting** | In-memory | Redis store |
| **AI Processing** | Sequential | Queue (Bull, RabbitMQ) |
| **Deployment** | Single server | Kubernetes cluster |
| **Logging** | Console | ELK Stack / Datadog |
| **Caching** | None | Redis multi-tier |

### Performance Optimization
```
1. Add database indexing (userId, airline, theme)
2. Implement pagination (insights endpoint)
3. Cache frequently accessed data (metadata, user preferences)
4. Use background jobs for AI analysis (avoid request timeout)
5. Compress audio before sending
6. Implement request deduplication
7. Add CDN for frontend assets
```

---

## 12. Error Handling & Monitoring

### Error Scenarios

| Error | Status | Action |
|-------|--------|--------|
| Missing Auth Token | 401 | Return "Unauthorized" |
| Invalid Token | 401 | Clear token, redirect to login |
| Rate Limit Exceeded | 429 | Return retry-after header |
| Invalid Audio Format | 400 | Reject with supported formats |
| OpenAI API Down | 503 | Return service unavailable |
| Database Error | 500 | Log error, return generic message |
| Network Timeout | 504 | Retry with exponential backoff |

### Monitoring Metrics
- API response times
- Error rates by endpoint
- OpenAI API usage & costs
- Database query times
- User authentication success rate
- Alert trigger frequency
- Storage space usage

---

## 13. Technology Rationale

| Technology | Why Chosen |
|-----------|-----------|
| **Next.js** | Full-stack framework, API routes, SSR/CSR flexibility |
| **TypeScript (Backend)** | Type safety, early error detection |
| **React** | Component-based UI, ecosystem |
| **Three.js** | 3D visualization capabilities |
| **OpenAI API** | State-of-art speech-to-text & analysis |
| **JWT** | Stateless auth, scalable authentication |
| **bcryptjs** | Secure password hashing |
| **JSON Database** | Quick prototyping (needs migration) |

---

## 14. Development Roadmap

### Phase 1 (Current)
- ✅ Voice capture
- ✅ Transcription
- ✅ AI analysis
- ✅ Alert generation
- ✅ Dashboard

### Phase 2 (Next)
- [ ] Database migration (PostgreSQL)
- [ ] User roles & permissions
- [ ] Advanced filtering
- [ ] Export insights (PDF, CSV)
- [ ] Email notifications

### Phase 3 (Future)
- [ ] Multi-user collaboration
- [ ] Custom themes
- [ ] Sentiment trend analysis
- [ ] Competitive intelligence
- [ ] Mobile app
- [ ] Real-time WebSocket updates
- [ ] Advanced ML models

---

## 15. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized on API calls | Check token validity, ensure Bearer prefix |
| 503 Transcription failed | Verify OPENAI_API_KEY, check API quota |
| Audio not recording | Check browser permissions, ensure HTTPS in prod |
| Database errors | Verify db.json exists & is valid JSON |
| Rate limit exceeded | Wait 15 minutes or increase RATE_LIMIT_MAX_REQUESTS |
| Frontend can't reach backend | Check CORS settings, ensure backend running on 3001 |

---

## Summary

AeroIntel is a **modern full-stack AI application** combining:
- **Frontend**: React/Next.js for intuitive user interface
- **Backend**: Next.js TypeScript API with OpenAI integration
- **Intelligence**: GPT-4 & Whisper for advanced analysis
- **Database**: JSON-based (prototype stage, migrate for production)
- **Security**: JWT authentication + rate limiting
- **Scalability**: Designed for containerization & cloud deployment

The platform transforms aviation market observations into actionable intelligence through voice capture and AI analysis.
