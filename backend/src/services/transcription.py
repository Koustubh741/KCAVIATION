"""Transcription service for converting audio to text."""
import os
import tempfile
from typing import Optional
from openai import OpenAI
from src.config.settings import settings


class TranscriptionService:
    """Service for transcribing audio files to text."""
    
    def __init__(self):
        """Initialize transcription service."""
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.transcription_model
    
    async def transcribe_audio(
        self, 
        audio_file: bytes, 
        filename: str,
        language: Optional[str] = None
    ) -> str:
        """
        Transcribe audio file to text.
        
        Args:
            audio_file: Audio file bytes
            filename: Original filename
            language: Optional language code (e.g., 'en', 'hi')
            
        Returns:
            Transcribed text
            
        Raises:
            Exception: If transcription fails
        """
        try:
            # Create temporary file for audio
            with tempfile.NamedTemporaryFile(
                delete=False, 
                suffix=os.path.splitext(filename)[1]
            ) as temp_file:
                temp_file.write(audio_file)
                temp_file_path = temp_file.name
            
            try:
                # Transcribe using OpenAI Whisper
                with open(temp_file_path, "rb") as audio:
                    transcript = self.client.audio.transcriptions.create(
                        model=self.model,
                        file=audio,
                        language=language or "en",
                        response_format="text"
                    )
                
                return transcript if isinstance(transcript, str) else transcript.text
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            raise Exception(f"Transcription failed: {str(e)}")

