# AI Market Intelligence Platform

A Next.js application for AI-driven market intelligence in the aviation industry, featuring voice capture, transcription, insights, analytics, and alerts.

## Features

- 🎤 **Voice Capture**: Record audio and get AI-powered transcriptions
- 💡 **Insights**: View market intelligence insights with sentiment analysis
- 📊 **Dashboard**: Interactive analytics with heatmaps and trend visualization
- 🔔 **Alerts**: Real-time market intelligence alerts
- 🌍 **3D Globe**: Interactive Three.js globe visualization

## Tech Stack

- **Next.js 15** (App Router)
- **React 18**
- **Three.js** with React Three Fiber
- **CSS Modules** for styling
- **Axios** for API calls

## Getting Started

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Project Structure

```
/app
  /layout.jsx          - Root layout with Navbar
  /globals.css         - Global styles
  /page.jsx            - Home page
  
  /voice-capture       - Voice recording and transcription
  /insights            - Market insights with 3D Globe
  /dashboard           - Analytics dashboard
  /alerts              - Alerts management
  
  /api                 - API routes
    /transcribe        - Transcription endpoint
    /insights          - Insights endpoint
    /alerts            - Alerts endpoint

/components
  Navbar.jsx           - Navigation component
  Card.jsx             - Reusable card component

/three
  Globe.jsx            - Three.js globe component
```

## API Routes

All API routes return mock data for demonstration:

- `POST /api/transcribe` - Transcribes audio and returns insights
- `GET /api/insights` - Returns list of market insights
- `GET /api/alerts` - Returns list of alerts

## Notes

- The application uses CSS Modules for scoped styling
- Three.js components are client-side only (using 'use client')
- All API routes include mock data for demonstration purposes
- Voice recording requires browser microphone permissions


