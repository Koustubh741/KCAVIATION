'use client'

import { useState, useRef } from 'react'
import axios from 'axios'
import styles from './VoiceRecorder.module.css'

export default function VoiceRecorder({ onTranscription, onRecordingState }) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Audio recording is not supported in this browser or context. Please ensure you are using a secure connection (HTTPS) or localhost.')
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      onRecordingState(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      onRecordingState(false)
    }
  }

  const handleTranscribe = async () => {
    if (!audioBlob) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await axios.post('/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout for transcription + analysis
      })

      if (response.data.error) {
        throw new Error(response.data.error)
      }

      onTranscription(response.data)
    } catch (error) {
      console.error('Transcription error:', error)
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to transcribe audio. Please check your connection and try again.'
      alert(errorMessage)
      onTranscription(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    onTranscription(null)
  }

  return (
    <div className={styles.recorder}>
      <div className={styles.controls}>
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            className={`${styles.button} ${styles.recordButton}`}
          >
            <span className={styles.buttonIcon}>🎤</span>
            Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className={`${styles.button} ${styles.stopButton}`}
          >
            <span className={styles.buttonIcon}>⏹</span>
            Stop Recording
          </button>
        )}

        {audioBlob && !isRecording && (
          <>
            <button
              onClick={handleTranscribe}
              disabled={isProcessing}
              className={`${styles.button} ${styles.transcribeButton}`}
            >
              {isProcessing ? 'Processing...' : 'Transcribe'}
            </button>
            <button
              onClick={resetRecording}
              className={`${styles.button} ${styles.resetButton}`}
            >
              Reset
            </button>
          </>
        )}
      </div>

      {audioUrl && (
        <div className={styles.audioPreview}>
          <p className={styles.audioLabel}>Audio Preview:</p>
          <audio controls src={audioUrl} className={styles.audioPlayer} />
        </div>
      )}

      {isRecording && (
        <div className={styles.recordingIndicator}>
          <span className={styles.pulse}></span>
          Recording...
        </div>
      )}
    </div>
  )
}


