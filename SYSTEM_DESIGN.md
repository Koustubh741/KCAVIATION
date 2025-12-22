# KCAVIATION Platform - System Design Document

## 1. Executive Summary

**KCAVIATION** is an AI-powered voice intelligence platform designed for aviation market intelligence. The platform processes audio recordings (voice conversations, interviews, meetings) to extract actionable insights about airlines, market trends, hiring patterns, fleet expansions, and competitive dynamics.

### Key Capabilities
- **Voice Transcription**: Real-time audio-to-text conversion using OpenAI Whisper
- **AI-Powered Analysis**: Intelligent extraction of airlines, themes, market signals, and sentiment
- **Market Intelligence**: Automated detection of hiring/firing patterns, fleet expansions, regulatory changes
- **Visualization**: Interactive dashboards, heatmaps, and 3D globe visualization
- **Alerting**: Real-time notifications for critical market signals

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Browser    │  │  Mobile App  │  │  API Client  │         │
│  │  (Next.js)   │  │   (Future)   │  │   (Future)   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
          │  HTTP/HTTPS      │                  │
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼────────────────┐
│                      API GATEWAY LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Next.js API Routes (Proxy Layer)                 │  │
│  │  /api/transcribe  /api/analyze  /api/insights  /api/alerts│  │
│  └──────────────────────┬───────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          │ HTTP/REST
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              FastAPI Backend (Python)                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ Transcription│  │   Analysis   │  │  Airline/    │  │  │
│  │  │   Service    │  │   Service    │  │  Theme       │  │  │
│  │  │              │  │              │  │  Detection   │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │  │
│  └─────────┼──────────────────┼──────────────────┼──────────┘  │
└────────────┼──────────────────┼──────────────────┼─────────────┘
             │                  │                  │
             │                  │                  │
┌────────────▼──────────────────▼──────────────────▼─────────────┐
│                      EXTERNAL SERVICES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ OpenAI Whisper│  │  OpenAI GPT  │  │  (Future:    │        │
│  │   (Audio →    │  │  (Text →     │  │   Database,  │        │
│  │    Text)      │  │   Insights)  │  │   Cache,     │        │
│  └──────────────┘  └──────────────┘  │   Queue)     │        │
│                                       └──────────────┘        │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Pages & Routes                          │   │
│  │  • /voice-capture  • /insights  • /dashboard        │   │
│  │  • /alerts         • /auth      • /updates          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Components                              │   │
│  │  • VoiceRecorder  • AIAnalysisResult                │   │
│  │  • Dashboard      • Heatmap  • Globe                │   │
│  │  • Alerts         • InsightsList                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              API Routes (Next.js)                    │   │
│  │  • /api/transcribe → proxies to FastAPI              │   │
│  │  • /api/insights   → local data (localStorage)       │   │
│  │  • /api/alerts     → local data (localStorage)      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              State Management                        │   │
│  │  • React Hooks (useState, useEffect)                 │   │
│  │  • localStorage (insights history, user data)        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST
                          │
┌─────────────────────────▼─────────────────────────────────────┐
│                   BACKEND (FastAPI)                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              API Endpoints                           │   │
│  │  • POST /api/transcribe  • POST /api/analyze        │   │
│  │  • GET  /health          • GET  /                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Services Layer                         │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │     TranscriptionService                     │   │   │
│  │  │  • transcribe_audio()                       │   │   │
│  │  │  • Uses OpenAI Whisper API                  │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │     AnalysisService                         │   │   │
│  │  │  • analyze_transcription()                  │   │   │
│  │  │  • _determine_primary_airline()            │   │   │
│  │  │  • _build_analysis_prompt()                 │   │   │
│  │  │  • _parse_ai_response()                     │   │   │
│  │  │  • Uses OpenAI GPT-4o                       │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Configuration Layer                     │   │
│  │  • airlines.py  • themes.py  • settings.py         │   │
│  │  • Rule-based detection logic                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Middleware                              │   │
│  │  • CORS  • Error Handling  • Logging                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow

### 3.1 Transcription & Analysis Flow

