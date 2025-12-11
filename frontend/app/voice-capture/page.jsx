'use client'

import { useState } from 'react'
import VoiceRecorder from './VoiceRecorder'
import AIAnalysisResult from './AIAnalysisResult'
import styles from './page.module.css'

// Predefined Themes for Aviation Intelligence
const PREDEFINED_THEMES = [
  { id: 'hiring', label: 'Hiring / Firing', icon: '👥' },
  { id: 'pilot_training', label: 'Pilot Training Demand', icon: '🎓' },
  { id: 'recency_lapse', label: 'Recency Lapse', icon: '⏰' },
  { id: 'fleet_expansion', label: 'Fleet Expansion / Aircraft Deliveries', icon: '✈️' },
  { id: 'regulatory', label: 'Regulatory Changes', icon: '📋' },
  { id: 'simulator', label: 'Simulator Demand', icon: '🎮' },
  { id: 'operations', label: 'Internal Operational Updates', icon: '⚙️' },
  { id: 'competition', label: 'Market Competition', icon: '🏆' },
  { id: 'pricing', label: 'Pricing Signals', icon: '💰' },
  { id: 'finance', label: 'Finance / Utilization', icon: '📊' },
]

export default function VoiceCapturePage() {
  const [selectedTheme, setSelectedTheme] = useState(null)
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

        const analysis = generateMockAnalysis(data.transcription, selectedTheme)
        setAiAnalysis(analysis)
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

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId === selectedTheme ? null : themeId)
  }

  // Mock AI Analysis Generator (replace with actual AI API)
  const generateMockAnalysis = (text, themeId) => {
    const selectedThemeData = PREDEFINED_THEMES.find(t => t.id === themeId)

    return {
      summary: `AI-generated intelligence summary based on the voice capture. The analysis detected market signals related to ${selectedThemeData?.label || 'general aviation intelligence'}. Key patterns identified suggest significant market movements in the coming weeks.`,

      keywords: [
        'fleet expansion',
        'pilot shortage',
        'market growth',
        'operational efficiency',
        'regulatory compliance'
      ].slice(0, 3 + Math.floor(Math.random() * 3)),

      themes: [
        selectedThemeData?.label || 'Hiring / Firing',
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
      originalTheme: selectedThemeData?.label
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
        {/* Theme Selection */}
        <div className={styles.themeSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🎯</span>
            Select Intelligence Theme
          </h2>
          <p className={styles.sectionDesc}>
            Choose a predefined theme to focus the AI analysis
          </p>
          <div className={styles.themeGrid}>
            {PREDEFINED_THEMES.map((theme) => (
              <button
                key={theme.id}
                className={`${styles.themeCard} ${selectedTheme === theme.id ? styles.selected : ''}`}
                onClick={() => handleThemeSelect(theme.id)}
              >
                <span className={styles.themeIcon}>{theme.icon}</span>
                <span className={styles.themeLabel}>{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Recorder */}
        <div className={styles.recorderSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🎤</span>
            Record Audio
          </h2>
          <VoiceRecorder
            onTranscription={handleTranscription}
            onRecordingState={handleRecordingState}
            selectedTheme={selectedTheme}
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
