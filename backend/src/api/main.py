"""FastAPI application main file."""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
import logging

from src.config.settings import settings
from src.services.transcription import TranscriptionService
from src.services.analysis import AnalysisService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="KCAVIATION Voice Intelligence API",
    description="Backend API for voice transcription and AI analysis",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
try:
    transcription_service = TranscriptionService()
    analysis_service = AnalysisService()
except (ValueError, TypeError, Exception) as e:
    logger.warning(f"Service initialization warning: {e}")
    transcription_service = None
    analysis_service = None


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "KCAVIATION Voice Intelligence API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "services": {
            "transcription": transcription_service is not None,
            "analysis": analysis_service is not None
        }
    }


@app.post("/api/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    airline_filter: Optional[str] = Form(None),
    theme_filter: Optional[str] = Form(None)
):
    """
    Transcribe audio file and return transcription with AI analysis.
    
    Args:
        audio: Audio file to transcribe
        airline_filter: Optional airline name to filter analysis
        theme_filter: Optional theme to filter analysis
        
    Returns:
        Transcription and analysis results
    """
    if not transcription_service or not analysis_service:
        raise HTTPException(
            status_code=503,
            detail="Transcription or analysis service not available. Please check API key configuration."
        )
    
    try:
        # Validate file
        if not audio.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Check file size
        audio_bytes = await audio.read()
        file_size_mb = len(audio_bytes) / (1024 * 1024)
        
        if file_size_mb > settings.max_audio_size_mb:
            raise HTTPException(
                status_code=400,
                detail=f"File size ({file_size_mb:.2f}MB) exceeds maximum allowed size ({settings.max_audio_size_mb}MB)"
            )
        
        # Check file format
        file_ext = audio.filename.split('.')[-1].lower()
        if file_ext not in settings.supported_audio_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported audio format. Supported formats: {', '.join(settings.supported_audio_formats)}"
            )
        
        logger.info(f"Processing audio file: {audio.filename}, size: {file_size_mb:.2f}MB")
        
        # Transcribe audio
        transcription_text = await transcription_service.transcribe_audio(
            audio_bytes,
            audio.filename
        )
        
        logger.info(f"Transcription completed: {len(transcription_text)} characters")
        
        # Analyze transcription
        analysis = await analysis_service.analyze_transcription(
            transcription_text,
            airline_filter=airline_filter,
            theme_filter=theme_filter
        )
        
        # Determine primary airline for response
        primary_airline = analysis.get("primaryAirline")
        if not primary_airline and analysis.get("airlineSpecifications"):
            # Get primary from specifications (marked with isPrimary)
            primary_spec = next(
                (spec for spec in analysis.get("airlineSpecifications", []) if spec.get("isPrimary")),
                analysis.get("airlineSpecifications", [{}])[0]
            )
            primary_airline = primary_spec.get("airline", "Unknown")
        elif not primary_airline:
            primary_airline = "Unknown"
        
        # Return combined result
        return JSONResponse({
            "transcription": transcription_text,
            "airline": primary_airline,
            "allAirlines": analysis.get("allAirlines", []),
            "theme": analysis.get("themes", ["General"])[0] if analysis.get("themes") else "General",
            "sentiment": analysis.get("sentiment", {}).get("overall", "Neutral"),
            "score": analysis.get("sentiment", {}).get("score", 0.5),
            "analysis": analysis
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process audio: {str(e)}"
        )


@app.post("/api/analyze")
async def analyze_text(
    text: str = Form(...),
    airline_filter: Optional[str] = Form(None),
    theme_filter: Optional[str] = Form(None)
):
    """
    Analyze text directly without transcription.
    
    Args:
        text: Text to analyze
        airline_filter: Optional airline name to filter analysis
        theme_filter: Optional theme to filter analysis
        
    Returns:
        Analysis results
    """
    if not analysis_service:
        raise HTTPException(
            status_code=503,
            detail="Analysis service not available. Please check API key configuration."
        )
    
    try:
        analysis = await analysis_service.analyze_transcription(
            text,
            airline_filter=airline_filter,
            theme_filter=theme_filter
        )
        
        return JSONResponse(analysis)
        
    except Exception as e:
        logger.error(f"Error analyzing text: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze text: {str(e)}"
        )


@app.post("/api/correlate")
async def correlate_transcript(
    transcript: str = Form(...),
    airlines: Optional[str] = Form(None),
    themes: Optional[str] = Form(None)
):
    """
    Correlate a transcript with news articles.
    
    Args:
        transcript: Raw transcript text
        airlines: Comma-separated airline names
        themes: Comma-separated themes
        
    Returns:
        Correlation results with matched news articles
    """
    if not analysis_service:
        raise HTTPException(status_code=503, detail="Analysis service not available")
    
    try:
        from src.services.news_correlation import NewsCorrelationService
        from src.services.correlation import CorrelationEngine
        
        news_service = NewsCorrelationService()
        correlation_engine = CorrelationEngine()
        
        airline_list = [a.strip() for a in airlines.split(",")] if airlines else []
        theme_list = [t.strip() for t in themes.split(",")] if themes else []
        
        # Search news
        search_query = f"{' '.join(theme_list)} {' '.join(airline_list)}"
        news_articles = await news_service.search_aviation_news(
            query=search_query,
            airlines=airline_list if airline_list else None,
            max_results=20
        )
        
        # Correlate
        correlation = await correlation_engine.correlate_transcript_with_news(
            transcript,
            news_articles,
            airline_list,
            theme_list
        )
        
        return JSONResponse(correlation)
    except Exception as e:
        logger.error(f"Correlation failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Correlation failed: {str(e)}")