```
User Action: Record Audio
    │
    ▼
┌─────────────────────────────────────┐
│  VoiceRecorder Component             │
│  • Captures audio via MediaRecorder  │
│  • Creates Blob (webm format)        │
└──────────────┬───────────────────────┘
               │
               │ POST /api/transcribe
               │ (FormData: audio file)
               ▼
┌─────────────────────────────────────┐
│  Next.js API Route                  │
│  /api/transcribe/route.js           │
│  • Validates request                │
│  • Proxies to FastAPI backend       │
└──────────────┬───────────────────────┘
               │
               │ POST http://localhost:8000/api/transcribe
               ▼
┌─────────────────────────────────────┐
│  FastAPI Endpoint                    │
│  /api/transcribe                    │
│  • Validates file (size, format)    │
│  • Calls TranscriptionService       │
└──────────────┬───────────────────────┘
               │
               │ transcribe_audio()
               ▼
┌─────────────────────────────────────┐
│  TranscriptionService                │
│  • Creates temp file                 │
│  • Calls OpenAI Whisper API         │
│  • Returns transcription text       │
└──────────────┬───────────────────────┘
               │
               │ Transcription Text
               ▼
┌─────────────────────────────────────┐
│  AnalysisService                     │
│  Step 1: Rule-Based Detection       │
│  • detect_airlines_in_text()         │
│  • detect_themes_in_text()          │
│  • get_primary_airline()            │
└──────────────┬───────────────────────┘
               │
               │ Detected Airlines & Themes
               ▼
┌─────────────────────────────────────┐
│  AnalysisService                     │
│  Step 2: AI Analysis                │
│  • _build_analysis_prompt()         │
│  • Calls OpenAI GPT-4o              │
│  • _parse_ai_response()             │
│  • Extracts: summary, keywords,      │
│    signals, sentiment               │
└──────────────┬───────────────────────┘
               │
               │ Structured Analysis Object
               ▼
┌─────────────────────────────────────┐
│  FastAPI Response                    │
│  {                                   │
│    transcription,                    │
│    airline,                         │
│    theme,                           │
│    sentiment,                       │
│    analysis: { ... }                │
│  }                                   │
└──────────────┬───────────────────────┘
               │
               │ JSON Response
               ▼
┌─────────────────────────────────────┐
│  Frontend Processing                │
│  • Updates UI with results          │
│  • Saves to localStorage            │
│  • Displays in AIAnalysisResult     │
└─────────────────────────────────────┘
```

### 3.2 Airline & Theme Detection Flow

```
Transcription Text
    │
    ├─────────────────────────────────────┐
    │                                     │
    ▼                                     ▼
┌──────────────────┐          ┌──────────────────┐
│ Airline Detection │          │  Theme Detection  │
│                  │          │                  │
│ • Scans for      │          │ • Scans for      │
│   keywords       │          │   theme keywords │
│ • Calculates     │          │ • Scores themes  │
│   relevance      │          │ • Returns top 3  │
│ • Returns top 5  │          │                  │
└────────┬─────────┘          └────────┬─────────┘
         │                             │
         └─────────────┬───────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │ Primary Airline      │
            │ Determination        │
            │                      │
            │ If multiple airlines:│
            │ • Use AI (GPT-4o)    │
            │ • Else: highest score│
            └──────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │ Airline-Theme        │
            │ Mapping              │
            │                      │
            │ • map_airlines_to_   │
            │   themes()           │
            │ • map_themes_to_     │
            │   airlines()         │
            └──────────────────────┘
```

---

## 4. Technology Stack

### 4.1 Frontend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Next.js | 15.x | React framework with App Router |
| **UI Library** | React | 18.x | Component-based UI |
| **Styling** | CSS Modules | - | Scoped styling |
| **3D Visualization** | Three.js + React Three Fiber | - | Interactive globe visualization |
| **HTTP Client** | Axios | - | API communication |
| **State Management** | React Hooks + localStorage | - | Client-side state |

### 4.2 Backend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | FastAPI | Latest | High-performance async API |
| **Language** | Python | 3.10+ | Backend logic |
| **AI Services** | OpenAI API | - | Whisper (transcription) + GPT-4o (analysis) |
| **Configuration** | Pydantic Settings | - | Environment-based config |
| **Server** | Uvicorn | - | ASGI server |

### 4.3 External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| **OpenAI Whisper** | Audio transcription | REST API |
| **OpenAI GPT-4o** | Text analysis & insights | REST API |

