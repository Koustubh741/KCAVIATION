# KCAVIATION Voice Intelligence Platform - Setup Guide

This guide will help you set up both the frontend and backend for the voice intelligence platform.

## Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **OpenAI API Key** (for transcription and AI analysis)

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install Python dependencies

**Windows:**
```bash
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**Manual setup:**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the `backend` directory (copy from `env.example`):

```bash
cp env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run the backend server

```bash
# Activate virtual environment first (if not already activated)
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# Run server
python run.py
```

Or using uvicorn directly:
```bash
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Configure backend URL (optional)

Create a `.env.local` file in the `frontend` directory:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

If not set, it defaults to `http://localhost:8000`

### 4. Run the frontend

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Testing the Integration

1. **Start the backend server** (port 8000)
2. **Start the frontend** (port 3000)
3. Navigate to `http://localhost:3000/voice-capture`
4. Click "Start Recording" and record some audio
5. Click "Stop Recording"
6. Click "Transcribe"
7. The audio will be sent to the backend, transcribed, and analyzed

## API Endpoints

### POST `/api/transcribe`
Transcribe audio and get AI analysis.

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

## Configuration

### Airlines
Edit `backend/src/config/airlines.py` to add or modify airline keywords.

### Themes
Edit `backend/src/config/themes.py` to add or modify theme keywords.

## Troubleshooting

### Backend Issues

1. **"OPENAI_API_KEY not found"**
   - Make sure you've created a `.env` file in the `backend` directory
   - Add your OpenAI API key to the `.env` file

2. **Import errors**
   - Make sure you're in the virtual environment
   - Reinstall dependencies: `pip install -r requirements.txt`

3. **Port already in use**
   - Change the port in `.env`: `API_PORT=8001`

### Frontend Issues

1. **Cannot connect to backend**
   - Make sure the backend is running on port 8000
   - Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
   - Check CORS settings in `backend/src/config/settings.py`

2. **Audio recording not working**
   - Make sure you're using HTTPS or localhost
   - Check browser permissions for microphone access

## Project Structure

```
KCAVIATION/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── main.py          # FastAPI application
│   │   ├── config/
│   │   │   ├── settings.py      # Configuration
│   │   │   ├── airlines.py      # Airline definitions
│   │   │   └── themes.py        # Theme definitions
│   │   └── services/
│   │       ├── transcription.py # Transcription service
│   │       └── analysis.py      # AI analysis service
│   ├── requirements.txt
│   └── run.py
└── frontend/
    ├── app/
    │   ├── api/
    │   │   └── transcribe/
    │   │       └── route.js     # Next.js API route (proxies to backend)
    │   └── voice-capture/
    │       └── page.jsx         # Voice capture page
    └── package.json
```

## Next Steps

- Add authentication/authorization
- Implement database storage for transcriptions
- Add more airlines and themes
- Enhance AI analysis prompts
- Add real-time transcription streaming

