'use client'

import { useState } from 'react'
import VoiceRecorder from './VoiceRecorder'
import AIAnalysisResult from './AIAnalysisResult'
import styles from './page.module.css'

export default function VoiceCapturePage() {
  const [transcription, setTranscription] = useState(null)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleTranscription = async (data) => {
    setTranscription(data)

    if (data) {
      // Trigger AI Analysis after transcription
      setIsAnalyzing(true)
      try {
        // Simulated AI analysis - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 2000))

        const analysis = generateMockAnalysis(data.transcription)
        setAiAnalysis(analysis)

        // Save to LocalStorage for Insights History
        const now = new Date()

        // Get current user
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : null
        const userEmail = user ? user.email : 'guest'

        const newRecord = {
          userId: userEmail,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: now.toISOString().split('T')[0],
          airline: analysis.airlineSpecifications[0]?.airline || 'Unknown Airline',
          country: 'India', // Default for demo
          theme: analysis.themes[0] || 'General',
          signal: 'Strong Positive', // Derived for demo
          summary: analysis.summary,
          transcript: data.transcription
        }

        const existingHistory = JSON.parse(localStorage.getItem('recording_history') || '[]')
        const updatedHistory = [newRecord, ...existingHistory]
        localStorage.setItem('recording_history', JSON.stringify(updatedHistory))

      } catch (error) {
        console.error('AI Analysis error:', error)
      } finally {
        setIsAnalyzing(false)
      }
    } else {
      setAiAnalysis(null)
    }
  }

  const handleRecordingState = (recording) => {
    setIsRecording(recording)
  }

  // Mock AI Analysis Generator (replace with actual AI API)
  const generateMockAnalysis = (text) => {
    return {
      summary: `AI-generated intelligence summary based on the voice capture. The analysis detected market signals related to general aviation intelligence. Key patterns identified suggest significant market movements in the coming weeks.`,

      keywords: [
        'fleet expansion',
        'pilot shortage',
        'market growth',
        'operational efficiency',
        'regulatory compliance'
      ].slice(0, 3 + Math.floor(Math.random() * 3)),

      themes: [
        'Hiring / Firing',
        'Market Competition',
        'Pilot Training Demand'
      ].slice(0, 1 + Math.floor(Math.random() * 2)),

      marketSignals: [
        { signal: 'Increased pilot demand indicators', strength: 'Strong', trend: 'up' },
        { signal: 'Fleet expansion announcements expected', strength: 'Moderate', trend: 'up' },
        { signal: 'Training capacity constraints', strength: 'Moderate', trend: 'stable' }
      ],

      sentiment: {
        overall: 'Positive',
        score: 0.72,
        breakdown: {
          positive: 65,
          neutral: 25,
          negative: 10
        }
      },

      confidenceScore: 0.85,

      predictiveProbabilities: [
        { event: 'Hiring surge in Q1', probability: 78 },
        { event: 'New aircraft orders', probability: 65 },
        { event: 'Regulatory changes', probability: 42 }
      ],

      airlineSpecifications: [
        { airline: 'Indigo', relevance: 'High', signals: ['Expansion', 'Hiring'] },
        { airline: 'Air India', relevance: 'Medium', signals: ['Fleet upgrade'] },
        { airline: 'SpiceJet', relevance: 'Low', signals: ['Operational'] }
      ],

      timestamp: new Date().toISOString(),
      originalTheme: null
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Voice Intelligence</h1>
        <p className={styles.subtitle}>
          Record audio to extract AI-powered market intelligence insights
        </p>
      </div>

      <div className={styles.content}>


        {/* Voice Recorder */}
        <div className={styles.recorderSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🎤</span>
            Record Audio
          </h2>
          <VoiceRecorder
            onTranscription={handleTranscription}
            onRecordingState={handleRecordingState}
          />
        </div>

        {/* Transcription Preview */}
        {transcription && (
          <div className={styles.transcriptionSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📝</span>
              Transcription
            </h2>
            <div className={styles.transcriptionBox}>
              <p>{transcription.transcription}</p>
            </div>
          </div>
        )}

        {/* AI Analysis Loading */}
        {isAnalyzing && (
          <div className={styles.analyzingSection}>
            <div className={styles.analyzingCard}>
              <div className={styles.analyzingSpinner}></div>
              <h3>Analyzing with AI...</h3>
              <p>Extracting intelligence signals, keywords, and market predictions</p>
            </div>
          </div>
        )}

        {/* AI Analysis Result */}
        {aiAnalysis && !isAnalyzing && (
          <AIAnalysisResult analysis={aiAnalysis} />
        )}
      </div>
    </div>
  )
}