---

## 5. Core Components

### 5.1 Frontend Components

#### VoiceRecorder (`frontend/app/voice-capture/VoiceRecorder.jsx`)
- **Purpose**: Captures audio from user's microphone
- **Features**:
  - Start/stop recording
  - Audio playback preview
  - File upload to backend
  - Error handling with timeouts

#### AIAnalysisResult (`frontend/app/voice-capture/AIAnalysisResult.jsx`)
- **Purpose**: Displays analysis results
- **Features**:
  - Summary display
  - Keywords visualization
  - Market signals list
  - Sentiment breakdown
  - Airline specifications

#### Dashboard (`frontend/app/dashboard/Dashboard.jsx`)
- **Purpose**: Analytics visualization
- **Features**:
  - Heatmap visualization
  - Trend charts
  - Statistics overview

#### Globe (`frontend/three/Globe.jsx`)
- **Purpose**: 3D geographic visualization
- **Technology**: Three.js
- **Features**: Interactive globe with data points

### 5.2 Backend Services

#### TranscriptionService (`backend/src/services/transcription.py`)
```python
class TranscriptionService:
    async def transcribe_audio(
        audio_file: bytes,
        filename: str,
        language: Optional[str] = None
    ) -> str
```
- **Responsibilities**:
  - File validation
  - Temporary file management
  - OpenAI Whisper API integration
  - Error handling

#### AnalysisService (`backend/src/services/analysis.py`)
```python
class AnalysisService:
    async def analyze_transcription(
        transcription: str,
        airline_filter: Optional[str] = None,
        theme_filter: Optional[str] = None
    ) -> Dict[str, Any]
```
- **Responsibilities**:
  - Rule-based airline/theme detection
  - AI-powered analysis via GPT-4o
  - Response parsing and structuring
  - Fallback analysis if AI fails

### 5.3 Configuration Modules

#### Airlines Configuration (`backend/src/config/airlines.py`)
- **Purpose**: Airline keyword detection
- **Features**:
  - 16+ airlines (Indian + International)
  - Relevance scoring algorithm
  - Primary airline determination
  - Airline-theme mapping

#### Themes Configuration (`backend/src/config/themes.py`)
- **Purpose**: Theme keyword detection
- **Themes**:
  - Hiring / Firing
  - Fleet Expansion
  - Market Competition
  - Pilot Training Demand
  - Operational Efficiency
  - Regulatory Compliance
  - Financial Performance
  - Route Expansion
  - Technology & Innovation
  - Safety & Security

---

## 6. Data Models

### 6.1 Transcription Request
```typescript
{
  audio: File (multipart/form-data),
  airline_filter?: string,
  theme_filter?: string
}
```

### 6.2 Transcription Response
```typescript
{
  transcription: string,
  airline: string,
  allAirlines: string[],
  theme: string,
  sentiment: string,
  score: number,
  analysis: AnalysisObject
}
```

### 6.3 Analysis Object
```typescript
{
  summary: string,
  keywords: string[],
  themes: string[],
  marketSignals: MarketSignal[],
  sentiment: {
    overall: "Positive" | "Negative" | "Neutral",
    score: number,
    breakdown: {
      positive: number,
      neutral: number,
      negative: number
    }
  },
  confidenceScore: number,
  predictiveProbabilities: Prediction[],
  airlineSpecifications: AirlineSpec[],
  primaryAirline: string,
  allAirlines: string[],
  timestamp: string,
  airlineThemeMap: { [airline: string]: string[] },
  themeAirlineMap: { [theme: string]: string[] }
}
```

### 6.4 Market Signal
```typescript
{
  signal: string,
  strength: "Strong" | "Moderate" | "Weak",
  trend: "up" | "down" | "stable"
}
```

### 6.5 Airline Specification
```typescript
{
  airline: string,
  relevance: "High" | "Medium" | "Low",
  isPrimary: boolean,
  signals: string[],
  score: number,
  mentionCount: number,
  themes: string[]
}
```

---

## 7. API Design

### 7.1 Endpoints

#### POST `/api/transcribe`
**Purpose**: Transcribe audio and analyze

**Request**:
- `audio`: File (multipart/form-data)
- `airline_filter`: string (optional)
- `theme_filter`: string (optional)

