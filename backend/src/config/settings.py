"""Application settings and configuration."""
import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Keys
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    newsapi_key: str = os.getenv("NEWSAPI_KEY", "")
    
    # Server Configuration
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    cors_origins: str = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:3000,http://localhost:3001"
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    # Audio Processing
    max_audio_size_mb: int = int(os.getenv("MAX_AUDIO_SIZE_MB", "25"))
    supported_audio_formats: List[str] = ["webm", "mp3", "wav", "m4a", "ogg"]
    
    # AI Model Configuration
    transcription_model: str = os.getenv("TRANSCRIPTION_MODEL", "whisper-1")
    analysis_model: str = os.getenv("ANALYSIS_MODEL", "gpt-4o")
    
    # News Correlation Configuration
    correlation_enabled: bool = os.getenv("CORRELATION_ENABLED", "true").lower() == "true"
    news_search_days_back: int = int(os.getenv("NEWS_SEARCH_DAYS_BACK", "30"))
    correlation_similarity_threshold: float = float(os.getenv("CORRELATION_SIMILARITY_THRESHOLD", "0.4"))
    claim_similarity_threshold: float = float(os.getenv("CLAIM_SIMILARITY_THRESHOLD", "0.5"))
    max_search_terms: int = int(os.getenv("MAX_SEARCH_TERMS", "20"))
    
    # Default Values Configuration
    default_unknown_airline: str = os.getenv("DEFAULT_UNKNOWN_AIRLINE", "Unknown Airline")
    
    class Config:
        """Pydantic config."""
        env_file = ".env"
        case_sensitive = False


settings = Settings()

