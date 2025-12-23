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
    if (!data) {
      setTranscription(null)
      setAiAnalysis(null)
      setIsAnalyzing(false)
      return
    }

    // Check for errors
    if (data.error) {
      console.error('Transcription error:', data.error)
      setTranscription(null)
      setAiAnalysis(null)
      setIsAnalyzing(false)
      return
    }

    setTranscription(data)
    setIsAnalyzing(true)

    if (data && data.analysis) {
      // Use analysis from backend response
      setAiAnalysis(data.analysis)
      setIsAnalyzing(false)

      // Save to LocalStorage for Insights History
      const now = new Date()

      // Get current user
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      const userEmail = user ? user.email : 'guest'

      const analysis = data.analysis
      
      // Derive signal from sentiment
      const sentiment = analysis.sentiment?.overall || 'Neutral'
      const score = analysis.sentiment?.score || 0.5
      let signal = 'Neutral'
      if (sentiment === 'Positive' && score > 0.7) {
        signal = 'Strong Positive'
      } else if (sentiment === 'Positive') {
        signal = 'Positive'
      } else if (sentiment === 'Negative' && score < 0.3) {
        signal = 'Strong Negative'
      } else if (sentiment === 'Negative') {
        signal = 'Negative'
      }

      // Extract all airlines and themes
      const allAirlines = analysis.airlineSpecifications?.map(a => a.airline).filter(Boolean) || []
      const allThemes = analysis.themes || []
      
      const newRecord = {
        userId: userEmail,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: now.toISOString().split('T')[0],
        // Save all airlines, not just the first one
        airline: allAirlines.length > 0 ? allAirlines.join(', ') : (data.airline || 'Unknown Airline'),
        airlines: allAirlines.length > 0 ? allAirlines : (data.airline ? [data.airline] : []),
        country: 'India', // Default for demo
        // Save all themes, not just the first one
        theme: allThemes.length > 0 ? allThemes.join(', ') : (data.theme || 'General'),
        themes: allThemes.length > 0 ? allThemes : (data.theme ? [data.theme] : ['General']),
        signal: signal,
        summary: analysis.summary || 'No summary available',
        transcript: data.transcription || '',
        correlation: analysis.correlation || null  // Save correlation data
      }

      try {
        const existingHistory = JSON.parse(localStorage.getItem('recording_history') || '[]')
        const updatedHistory = [newRecord, ...existingHistory]
        localStorage.setItem('recording_history', JSON.stringify(updatedHistory))
      } catch (error) {
        console.error('Error saving to history:', error)
      }
    } else {
      setAiAnalysis(null)
      setIsAnalyzing(false)
    }
  }

  const handleRecordingState = (recording) => {
    setIsRecording(recording)
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
              <p>
                {(() => {
                  const text = transcription.transcription || ''
                  const keywords = aiAnalysis?.keywords || []
                  if (!keywords || keywords.length === 0) return text
                  
                  // Sort keywords by length (longer first) to avoid partial matches
                  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length)
                  
                  // Create regex pattern
                  const pattern = new RegExp(
                    `\\b(${sortedKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
                    'gi'
                  )
                  
                  const parts = []
                  let lastIndex = 0
                  let match
                  
                  while ((match = pattern.exec(text)) !== null) {
                    if (match.index > lastIndex) {
                      parts.push(text.substring(lastIndex, match.index))
                    }
                    parts.push(
                      <mark key={match.index} style={{
                        background: 'rgba(74, 222, 128, 0.3)',
                        color: '#4ade80',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        fontWeight: '600',
                        border: '1px solid rgba(74, 222, 128, 0.5)'
                      }}>
                        {match[0]}
                      </mark>
                    )
                    lastIndex = pattern.lastIndex
                  }
                  
                  if (lastIndex < text.length) {
                    parts.push(text.substring(lastIndex))
                  }
                  
                  return parts.length > 0 ? parts : text
                })()}
              </p>
            </div>
          </div>
        )}

        {/* AI Analysis Loading */}
        {(isAnalyzing || (transcription && !aiAnalysis)) && (
          <div className={styles.analyzingSection}>
            <div className={styles.analyzingCard}>
              <div className={styles.analyzingSpinner}></div>
              <h3>Processing with AI...</h3>
              <p>Transcribing audio and extracting intelligence signals, keywords, and market predictions</p>
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