**Response**: `TranscriptionResponse`

**Error Codes**:
- `400`: Invalid file format/size
- `503`: Service unavailable (API keys missing)

#### POST `/api/analyze`
**Purpose**: Analyze text directly

**Request**:
- `text`: string
- `airline_filter`: string (optional)
- `theme_filter`: string (optional)

**Response**: `AnalysisObject`

#### GET `/health`
**Purpose**: Health check

**Response**:
```json
{
  "status": "healthy",
  "services": {
    "transcription": true,
    "analysis": true
  }
}
```

---

## 8. Security Considerations

### 8.1 Current Security Measures
- ✅ Environment variable-based API key management
- ✅ CORS configuration
- ✅ File size validation (max 25MB)
- ✅ File format validation
- ✅ Error handling without exposing internals

### 8.2 Recommended Enhancements
- **Authentication**: JWT-based user authentication
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Prevent API abuse
- **Input Sanitization**: Validate and sanitize all inputs
- **HTTPS**: Enforce HTTPS in production
- **API Key Rotation**: Support for rotating OpenAI API keys
- **Audit Logging**: Log all API requests for compliance

---

## 9. Scalability & Performance

### 9.1 Current Architecture Limitations
- **Stateless Backend**: No database persistence
- **Synchronous Processing**: Requests block until completion
- **No Caching**: Every request hits OpenAI API
- **Single Instance**: No horizontal scaling

### 9.2 Scalability Recommendations

#### Short-term (0-6 months)
1. **Database Integration**
   - PostgreSQL for structured data
   - Redis for caching
   - Store transcriptions, analyses, user data

2. **Caching Layer**
   - Cache OpenAI API responses
   - Cache airline/theme detection results
   - Reduce API costs and latency

3. **Queue System**
   - Celery + Redis for async processing
   - Handle long-running transcriptions
   - Better user experience with job status

#### Medium-term (6-12 months)
1. **Microservices Architecture**
   - Separate transcription service
   - Separate analysis service
   - Independent scaling

2. **Load Balancing**
   - Nginx/HAProxy for load distribution
   - Multiple FastAPI instances

3. **CDN Integration**
   - Serve static assets via CDN
   - Reduce server load

#### Long-term (12+ months)
1. **Event-Driven Architecture**
   - Kafka/RabbitMQ for event streaming
   - Real-time updates to dashboards

2. **Machine Learning Pipeline**
   - Fine-tuned models for airline/theme detection
   - Reduce dependency on OpenAI API
   - Cost optimization

3. **Multi-Region Deployment**
   - Geographic distribution
   - Lower latency globally

---

## 10. Deployment Architecture

### 10.1 Development Environment
```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │
│   Next.js       │────────▶│   FastAPI       │
│   :3000         │         │   :8000         │
└─────────────────┘         └─────────────────┘
```

### 10.2 Production Architecture (Recommended)
```
┌─────────────────────────────────────────────────────┐
│                    CDN / Load Balancer              │
│                  (Cloudflare / AWS ALB)              │
└───────────────┬─────────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
    ▼                       ▼
┌──────────┐         ┌──────────┐
│ Frontend │         │  Backend │
│ Next.js  │         │ FastAPI  │
│ (Vercel) │         │ (ECS/K8s) │
└──────────┘         └─────┬─────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │    Redis     │  │   OpenAI     │
│   (RDS)      │  │   (ElastiCache)│  │    API      │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 10.3 Containerization
```dockerfile
# Backend Dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 10.4 Infrastructure as Code
- **Terraform**: Infrastructure provisioning
- **Docker Compose**: Local development
- **Kubernetes**: Production orchestration (optional)

---

## 11. Monitoring & Observability

### 11.1 Recommended Tools
- **Application Monitoring**: Sentry, Datadog, New Relic
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Metrics**: Prometheus + Grafana
- **APM**: Application Performance Monitoring

### 11.2 Key Metrics to Track
- API response times
- Transcription success rate
- Analysis accuracy
- OpenAI API usage/costs
- Error rates
- User engagement metrics

---

## 12. Future Enhancements

### 12.1 Feature Roadmap

#### Phase 1: Core Enhancements
- [ ] User authentication & authorization
- [ ] Database persistence (PostgreSQL)
- [ ] Real-time transcription streaming
- [ ] Batch processing for multiple files

