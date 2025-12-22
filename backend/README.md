# KCAVIATION Backend API

Backend API for voice transcription and AI-powered market intelligence analysis.

## Features

- **Voice Transcription**: Convert audio files to text using OpenAI Whisper
- **AI Analysis**: Extract insights, keywords, themes, and market signals
- **Airline Detection**: Automatically detect airlines mentioned in content
- **Theme Extraction**: Identify relevant themes (Hiring, Fleet Expansion, etc.)
- **Sentiment Analysis**: Analyze sentiment and confidence scores

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_key_here
```

## Running the Server

```bash
# Development mode
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### POST `/api/transcribe`
Transcribe audio file and return analysis.

**Request:**
- `audio`: Audio file (multipart/form-data)
- `airline_filter` (optional): Filter by airline name
- `theme_filter` (optional): Filter by theme

**Response:**
```json
{
  "transcription": "Transcribed text...",
  "airline": "Indigo",
  "theme": "Hiring / Firing",
  "sentiment": "Positive",
  "score": 0.89,
  "analysis": {
    "summary": "...",
    "keywords": [...],
    "themes": [...],
    "marketSignals": [...],
    "sentiment": {...},
    "airlineSpecifications": [...]
  }
}
```

### POST `/api/analyze`
Analyze text directly.

**Request:**
- `text`: Text to analyze
- `airline_filter` (optional): Filter by airline name
- `theme_filter` (optional): Filter by theme

## Configuration

### Airlines
Configured airlines are defined in `src/config/airlines.py`. Add new airlines by updating `AIRLINE_KEYWORDS`.

### Themes
Themes are defined in `src/config/themes.py`. Add new themes by updating `THEME_KEYWORDS`.

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   └── main.py          # FastAPI application
│   ├── config/
│   │   ├── settings.py       # Application settings
│   │   ├── airlines.py       # Airline configuration
│   │   └── themes.py         # Theme configuration
│   └── services/
│       ├── transcription.py # Transcription service
│       └── analysis.py       # AI analysis service
├── requirements.txt
└── README.md
```

