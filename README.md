# ✈️ AeroIntel - Aviation Intelligence Platform

<div align="center">

![AeroIntel Logo](https://img.shields.io/badge/AeroIntel-Aviation%20Intelligence-4ade80?style=for-the-badge&logo=airplane&logoColor=white)

**AI-Powered Voice Intelligence Platform for Aviation Market Analysis**

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Whisper%20%2B%20GPT--4-412991?style=flat-square&logo=openai)](https://openai.com/)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API Reference](#-api-reference) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Frontend Documentation](#-frontend-documentation)
- [Backend Documentation](#-backend-documentation)
- [API Reference](#-api-reference)
- [Data Models](#-data-models)
- [Authentication](#-authentication)
- [AI Processing Pipeline](#-ai-processing-pipeline)
- [Fixed Themes & Categories](#-fixed-themes--categories)
- [Environment Configuration](#-environment-configuration)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🎯 Overview

**AeroIntel** is a comprehensive aviation market intelligence platform that transforms voice recordings into actionable business insights using AI. The platform is designed for aviation professionals, analysts, and executives who need real-time market intelligence.

### What It Does

1. **Voice Capture** → Record audio notes about market observations
2. **AI Transcription** → Convert speech to text using OpenAI Whisper
3. **Intelligence Analysis** → Extract insights, themes, and signals using GPT-4
4. **Keyword Highlighting** → Visual emphasis on important terms
5. **Alert Generation** → Automatic alerts based on detected patterns
6. **Dashboard Analytics** → Visualize trends and patterns

### Use Cases

- 📞 Post-meeting intelligence capture
- 🛫 Airport observation logging
- 📊 Competitor analysis documentation
- 🎯 Market trend tracking
- 👥 Hiring/expansion signal detection

---

## ✨ Features

### Core Features

| Feature | Description |
|---------|-------------|
| 🎤 **Voice Recording** | Browser-based audio capture with WebM format |
| 🔊 **AI Transcription** | OpenAI Whisper for accurate speech-to-text |
| 🤖 **AI Analysis** | GPT-4 powered market intelligence extraction |
| 🔍 **Keyword Highlighting** | Visual emphasis on extracted keywords |
| 📊 **Theme Classification** | Auto-categorization into 6 fixed themes |
| 📈 **Sentiment Analysis** | Positive/Neutral/Negative with confidence scores |
| 🚨 **Alert System** | Automatic alerts based on detected patterns |
| 📋 **Insights Dashboard** | Filterable history with search capabilities |
| 🗺️ **Market Heatmaps** | Visual airline x theme intensity matrix |
| 🔐 **JWT Authentication** | Secure token-based authentication |
| 👥 **Role-Based Access** | Analyst, Manager, Executive, Admin roles |

### Fixed Themes

| Theme | Icon | Description |
|-------|------|-------------|
| **Hiring** | 👥 | Recruitment, firing, layoffs, workforce changes |
| **Expansion** | 🚀 | Fleet growth, new routes, market expansion |
| **Financial** | 💰 | Revenue, profits, losses, investments, costs |
| **Operations** | ⚙️ | Daily ops, delays, maintenance, scheduling |
| **Safety** | 🛡️ | Safety incidents, protocols, compliance, audits |
| **Training** | 📚 | Pilot/crew training, simulators, certifications |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | React framework with App Router |
| React | 18.x | UI component library |
| React Three Fiber | 8.x | 3D globe visualization |
| Three.js | 0.169.x | 3D graphics engine |
| Axios | 1.7.x | HTTP client |
| clsx | 2.x | Conditional CSS classes |
| CSS Modules | - | Scoped component styling |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | API framework with Route Handlers |
| TypeScript | 5.x | Type-safe JavaScript |
| OpenAI SDK | 4.x | Whisper + GPT-4 integration |
| jsonwebtoken | 9.x | JWT authentication |
| bcryptjs | 2.x | Password hashing |
| uuid | 9.x | Unique ID generation |

### External Services

| Service | Purpose |
|---------|---------|
| OpenAI Whisper | Audio transcription |
| OpenAI GPT-4o-mini | AI analysis and insight extraction |

---

## 📁 Project Structure

```
KCAVIATION/
├── frontend/                           # Next.js 15 Frontend Application
│   ├── app/                           # App Router pages
│   │   ├── auth/                      # Login/Register page
│   │   │   ├── page.jsx
│   │   │   └── page.module.css
│   │   ├── dashboard/                 # Analytics dashboard
│   │   │   ├── page.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Dashboard.module.css
│   │   │   ├── Heatmap.jsx
│   │   │   └── Heatmap.module.css
│   │   ├── voice-capture/             # Voice recording & AI analysis
│   │   │   ├── page.jsx               # Main voice capture page
│   │   │   ├── page.module.css
│   │   │   ├── VoiceRecorder.jsx      # Audio recording component
│   │   │   ├── VoiceRecorder.module.css
│   │   │   ├── AIAnalysisResult.jsx   # Analysis display
│   │   │   ├── AIAnalysisResult.module.css
│   │   │   ├── TranscriptionPreview.jsx
│   │   │   └── TranscriptionPreview.module.css
│   │   ├── insights/                  # Intelligence dashboard
│   │   │   ├── page.jsx
│   │   │   ├── page.module.css
│   │   │   ├── InsightsList.jsx
│   │   │   └── InsightsList.module.css
│   │   ├── alerts/                    # Real-time alerts
│   │   │   ├── page.jsx
│   │   │   ├── page.module.css
│   │   │   ├── Alerts.jsx
│   │   │   └── Alerts.module.css
│   │   ├── updates/                   # Market news
│   │   │   ├── page.jsx
│   │   │   └── page.module.css
│   │   ├── api/                       # Frontend API routes (legacy)
│   │   │   ├── transcribe/route.js
│   │   │   ├── alerts/route.js
│   │   │   └── insights/route.js
│   │   ├── layout.jsx                 # Root layout
│   │   └── globals.css                # Global styles
│   ├── components/                    # Shared components
│   │   ├── Navbar.jsx
│   │   ├── Navbar.module.css
│   │   ├── Header.jsx
│   │   ├── Header.module.css
│   │   ├── Card.jsx
│   │   └── Card.module.css
│   ├── lib/                           # Utilities
│   │   └── api.js                     # API client with interceptors
│   ├── three/                         # 3D components
│   │   ├── Globe.jsx
│   │   └── Globe.module.css
│   ├── next.config.js
│   ├── package.json
│   └── README.md
│
├── backend/                            # Next.js 14 Backend API
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts     # POST /api/auth/login
│   │   │   │   ├── register/route.ts  # POST /api/auth/register
│   │   │   │   └── refresh/route.ts   # POST /api/auth/refresh
│   │   │   ├── transcribe/route.ts    # POST /api/transcribe
│   │   │   ├── analyze/route.ts       # POST /api/analyze
│   │   │   ├── insights/
│   │   │   │   ├── route.ts           # GET/POST /api/insights
│   │   │   │   └── [id]/route.ts      # GET /api/insights/:id
│   │   │   ├── alerts/
│   │   │   │   ├── route.ts           # GET/POST /api/alerts
│   │   │   │   └── [id]/acknowledge/route.ts
│   │   │   ├── dashboard/
│   │   │   │   └── stats/route.ts     # GET /api/dashboard/stats
│   │   │   └── health/route.ts        # GET /api/health
│   │   ├── layout.tsx
│   │   └── page.tsx                   # API documentation page
│   ├── lib/
│   │   ├── auth.ts                    # Auth middleware
│   │   ├── db.ts                      # Database operations
│   │   ├── jwt.ts                     # JWT utilities
│   │   └── password.ts                # Password hashing
│   ├── data/
│   │   └── db.json                    # JSON database (auto-created)
│   ├── middleware.ts                  # Rate limiting & CORS
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
└── README.md                           # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **OpenAI API Key** with access to:
  - `whisper-1` model (transcription)
  - `gpt-4o-mini` model (analysis)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd KCAVIATION

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

#### Backend Environment (`backend/.env.local`)

```env
# Required
OPENAI_API_KEY=sk-your-openai-api-key-here
JWT_SECRET=your-secure-jwt-secret-minimum-32-characters

# Optional
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_ALERT_GENERATION=true
```

#### Frontend Environment (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Running the Application

#### Terminal 1 - Backend (Port 3001)

```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend (Port 3000)

```bash
cd frontend
npm run dev
```

### Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Frontend Application |
| http://localhost:3001 | Backend API |
| http://localhost:3001/api/health | Health Check |

### First-Time Setup

1. Open http://localhost:3000
2. Click **Sign Up** to create an account
3. Fill in: Email, Password, Name, Role
4. Click **Create Account**
5. Switch to **Sign In** and login
6. You're ready to use the platform!

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    AeroIntel Frontend (Next.js 15)               │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │   │
│  │  │   Auth    │  │   Voice   │  │  Insights │  │   Alerts  │    │   │
│  │  │   Page    │  │  Capture  │  │ Dashboard │  │   Page    │    │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │   │
│  │                              │                                    │   │
│  │              ┌───────────────┴───────────────┐                   │   │
│  │              │        API Client (Axios)      │                   │   │
│  │              │   - JWT Token Management       │                   │   │
│  │              │   - Request/Response Intercept │                   │   │
│  │              └───────────────┬───────────────┘                   │   │
│  └──────────────────────────────┼───────────────────────────────────┘   │
└─────────────────────────────────┼───────────────────────────────────────┘
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVER (Next.js 14)                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         Middleware Layer                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │ Rate Limit  │  │    CORS     │  │   JWT Validation        │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  │                                       │
│  ┌───────────────────────────────┼───────────────────────────────────┐ │
│  │                         API Routes                                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │ │
│  │  │   Auth   │  │Transcribe│  │ Analyze  │  │ Insights │          │ │
│  │  │ Service  │  │ Service  │  │ Service  │  │ Service  │          │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘          │ │
│  │       │              │              │              │                │ │
│  │       ▼              ▼              ▼              ▼                │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │                    Library Layer                               │ │ │
│  │  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────────────────┐ │ │ │
│  │  │  │  JWT   │  │Password│  │  Auth  │  │      Database      │ │ │ │
│  │  │  │ Utils  │  │ Utils  │  │ Utils  │  │    Operations      │ │ │ │
│  │  │  └────────┘  └────────┘  └────────┘  └────────────────────┘ │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                  │                                       │
│  ┌───────────────────────────────┼───────────────────────────────────┐ │
│  │                         External Services                          │ │
│  │  ┌──────────────────────┐  ┌──────────────────────────────────┐  │ │
│  │  │   OpenAI Whisper     │  │        OpenAI GPT-4              │  │ │
│  │  │   (Transcription)    │  │        (Analysis)                │  │ │
│  │  └──────────────────────┘  └──────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                  │                                       │
│  ┌───────────────────────────────┼───────────────────────────────────┐ │
│  │                         Data Layer                                 │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │                      db.json                                   │ │ │
│  │  │  ┌─────────┐  ┌───────────┐  ┌──────────┐                    │ │ │
│  │  │  │  Users  │  │  Insights │  │  Alerts  │                    │ │ │
│  │  │  └─────────┘  └───────────┘  └──────────┘                    │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Record    │────▶│   Whisper    │────▶│ Transcription│
│    Audio     │     │     API      │     │     Text     │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Display    │◀────│    GPT-4     │◀────│   Context    │
│   Results    │     │   Analysis   │     │   + Text     │
└──────┬───────┘     └──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Keyword    │────▶│    Save to   │────▶│   Generate   │
│ Highlighting │     │   Database   │     │    Alerts    │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 📱 Frontend Documentation

### Pages Overview

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | - | Redirects to `/auth` |
| `/auth` | `AuthPage` | Login/Register with role selection |
| `/dashboard` | `Dashboard` | Analytics, stats, emerging themes |
| `/voice-capture` | `VoiceCapturePage` | Record, transcribe, analyze |
| `/insights` | `InsightsPage` | Search, filter, view history |
| `/alerts` | `AlertsPage` | View and filter alerts |
| `/updates` | `UpdatesPage` | Market news and correlations |

### Key Components

#### VoiceRecorder
Records audio using the MediaRecorder API.

```jsx
<VoiceRecorder 
  onTranscription={(data) => handleTranscription(data)}
  onRecordingState={(isRecording) => setIsRecording(isRecording)}
/>
```

#### AIAnalysisResult
Displays AI analysis with themes, keywords, signals.

```jsx
<AIAnalysisResult analysis={analysisData} />
```

#### Card
Reusable glassmorphic card component.

```jsx
<Card className={styles.customCard}>
  <h3>Title</h3>
  <p>Content</p>
</Card>
```

### Styling Guide

The frontend uses a **dark aviation theme** with glassmorphism effects.

#### Color Palette

| Color | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Background Primary | `#0a1628` | `--bg-primary` | Main background |
| Background Secondary | `#0f1f2e` | `--bg-secondary` | Cards, sections |
| Accent Green | `#4ade80` | `--accent-green` | Positive, success |
| Accent Green Dark | `#22c55e` | `--accent-green-dark` | Buttons, CTAs |
| Negative Red | `#f87171` | `--color-negative` | Errors, critical |
| Warning Yellow | `#fbbf24` | `--color-warning` | Warnings, medium |
| Neutral Gray | `#94a3b8` | `--color-neutral` | Muted text |

#### Glass Effect

```css
.glassCard {
  background: rgba(20, 30, 45, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
}
```

---

## ⚙️ Backend Documentation

### API Routes Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | ❌ | Health check |
| POST | `/api/auth/login` | ❌ | User login |
| POST | `/api/auth/register` | ❌ | User registration |
| POST | `/api/auth/refresh` | ✅ | Refresh JWT token |
| POST | `/api/transcribe` | ✅ | Audio transcription |
| POST | `/api/analyze` | ✅ | AI analysis |
| GET | `/api/insights` | ✅ | Get insights (filtered) |
| POST | `/api/insights` | ✅ | Create insight |
| GET | `/api/insights/:id` | ✅ | Get single insight |
| GET | `/api/alerts` | ✅ | Get alerts (filtered) |
| POST | `/api/alerts` | ✅ | Create alert (admin) |
| POST | `/api/alerts/:id/acknowledge` | ✅ | Acknowledge alert |
| GET | `/api/dashboard/stats` | ✅ | Dashboard statistics |

### Library Modules

#### `lib/jwt.ts`
JWT token generation and verification.

```typescript
import { generateToken, verifyToken, extractToken } from '@/lib/jwt';

// Generate token
const token = generateToken({
  userId: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

// Verify token
const payload = verifyToken(token); // Returns null if invalid
```

#### `lib/password.ts`
Secure password hashing with bcrypt.

```typescript
import { hashPassword, comparePassword } from '@/lib/password';

// Hash password
const hash = await hashPassword('plaintext');

// Compare password
const isValid = await comparePassword('plaintext', hash);
```

#### `lib/auth.ts`
Authentication middleware and utilities.

```typescript
import { getAuthUser, withAuth } from '@/lib/auth';

// Get user from request
const user = getAuthUser(request);

// Wrap handler with auth
export const GET = withAuth(async (request, user) => {
  // user is guaranteed to be authenticated
  return NextResponse.json({ user });
});
```

#### `lib/db.ts`
Database operations for users, insights, and alerts.

```typescript
import { 
  findUserByEmail, 
  createUser, 
  getInsights, 
  createInsight,
  getAlerts,
  createAlert 
} from '@/lib/db';

// Find user
const user = findUserByEmail('test@example.com');

// Create insight
const insight = createInsight({
  userId: 'user_id',
  userName: 'John Doe',
  transcription: 'Text...',
  airline: 'Indigo',
  // ...
});
```

---

## 📡 API Reference

### Authentication

#### POST `/api/auth/register`

Create a new user account.

**Request:**
```json
{
  "email": "analyst@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "role": "analyst"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "analyst@example.com",
    "name": "John Doe",
    "role": "analyst",
    "createdAt": "2025-12-19T10:00:00.000Z",
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Roles:** `analyst`, `manager`, `executive`, `admin`

---

#### POST `/api/auth/login`

Authenticate existing user.

**Request:**
```json
{
  "email": "analyst@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Voice Processing

#### POST `/api/transcribe`

Transcribe audio to text using OpenAI Whisper.

**Request:**
```
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- audio: File (audio/webm, audio/mp3, audio/wav)
```

**Response (200):**
```json
{
  "success": true,
  "transcription": "Indigo airlines is planning to expand their fleet by 20 percent next quarter.",
  "metadata": {
    "duration": 15.3,
    "language": "en",
    "confidence": 0.95
  }
}
```

---

#### POST `/api/analyze`

Perform AI-powered analysis on transcription.

**Request:**
```json
{
  "transcription": "Indigo airlines is planning to expand their fleet by 20 percent next quarter.",
  "context": {
    "airline": "Indigo",
    "country": "India",
    "recordedBy": "analyst@example.com"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "analysis": {
    "summary": "Indigo Airlines is pursuing aggressive fleet expansion with 20% growth targeted for next quarter.",
    "keywords": ["fleet expansion", "20 percent", "next quarter", "Indigo", "growth"],
    "themes": ["Expansion", "Financial"],
    "sentiment": {
      "overall": "Positive",
      "score": 0.82,
      "breakdown": {
        "positive": 75,
        "neutral": 20,
        "negative": 5
      }
    },
    "marketSignals": [
      {
        "signal": "Major fleet expansion indicates strong demand forecasting",
        "strength": "Strong",
        "trend": "up",
        "confidence": 0.88
      }
    ],
    "airlineSpecifications": [
      {
        "airline": "Indigo",
        "relevance": "High",
        "signals": ["Expansion", "Fleet Growth"],
        "competitiveImpact": "High"
      }
    ],
    "predictiveProbabilities": [
      {
        "event": "Fleet expansion completion next quarter",
        "probability": 78,
        "confidence": 0.85
      }
    ],
    "confidenceScore": 0.85,
    "timestamp": "2025-12-19T10:30:00.000Z"
  }
}
```

---

### Insights

#### GET `/api/insights`

Retrieve insights with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `airline` | string | Filter by airline name |
| `theme` | string | Filter by theme |
| `sentiment` | string | Filter by sentiment |
| `startDate` | ISO8601 | Filter from date |
| `endDate` | ISO8601 | Filter to date |
| `userId` | string | Filter by user |
| `limit` | number | Results per page (default: 50) |
| `offset` | number | Pagination offset |

**Example:**
```
GET /api/insights?airline=Indigo&theme=Expansion&limit=10
```

**Response:**
```json
{
  "success": true,
  "insights": [...],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### Alerts

#### GET `/api/alerts`

Retrieve alerts with optional filtering.

**Query Parameters:**
| Parameter | Type | Values |
|-----------|------|--------|
| `severity` | string | Critical, High, Medium, Low |
| `airline` | string | Airline name |
| `category` | string | Hiring, Expansion, Financial, Operations, Safety, Training |
| `limit` | number | Results per page |
| `offset` | number | Pagination offset |

---

### Dashboard

#### GET `/api/dashboard/stats`

Get aggregated statistics for dashboard.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalInsights": 1250,
    "activeAlerts": 12,
    "airlinesMonitored": 45,
    "countriesCovered": 28,
    "todayInsights": 23,
    "weekInsights": 156,
    "sentimentBreakdown": {
      "positive": 62,
      "neutral": 28,
      "negative": 10
    },
    "topAirlines": [
      { "name": "Indigo", "count": 145 },
      { "name": "Air India", "count": 132 }
    ],
    "topThemes": [
      { "name": "Expansion", "count": 234 },
      { "name": "Hiring", "count": 189 }
    ],
    "avgConfidence": 0.85
  }
}
```

---

## 📊 Data Models

### User

```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Unique email
  passwordHash: string;          // Bcrypt hash
  name: string;                  // Display name
  role: 'analyst' | 'manager' | 'executive' | 'admin';
  createdAt: string;             // ISO 8601
  isActive: boolean;
}
```

### Insight

```typescript
interface Insight {
  id: string;                    // UUID
  userId: string;                // Creator's user ID
  userName: string;              // Creator's name
  transcription: string;         // Original transcription
  airline: string;               // Related airline
  country: string;               // Related country
  theme: string;                 // Primary theme
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  score: number;                 // Confidence 0.0-1.0
  summary: string;               // AI summary
  keywords: string[];            // Extracted keywords
  analysis: AIAnalysis;          // Full analysis object
  timestamp: string;             // ISO 8601
}
```

### Alert

```typescript
interface Alert {
  id: string;                    // UUID
  title: string;                 // Alert title
  message: string;               // Alert details
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  airline: string;               // Related airline
  country: string;               // Related country
  category: 'Hiring' | 'Expansion' | 'Financial' | 'Operations' | 'Safety' | 'Training';
  timestamp: string;             // ISO 8601
  relatedInsightIds: string[];   // Related insight IDs
  actionRequired: boolean;
  acknowledged: boolean;
}
```

### AI Analysis

```typescript
interface AIAnalysis {
  summary: string;
  keywords: string[];
  themes: string[];              // From fixed list
  sentiment: {
    overall: 'Positive' | 'Neutral' | 'Negative';
    score: number;               // 0.0-1.0
    breakdown: {
      positive: number;          // Percentage
      neutral: number;
      negative: number;
    };
  };
  marketSignals: {
    signal: string;
    strength: 'Strong' | 'Moderate' | 'Weak';
    trend: 'up' | 'down' | 'stable';
    confidence: number;
  }[];
  airlineSpecifications: {
    airline: string;
    relevance: 'High' | 'Medium' | 'Low';
    signals: string[];
    competitiveImpact: 'High' | 'Medium' | 'Low';
  }[];
  predictiveProbabilities: {
    event: string;
    probability: number;         // 0-100
    confidence: number;          // 0.0-1.0
  }[];
  confidenceScore: number;
  timestamp: string;
}
```

---

## 🔐 Authentication

### JWT Token Structure

```json
{
  "userId": "uuid-here",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "analyst",
  "iat": 1703000000,
  "exp": 1703604800
}
```

### Token Lifecycle

| Event | Action |
|-------|--------|
| Login/Register | Token issued (7 day expiry) |
| API Request | Token validated via middleware |
| Token Expired | 401 response, redirect to login |
| Token Refresh | New token issued (optional) |

### Role Permissions

| Action | Analyst | Manager | Executive | Admin |
|--------|---------|---------|-----------|-------|
| View own insights | ✅ | ✅ | ✅ | ✅ |
| View all insights | ❌ | ✅ | ✅ | ✅ |
| Create insights | ✅ | ✅ | ✅ | ✅ |
| View alerts | ✅ | ✅ | ✅ | ✅ |
| Create alerts | ❌ | ✅ | ❌ | ✅ |
| Dashboard stats | Own | All | All | All |
| Manage users | ❌ | ❌ | ❌ | ✅ |

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│   Validate  │────▶│  Generate   │
│   Form      │     │ Credentials │     │   JWT       │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
       ┌───────────────────────────────────────┘
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Store     │────▶│   Redirect  │────▶│   Include   │
│ in Storage  │     │  Dashboard  │     │ in Headers  │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 🤖 AI Processing Pipeline

### Transcription Pipeline

```
Audio Blob (WebM/MP3/WAV)
         │
         ▼
┌─────────────────────────────┐
│  Convert to OpenAI Format   │
│  (File object with buffer)  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│     OpenAI Whisper API      │
│     Model: whisper-1        │
│     Language: English       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Transcription Response    │
│   - text: string            │
│   - language: string        │
└─────────────────────────────┘
```

### Analysis Pipeline

```
Transcription Text + Context
               │
               ▼
┌─────────────────────────────────────────────────────┐
│              Prompt Engineering                       │
│  - Fixed themes constraint                           │
│  - JSON output format                                │
│  - Aviation domain expertise                         │
│  - Keyword extraction instructions                   │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                  OpenAI GPT-4o-mini                   │
│  - Temperature: 0.7                                  │
│  - Max tokens: 2000                                  │
│  - Response format: JSON                             │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│              Post-Processing                          │
│  - Parse JSON response                               │
│  - Validate themes against fixed list                │
│  - Add timestamp                                     │
│  - Save to database                                  │
│  - Generate alerts if needed                         │
└─────────────────────────────────────────────────────┘
```

### Alert Generation Logic

Alerts are automatically generated when:

| Condition | Alert Severity | Category |
|-----------|---------------|----------|
| Negative sentiment + score < 0.4 | High | Based on theme |
| Positive sentiment + score > 0.8 | Medium | Based on theme |
| Theme includes "Hiring" | Medium/High | Hiring |
| Theme includes "Expansion" | Medium/High | Expansion |
| Theme includes "Safety" | High | Safety |

---

## 🏷️ Fixed Themes & Categories

### Theme Definitions

| Theme | Keywords Detected | Business Impact |
|-------|-------------------|-----------------|
| **Hiring** | hire, recruit, fire, layoff, workforce, pilots, crew | Workforce changes signal capacity changes |
| **Expansion** | expand, fleet, routes, aircraft, grow, new | Growth indicators and market positioning |
| **Financial** | revenue, profit, loss, cost, investment, funding | Financial health and stability |
| **Operations** | delay, maintenance, schedule, operational, efficiency | Operational reliability |
| **Safety** | safety, incident, compliance, audit, regulation | Risk and regulatory status |
| **Training** | training, simulator, certification, license | Capability development |

### Theme to Alert Category Mapping

```typescript
function mapThemeToCategory(theme: string): AlertCategory {
  const themeLower = theme.toLowerCase();
  
  if (themeLower.includes('hiring') || themeLower.includes('firing')) 
    return 'Hiring';
  if (themeLower.includes('expansion') || themeLower.includes('fleet')) 
    return 'Expansion';
  if (themeLower.includes('financ') || themeLower.includes('revenue')) 
    return 'Financial';
  if (themeLower.includes('operation') || themeLower.includes('delay')) 
    return 'Operations';
  if (themeLower.includes('safety') || themeLower.includes('incident')) 
    return 'Safety';
  if (themeLower.includes('training') || themeLower.includes('simulator')) 
    return 'Training';
  
  return 'Operations'; // Default
}
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | ✅ | - | OpenAI API key |
| `JWT_SECRET` | ✅ | - | JWT signing secret (min 32 chars) |
| `PORT` | ❌ | 3001 | Server port |
| `NODE_ENV` | ❌ | development | Environment |
| `ALLOWED_ORIGINS` | ❌ | * | CORS origins (comma-separated) |
| `RATE_LIMIT_WINDOW_MS` | ❌ | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ | 100 | Max requests per window |
| `ENABLE_ALERT_GENERATION` | ❌ | true | Auto-generate alerts |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | http://localhost:3001 | Backend API URL |

---

## 💾 Database Schema

### Current: JSON File Storage

Located at `backend/data/db.json`:

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "string",
      "passwordHash": "string",
      "name": "string",
      "role": "analyst|manager|executive|admin",
      "createdAt": "ISO8601",
      "isActive": true
    }
  ],
  "insights": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "string",
      "transcription": "string",
      "airline": "string",
      "country": "string",
      "theme": "string",
      "sentiment": "Positive|Neutral|Negative",
      "score": 0.85,
      "summary": "string",
      "keywords": ["array"],
      "analysis": {},
      "timestamp": "ISO8601"
    }
  ],
  "alerts": [
    {
      "id": "uuid",
      "title": "string",
      "message": "string",
      "severity": "Critical|High|Medium|Low",
      "airline": "string",
      "country": "string",
      "category": "Hiring|Expansion|Financial|Operations|Safety|Training",
      "timestamp": "ISO8601",
      "relatedInsightIds": ["uuid"],
      "actionRequired": false,
      "acknowledged": false
    }
  ]
}
```

### Migration to PostgreSQL (Recommended for Production)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('analyst', 'manager', 'executive', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Insights table
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  transcription TEXT NOT NULL,
  airline VARCHAR(255),
  country VARCHAR(255),
  theme VARCHAR(100),
  sentiment VARCHAR(20) CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
  score DECIMAL(3,2),
  summary TEXT,
  keywords JSONB DEFAULT '[]',
  analysis JSONB DEFAULT '{}',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_insights_airline ON insights(airline);
CREATE INDEX idx_insights_theme ON insights(theme);
CREATE INDEX idx_insights_timestamp ON insights(timestamp DESC);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
  airline VARCHAR(255),
  country VARCHAR(255),
  category VARCHAR(50) CHECK (category IN ('Hiring', 'Expansion', 'Financial', 'Operations', 'Safety', 'Training')),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  related_insight_ids JSONB DEFAULT '[]',
  action_required BOOLEAN DEFAULT false,
  acknowledged BOOLEAN DEFAULT false
);

CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp DESC);
```

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

#### Frontend

```bash
cd frontend
vercel
```

#### Backend

```bash
cd backend
vercel

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add JWT_SECRET
vercel env add ALLOWED_ORIGINS
```

### Docker Deployment

#### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - ALLOWED_ORIGINS=http://localhost:3000
      - NODE_ENV=production
    volumes:
      - ./backend/data:/app/data

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
    depends_on:
      - backend
```

#### Backend Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/data ./data
EXPOSE 3001
CMD ["npm", "start"]
```

#### Frontend Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

### PM2 Deployment

```bash
# Install PM2 globally
npm install -g pm2

# Backend
cd backend
npm run build
pm2 start npm --name "aerointel-api" -- start

# Frontend
cd ../frontend
npm run build
pm2 start npm --name "aerointel-web" -- start

# Save PM2 config
pm2 save
pm2 startup
```

---

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors

**Problem:** `Access-Control-Allow-Origin` errors

**Solution:**
```env
# backend/.env.local
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

#### OpenAI API Errors

**Problem:** 401 or 503 errors on transcription/analysis

**Solutions:**
1. Verify `OPENAI_API_KEY` is correct
2. Check API quota and billing
3. Ensure access to `whisper-1` and `gpt-4o-mini` models

#### Token Expiration

**Problem:** Unexpected 401 errors

**Solution:**
```javascript
// Clear localStorage and re-login
localStorage.removeItem('token');
localStorage.removeItem('user');
window.location.href = '/auth';
```

#### Audio Recording Not Working

**Problem:** Microphone access denied

**Solutions:**
1. Ensure HTTPS (required for `getUserMedia`)
2. Check browser permissions
3. Allow microphone access in browser settings

#### Database Errors

**Problem:** Cannot read/write `db.json`

**Solutions:**
1. Ensure `backend/data/` directory exists
2. Check file permissions
3. Verify JSON syntax if manually edited

### Debug Mode

Enable verbose logging:

```env
# backend/.env.local
NODE_ENV=development
DEBUG=true
```

---

## 📈 Performance Considerations

### API Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| All endpoints | 100 requests | 15 minutes |
| `/api/transcribe` | Heavy (audio processing) | - |
| `/api/analyze` | Heavy (GPT-4 call) | - |

### Optimization Tips

1. **Audio Files**: Keep recordings under 5 minutes
2. **Batch Operations**: Use pagination for large datasets
3. **Caching**: Consider Redis for session storage
4. **Database**: Migrate to PostgreSQL for production

---

## 🤝 Contributing

### Development Workflow

1. Create a feature branch
2. Make changes with tests
3. Run linting: `npm run lint`
4. Submit pull request

### Code Style

- Use TypeScript for backend
- Use JSX for frontend components
- Follow ESLint configuration
- Write meaningful commit messages

---

## 📄 License

**Private - All Rights Reserved**

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 📞 Support

For technical support or questions:

1. Check [Troubleshooting](#-troubleshooting) section
2. Review API documentation
3. Check browser console for errors
4. Verify environment configuration

---

<div align="center">

**Built with ❤️ for Aviation Intelligence**

*Transforming voice into actionable market insights*

</div>