#### Phase 2: Intelligence Features
- [ ] Historical trend analysis
- [ ] Predictive analytics dashboard
- [ ] Custom alert rules
- [ ] Export capabilities (PDF, Excel)

#### Phase 3: Advanced AI
- [ ] Multi-language support
- [ ] Speaker diarization (identify speakers)
- [ ] Custom model fine-tuning
- [ ] Automated report generation

#### Phase 4: Enterprise Features
- [ ] Multi-tenant support
- [ ] Role-based access control
- [ ] API rate limiting & quotas
- [ ] White-label customization

### 12.2 Integration Opportunities
- **CRM Integration**: Salesforce, HubSpot
- **Business Intelligence**: Tableau, Power BI
- **Communication**: Slack, Microsoft Teams alerts
- **Data Sources**: News APIs, social media feeds

---

## 13. Compliance & Governance

### 13.1 Data Privacy
- **GDPR Compliance**: User data handling
- **Data Retention**: Configurable retention policies
- **PII Masking**: Mask sensitive information in logs
- **Consent Management**: User consent for data processing

### 13.2 Audit Requirements
- **Audit Logs**: All API requests logged
- **Trace IDs**: Request correlation for debugging
- **Compliance Reports**: Automated compliance reporting

---

## 14. Cost Optimization

### 14.1 Current Costs
- **OpenAI API**: Pay-per-use (Whisper + GPT-4o)
- **Hosting**: Minimal (development)

### 14.2 Optimization Strategies
1. **Caching**: Reduce redundant API calls
2. **Model Selection**: Use cheaper models where appropriate
3. **Batch Processing**: Process multiple requests together
4. **Fine-tuned Models**: Reduce dependency on OpenAI
5. **Resource Optimization**: Right-size infrastructure

---

## 15. Risk Assessment

### 15.1 Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenAI API downtime | High | Fallback analysis, retry logic |
| High API costs | Medium | Caching, rate limiting, cost monitoring |
| Data loss | High | Database backup, replication |
| Security breach | Critical | Authentication, encryption, audit logs |

### 15.2 Business Risks
- **Dependency on OpenAI**: Vendor lock-in
- **Scalability**: Current architecture may not scale
- **Data Privacy**: Compliance requirements

---

## 16. Conclusion

The KCAVIATION platform is a modern, AI-powered voice intelligence system designed for aviation market intelligence. The current architecture provides a solid foundation with:

- ✅ Clean separation of concerns (frontend/backend)
- ✅ Modular service architecture
- ✅ Extensible configuration system
- ✅ Error handling and fallback mechanisms

**Next Steps**:
1. Implement database persistence
2. Add user authentication
3. Implement caching layer
4. Set up monitoring and logging
5. Plan for production deployment

---

## Appendix A: Configuration Files

### Environment Variables
```bash
# Backend (.env)
OPENAI_API_KEY=sk-...
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000
MAX_AUDIO_SIZE_MB=25
TRANSCRIPTION_MODEL=whisper-1
ANALYSIS_MODEL=gpt-4o

# Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## Appendix B: Directory Structure

```
KCAVIATION/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── main.py              # FastAPI application
│   │   ├── services/
│   │   │   ├── transcription.py    # Transcription service
│   │   │   └── analysis.py          # Analysis service
│   │   ├── config/
│   │   │   ├── airlines.py          # Airline detection config
│   │   │   ├── themes.py            # Theme detection config
│   │   │   └── settings.py          # Application settings
│   │   └── __init__.py
│   ├── requirements.txt
│   ├── run.py
│   └── .env
│
├── frontend/
│   ├── app/
│   │   ├── voice-capture/           # Voice recording page
│   │   ├── insights/                # Insights visualization
│   │   ├── dashboard/               # Analytics dashboard
│   │   ├── alerts/                 # Alerts management
│   │   ├── api/                    # Next.js API routes
│   │   └── layout.jsx
│   ├── components/                 # Reusable components
│   ├── three/                      # Three.js components
│   └── package.json
│
└── docs/
    ├── SYSTEM_DESIGN.md            # This document
    ├── SETUP.md
    └── IMPLEMENTATION_SUMMARY.md
```

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Author**: System Design Team

