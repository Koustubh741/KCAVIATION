# 🛩️ AeroIntel Backend API

> AI-Powered Aviation Intelligence Backend for AeroIntel Frontend Platform

This is the backend API service that powers the AeroIntel Aviation Intelligence Platform. It provides voice transcription, AI analysis, alert generation, and insights management capabilities.

---

## 📑 Table of Contents

- [Quick Start](#-quick-start)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Environment Configuration](#-environment-configuration)
- [Frontend Integration](#-frontend-integration)
- [Authentication](#-authentication)
- [Database](#-database)
- [Deployment](#-deployment)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- OpenAI API Key (for transcription and analysis)

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
# Copy env.example.txt to .env.local and fill in your values
cp env.example.txt .env.local

# Edit .env.local and add your OpenAI API key
# OPENAI_API_KEY=sk-your-key-here
# JWT_SECRET=your-secure-secret-here

# Run development server
npm run dev
```

The backend will start at `http://localhost:3001`

### Testing

```bash
# Health check
curl http://localhost:3001/api/health

# Register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"analyst"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | API framework |
| TypeScript | 5.x | Type safety |
| OpenAI API | 4.x | Whisper + GPT-4 |
| jsonwebtoken | 9.x | JWT authentication |
| bcryptjs | 2.x | Password hashing |
| uuid | 9.x | ID generation |

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # POST /api/auth/login
│   │   │   ├── register/route.ts   # POST /api/auth/register
│   │   │   └── refresh/route.ts    # POST /api/auth/refresh
│   │   ├── transcribe/route.ts     # POST /api/transcribe
│   │   ├── analyze/route.ts        # POST /api/analyze
│   │   ├── insights/
│   │   │   ├── route.ts            # GET/POST /api/insights
│   │   │   └── [id]/route.ts       # GET /api/insights/:id
│   │   ├── alerts/
│   │   │   ├── route.ts            # GET/POST /api/alerts
│   │   │   └── [id]/acknowledge/route.ts
│   │   ├── dashboard/
│   │   │   └── stats/route.ts      # GET /api/dashboard/stats
│   │   └── health/route.ts         # GET /api/health
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth.ts           # Auth utilities
│   ├── db.ts             # Database operations
│   ├── jwt.ts            # JWT utilities
│   └── password.ts       # Password hashing
├── data/
│   └── db.json           # JSON database (auto-created)
├── middleware.ts         # Rate limiting & CORS
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## 📡 API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user.

```json
// Request
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "analyst"
}

// Response
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "analyst"
  },
  "token": "jwt_token"
}
```

#### POST `/api/auth/login`
Login existing user.

```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "user": { ... },
  "token": "jwt_token"
}
```

#### POST `/api/auth/refresh`
Refresh JWT token.

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Voice Processing

#### POST `/api/transcribe`
Transcribe audio to text using OpenAI Whisper.

```bash
curl -X POST http://localhost:3001/api/transcribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@recording.webm"
```

**Response:**
```json
{
  "success": true,
  "transcription": "Transcribed text here...",
  "metadata": {
    "duration": 15.3,
    "language": "en",
    "confidence": 0.95
  }
}
```

#### POST `/api/analyze`
Perform AI analysis on transcription.

```json
// Request
{
  "transcription": "Indigo airlines expanding fleet by 20%",
  "context": {
    "airline": "Indigo",
    "country": "India"
  }
}

// Response
{
  "success": true,
  "analysis": {
    "summary": "AI summary...",
    "keywords": ["expansion", "fleet"],
    "themes": ["Fleet Management"],
    "sentiment": {
      "overall": "Positive",
      "score": 0.82,
      "breakdown": { "positive": 75, "neutral": 20, "negative": 5 }
    },
    "marketSignals": [...],
    "airlineSpecifications": [...],
    "predictiveProbabilities": [...],
    "confidenceScore": 0.85,
    "timestamp": "2025-12-19T10:30:00.000Z"
  }
}
```

---

### Insights

#### GET `/api/insights`
Get filtered insights.

**Query Parameters:**
- `airline` - Filter by airline name
- `theme` - Filter by theme
- `sentiment` - Filter by sentiment (Positive/Neutral/Negative)
- `startDate` - Filter by start date (ISO 8601)
- `endDate` - Filter by end date (ISO 8601)
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

```bash
curl "http://localhost:3001/api/insights?airline=Indigo&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST `/api/insights`
Create a new insight.

---

### Alerts

#### GET `/api/alerts`
Get filtered alerts.

**Query Parameters:**
- `severity` - Critical/High/Medium/Low
- `airline` - Filter by airline
- `category` - Hiring/Expansion/Financial/Operations/Safety/Sentiment
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset

```bash
curl "http://localhost:3001/api/alerts?severity=High" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST `/api/alerts/[id]/acknowledge`
Acknowledge an alert.

---

### Dashboard

#### GET `/api/dashboard/stats`
Get dashboard statistics.

```json
// Response
{
  "success": true,
  "stats": {
    "totalInsights": 150,
    "activeAlerts": 5,
    "airlinesMonitored": 12,
    "countriesCovered": 8,
    "todayInsights": 5,
    "weekInsights": 35,
    "sentimentBreakdown": {
      "positive": 62,
      "neutral": 28,
      "negative": 10
    },
    "topAirlines": [...],
    "topThemes": [...],
    "avgConfidence": 0.85
  }
}
```

---

## ⚙️ Environment Configuration

Create `.env.local` file:

```env
# Required
OPENAI_API_KEY=sk-your-openai-api-key
JWT_SECRET=your-secure-jwt-secret-minimum-32-chars

# Optional
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_ALERT_GENERATION=true
```

---

## 🔗 Frontend Integration

### Step 1: Update Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 2: Create API Client

Create `frontend/lib/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 3: Update Auth Page

```javascript
import api from '@/lib/api';

const handleLogin = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
};
```

### Step 4: Update Voice Recorder

```javascript
import api from '@/lib/api';

const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  
  const response = await api.post('/api/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response.data;
};

const analyzeTranscription = async (transcription, context) => {
  const response = await api.post('/api/analyze', {
    transcription,
    context,
  });
  
  return response.data.analysis;
};
```

---

## 🔐 Authentication

### JWT Token Structure

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "analyst",
  "iat": 1703000000,
  "exp": 1703604800
}
```

### Token Expiration

- Tokens expire after 7 days
- Use `/api/auth/refresh` to get a new token

### Role-Based Access

| Role | Permissions |
|------|-------------|
| `analyst` | Own insights, view alerts |
| `manager` | All insights, manage alerts |
| `executive` | All insights, dashboard |
| `admin` | Full access |

---

## 💾 Database

### Current: JSON File

Data is stored in `data/db.json`. The file is auto-created on first run.

### Schema

```json
{
  "users": [...],
  "insights": [...],
  "alerts": [...]
}
```

### Migration to PostgreSQL

For production, migrate to PostgreSQL:

1. Install pg: `npm install pg`
2. Update `lib/db.ts` to use PostgreSQL
3. Run migrations

---

## 🚀 Deployment

### Vercel

```bash
npm i -g vercel
vercel
vercel env add OPENAI_API_KEY
vercel env add JWT_SECRET
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

```bash
docker build -t aerointel-backend .
docker run -p 3001:3001 \
  -e OPENAI_API_KEY=your-key \
  -e JWT_SECRET=your-secret \
  aerointel-backend
```

### PM2

```bash
npm run build
pm2 start npm --name "aerointel-api" -- start
```

---

## 📋 Checklist

### Before Production

- [ ] Set strong JWT_SECRET
- [ ] Configure ALLOWED_ORIGINS
- [ ] Set up proper database (PostgreSQL recommended)
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure rate limiting
- [ ] Set up backup strategy

---

## 🐛 Troubleshooting

### CORS Errors

Ensure `ALLOWED_ORIGINS` includes your frontend URL:

```env
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.com
```

### OpenAI Errors

- Verify `OPENAI_API_KEY` is valid
- Check API quota and billing
- Ensure model access (whisper-1, gpt-4o-mini)

### Token Errors

- Check token expiration
- Verify JWT_SECRET matches between requests
- Clear localStorage and re-login

---

**Built with ❤️ for Aviation Intelligence**

