"""Script to run the FastAPI server."""
import uvicorn
import sys
import logging
from src.config.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def validate_environment():
    """Validate critical environment variables."""
    warnings = []
    errors = []
    
    # Check OpenAI API key (required)
    if not settings.openai_api_key:
        errors.append("OPENAI_API_KEY is not set. This is required for transcription and analysis.")
    elif len(settings.openai_api_key) < 20:
        warnings.append("OPENAI_API_KEY appears to be invalid (too short).")
    
    # Check NewsAPI key (optional but recommended)
    if not settings.newsapi_key:
        warnings.append("NEWSAPI_KEY is not set. News correlation features will be disabled.")
    
    # Log warnings
    for warning in warnings:
        logger.warning(f"⚠️  {warning}")
    
    # Log errors and exit if critical
    if errors:
        logger.error("=" * 60)
        logger.error("❌ CRITICAL ENVIRONMENT VARIABLES MISSING:")
        for error in errors:
            logger.error(f"   • {error}")
        logger.error("=" * 60)
        logger.error("Please set the required environment variables in backend/.env")
        logger.error("Example: OPENAI_API_KEY=sk-...")
        sys.exit(1)
    
    # Log configuration
    logger.info("=" * 60)
    logger.info("🚀 Starting KCAVIATION Backend API")
    logger.info(f"   Host: {settings.api_host}")
    logger.info(f"   Port: {settings.api_port}")
    logger.info(f"   OpenAI API Key: {'✓ Configured' if settings.openai_api_key else '✗ Missing'}")
    logger.info(f"   NewsAPI Key: {'✓ Configured' if settings.newsapi_key else '✗ Missing (optional)'}")
    logger.info("=" * 60)

if __name__ == "__main__":
    validate_environment()
    uvicorn.run(
        "src.api.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )

