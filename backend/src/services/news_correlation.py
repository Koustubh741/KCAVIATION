"""News correlation service for validating voice transcripts against real news."""
import httpx
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging
from src.config.settings import settings

logger = logging.getLogger(__name__)


class NewsCorrelationService:
    """Service for correlating voice transcripts with aviation news."""
    
    def __init__(self):
        self.api_key = settings.newsapi_key
        self.base_url = "https://newsapi.ai/api/v1/article/getArticles"
        self.timeout = 30
    
    def _build_query_json(self, keywords: List[str], operator: str = "$or") -> str:
        """
        Build NewsAPI.ai JSON query format from keywords.
        
        NewsAPI.ai expects query parameter as JSON string:
        - Single keyword: {"$query": {"keyword": "term"}}
        - Multiple keywords (OR): {"$query": {"$or": [{"keyword": "term1"}, {"keyword": "term2"}]}}
        - Multiple keywords (AND): {"$query": {"$and": [{"keyword": "term1"}, {"keyword": "term2"}]}}
        
        Args:
            keywords: List of search keywords
            operator: "$or" for OR logic, "$and" for AND logic
            
        Returns:
            JSON string for query parameter
        """
        if not keywords:
            # Default to aviation if no keywords
            return json.dumps({"$query": {"keyword": "aviation"}})
        
        # Filter out empty keywords
        valid_keywords = [k.strip() for k in keywords if k and k.strip()]
        
        if not valid_keywords:
            return json.dumps({"$query": {"keyword": "aviation"}})
        
        if len(valid_keywords) == 1:
            # Single keyword - simple format
            query_obj = {"$query": {"keyword": valid_keywords[0]}}
        else:
            # Multiple keywords - use operator ($or or $and)
            keyword_queries = [{"keyword": keyword} for keyword in valid_keywords]
            query_obj = {"$query": {operator: keyword_queries}}
        
        return json.dumps(query_obj)
    
    async def search_aviation_news(
        self,
        query: str,
        airlines: Optional[List[str]] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        max_results: int = 10
    ) -> List[Dict]:
        """
        Search aviation news from NewsAPI.ai
        
        Args:
            query: Search query (keywords, themes)
            airlines: List of airline names to filter
            date_from: Start date for news search
            date_to: End date for news search
            max_results: Maximum number of articles to return
            
        Returns:
            List of news articles with metadata
        """
        if not self.api_key:
            logger.warning("NewsAPI key not configured, skipping news search")
            return []
        
        # Parse query string into keywords
        # Split by spaces and common separators
        query_keywords = [q.strip() for q in query.replace(",", " ").split() if q.strip()]
        
        # Add airline names to keywords
        if airlines and airlines:
            for airline in airlines:
                if airline and airline.strip():
                    query_keywords.append(airline.strip())
        
        # Build JSON query (use $or for broader search)
        query_json = self._build_query_json(query_keywords, operator="$or")
        
        # Default to last 7 days if no date range
        if not date_from:
            date_from = datetime.now() - timedelta(days=7)
        if not date_to:
            date_to = datetime.now()
        
        # NewsAPI.ai doesn't allow dateStart/dateEnd with query parameter
        # Remove date parameters - API will return recent articles by default
        params = {
            "query": query_json,  # Now it's a JSON string
            "resultType": "articles",
            "articlesSortBy": "date",
            "articlesCount": max_results,
            "articleBodyLen": -1,  # Full article body
            "apiKey": self.api_key
            # Removed dateStart and dateEnd - NewsAPI.ai doesn't allow them with query parameter
            # Removed "lang": "eng" - must be in query if needed
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                articles = data.get("articles", {}).get("results", [])
                return self._format_articles(articles)
        except httpx.HTTPStatusError as e:
            logger.error(f"NewsAPI HTTP error: {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            logger.error(f"NewsAPI search failed: {str(e)}", exc_info=True)
            return []
    
    async def get_all_aviation_news(
        self,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        max_results: int = 100
    ) -> List[Dict]:
        """
        Fetch all recent aviation news from NewsAPI.ai (not search-based).
        
        Args:
            date_from: Start date for news search
            date_to: End date for news search
            max_results: Maximum number of articles to return
            
        Returns:
            List of all aviation news articles
        """
        if not self.api_key:
            logger.warning("NewsAPI key not configured, skipping news fetch")
            return []
        
        # Default to last 7 days if no date range
        if not date_from:
            date_from = datetime.now() - timedelta(days=7)
        if not date_to:
            date_to = datetime.now()
        
        # Use broad aviation keywords to get all aviation news
        aviation_keywords = [
            "airline", "aviation", "aircraft", "airport", "pilot", 
            "flight", "airline industry", "airline news", "aviation news"
        ]
        
        # Build JSON query (use $or for broader search)
        query_json = self._build_query_json(aviation_keywords, operator="$or")
        
        # NewsAPI.ai doesn't allow dateStart/dateEnd with query parameter
        # Remove date parameters - API will return recent articles by default
        params = {
            "query": query_json,  # Now it's a JSON string
            "resultType": "articles",
            "articlesSortBy": "date",
            "articlesCount": max_results,
            "articleBodyLen": -1,  # Full article body
            "apiKey": self.api_key
            # Removed dateStart and dateEnd - NewsAPI.ai doesn't allow them with query parameter
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                articles = data.get("articles", {}).get("results", [])
                logger.info(f"Fetched {len(articles)} aviation news articles")
                return self._format_articles(articles)
        except httpx.HTTPStatusError as e:
            logger.error(f"NewsAPI HTTP error: {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            logger.error(f"NewsAPI fetch failed: {str(e)}", exc_info=True)
            return []
    
    def _format_articles(self, articles: List[Dict]) -> List[Dict]:
        """Format articles into standard structure."""
        formatted = []
        for article in articles:
            formatted.append({
                "title": article.get("title", ""),
                "url": article.get("url", ""),
                "source": article.get("source", {}).get("title", "Unknown"),
                "publishedAt": article.get("date", ""),
                "description": article.get("body", "")[:500] if article.get("body") else "",
                "fullText": article.get("body", ""),
                "relevanceScore": 0.0  # Will be calculated
            })
        return formatted

