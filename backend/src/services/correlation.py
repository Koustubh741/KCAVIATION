"""Correlation engine for matching transcripts with news."""
from typing import Dict, List, Tuple, Optional
from openai import OpenAI
import logging
import numpy as np
import json
from src.config.settings import settings

logger = logging.getLogger(__name__)


class CorrelationEngine:
    """Engine for correlating voice transcripts with news articles."""
    
    def __init__(self):
        if not settings.openai_api_key:
            raise ValueError("OpenAI API key required for correlation")
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.analysis_model
    
    async def correlate_transcript_with_news(
        self,
        transcript: str,
        news_articles: List[Dict],
        detected_airlines: List[str],
        detected_themes: List[str]
    ) -> Dict:
        """
        Correlate voice transcript with news articles.
        
        Returns:
            {
                "correlationScore": 0.85,
                "matchedArticles": [...],
                "verificationStatus": "verified|partial|unverified",
                "supportingReferences": [...]
            }
        """
        if not news_articles:
            return {
                "correlationScore": 0.0,
                "matchedArticles": [],
                "verificationStatus": "unverified",
                "supportingReferences": []
            }
        
        # Use AI to calculate semantic similarity
        correlations = await self._calculate_semantic_similarity(
            transcript, news_articles, detected_airlines, detected_themes
        )
        
        # Filter and rank correlations
        matched_articles = [
            article for article, score in correlations 
            if score >= 0.5  # Threshold for relevance
        ]
        matched_articles.sort(key=lambda x: x.get("relevanceScore", 0), reverse=True)
        
        # Determine verification status
        max_score = max([score for _, score in correlations], default=0.0)
        if max_score >= 0.8:
            status = "verified"
        elif max_score >= 0.5:
            status = "partial"
        else:
            status = "unverified"
        
        return {
            "correlationScore": max_score,
            "matchedArticles": matched_articles[:5],  # Top 5 matches
            "verificationStatus": status,
            "supportingReferences": [
                {
                    "title": article.get("title", ""),
                    "url": article.get("url", ""),
                    "source": article.get("source", "Unknown"),
                    "publishedAt": article.get("publishedAt", ""),
                    "relevanceScore": article.get("relevanceScore", 0.0)
                }
                for article in matched_articles
            ]
        }
    
    async def _calculate_semantic_similarity(
        self,
        transcript: str,
        articles: List[Dict],
        airlines: List[str],
        themes: List[str]
    ) -> List[Tuple[Dict, float]]:
        """Calculate semantic similarity using OpenAI embeddings."""
        try:
            # Create embeddings for transcript
            transcript_embedding = await self._get_embedding(transcript[:8000])
            
            correlations = []
            for article in articles:
                # Combine article title and description
                article_text = f"{article.get('title', '')} {article.get('description', '')}"
                article_embedding = await self._get_embedding(article_text[:8000])
                
                # Calculate cosine similarity
                similarity = self._cosine_similarity(
                    transcript_embedding, article_embedding
                )
                
                # Boost score if airlines/themes match
                boost = self._calculate_boost(article, airlines, themes)
                final_score = min(1.0, similarity + boost)
                
                article["relevanceScore"] = final_score
                correlations.append((article, final_score))
            
            return correlations
        except Exception as e:
            logger.error(f"Semantic similarity calculation failed: {str(e)}", exc_info=True)
            return [(article, 0.0) for article in articles]
    
    async def _get_embedding(self, text: str) -> List[float]:
        """Get OpenAI embedding for text."""
        if not text or not text.strip():
            # Return zero vector if empty
            return [0.0] * 1536  # text-embedding-3-small dimension
        
        try:
            response = self.client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Embedding generation failed: {str(e)}")
            return [0.0] * 1536
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        try:
            vec1_array = np.array(vec1)
            vec2_array = np.array(vec2)
            
            dot_product = np.dot(vec1_array, vec2_array)
            norm1 = np.linalg.norm(vec1_array)
            norm2 = np.linalg.norm(vec2_array)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            return float(dot_product / (norm1 * norm2))
        except Exception as e:
            logger.error(f"Cosine similarity calculation failed: {str(e)}")
            return 0.0
    
    def _calculate_boost(
        self,
        article: Dict,
        airlines: List[str],
        themes: List[str]
    ) -> float:
        """Boost correlation score if airlines/themes match."""
        boost = 0.0
        article_text = f"{article.get('title', '')} {article.get('description', '')}".lower()
        
        # Check airline matches
        for airline in airlines:
            if airline and airline.lower() in article_text:
                boost += 0.1
        
        # Check theme matches
        for theme in themes:
            if theme and theme.lower() in article_text:
                boost += 0.05
        
        return min(0.3, boost)  # Cap boost at 0.3
    
    async def verify_gossip_correctness(
        self,
        transcript: str,
        news_articles: List[Dict],
        detected_airlines: List[str],
        detected_themes: List[str]
    ) -> Dict:
        """
        Verify if gossip/transcript claims are correct based on news articles.
        
        Returns:
            {
                "accuracyScore": 0.85,
                "isCorrect": true,
                "verifiedClaims": [...],
                "unverifiedClaims": [...],
                "contradictingClaims": [...],
                "matchedArticles": [...],
                "verificationStatus": "verified|partial|unverified|contradicted"
            }
        """
        if not news_articles:
            return {
                "accuracyScore": 0.0,
                "isCorrect": False,
                "verifiedClaims": [],
                "unverifiedClaims": [],
                "contradictingClaims": [],
                "matchedArticles": [],
                "verificationStatus": "unverified",
                "correlationScore": 0.0  # Backward compatibility
            }
        
        # Extract key claims from transcript using AI
        claims = await self._extract_claims(transcript, detected_airlines, detected_themes)
        
        if not claims:
            # Fallback to semantic similarity if no claims extracted
            logger.info("No claims extracted, falling back to semantic similarity")
            correlation_result = await self.correlate_transcript_with_news(
                transcript, news_articles, detected_airlines, detected_themes
            )
            return {
                **correlation_result,
                "accuracyScore": correlation_result.get("correlationScore", 0.0),
                "isCorrect": correlation_result.get("verificationStatus") == "verified",
                "verifiedClaims": [],
                "unverifiedClaims": [],
                "contradictingClaims": []
            }
        
        # Verify each claim against news articles
        verified_claims = []
        unverified_claims = []
        contradicting_claims = []
        supporting_articles = []
        
        for claim in claims:
            verification_result = await self._verify_claim_against_news(
                claim, news_articles, detected_airlines
            )
            
            if verification_result["status"] == "verified":
                verified_claims.append({
                    "claim": claim.get("text", ""),
                    "confidence": verification_result["confidence"],
                    "supportingArticles": verification_result["articles"]
                })
                supporting_articles.extend(verification_result["articles"])
            elif verification_result["status"] == "contradicted":
                contradicting_claims.append({
                    "claim": claim.get("text", ""),
                    "contradictingArticles": verification_result["articles"],
                    "reason": verification_result.get("reason", "")
                })
            else:
                unverified_claims.append({
                    "claim": claim.get("text", ""),
                    "reason": "No matching news found"
                })
        
        # Calculate accuracy score
        total_claims = len(claims)
        if total_claims == 0:
            accuracy_score = 0.0
        else:
            verified_count = len(verified_claims)
            contradicted_count = len(contradicting_claims)
            # Score: verified claims boost, contradicted claims reduce
            accuracy_score = (verified_count - contradicted_count * 0.5) / total_claims
            accuracy_score = max(0.0, min(1.0, accuracy_score))
        
        # Determine overall status
        if contradicting_claims:
            status = "contradicted"
        elif len(verified_claims) == total_claims and total_claims > 0:
            status = "verified"
        elif len(verified_claims) > 0:
            status = "partial"
        else:
            status = "unverified"
        
        # Remove duplicate articles
        unique_articles = {}
        for article in supporting_articles:
            url = article.get("url", "")
            if url and url not in unique_articles:
                unique_articles[url] = article
        
        return {
            "accuracyScore": accuracy_score,
            "isCorrect": accuracy_score >= 0.7 and len(contradicting_claims) == 0,
            "verifiedClaims": verified_claims,
            "unverifiedClaims": unverified_claims,
            "contradictingClaims": contradicting_claims,
            "matchedArticles": list(unique_articles.values())[:10],  # Top 10
            "verificationStatus": status,
            "totalClaims": total_claims,
            "verifiedCount": len(verified_claims),
            "contradictedCount": len(contradicting_claims),
            "correlationScore": accuracy_score,  # Backward compatibility
            "supportingReferences": [
                {
                    "title": article.get("title", ""),
                    "url": article.get("url", ""),
                    "source": article.get("source", "Unknown"),
                    "publishedAt": article.get("publishedAt", ""),
                    "relevanceScore": article.get("relevanceScore", 0.0)
                }
                for article in list(unique_articles.values())[:5]
            ]
        }
    
    async def _extract_claims(
        self,
        transcript: str,
        airlines: List[str],
        themes: List[str]
    ) -> List[Dict]:
        """Extract factual claims from transcript using AI."""
        try:
            prompt = f"""Extract all factual claims, statements, or assertions from the following aviation conversation transcript.

Focus on:
- Specific events, announcements, or news
- Numbers, dates, or quantities
- Business decisions (hiring, expansion, financial)
- Operational changes
- Safety incidents
- Technical issues

Transcript:
{transcript[:3000]}

Detected Airlines: {', '.join(airlines) if airlines else 'None'}
Detected Themes: {', '.join(themes) if themes else 'None'}

Return a JSON object with a "claims" array, each claim with:
- "text": the claim statement
- "type": "event|announcement|number|decision|safety|other"
- "airline": airline name if mentioned
- "confidence": 0.0-1.0

Format: {{"claims": [{{"text": "...", "type": "...", "airline": "...", "confidence": 0.8}}]}}
"""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a fact-checking assistant. Extract factual claims from text. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            claims = result.get("claims", [])
            
            # Filter high-confidence claims
            filtered_claims = [c for c in claims if c.get("confidence", 0) >= 0.5]
            logger.info(f"Extracted {len(filtered_claims)} claims from transcript")
            return filtered_claims
            
        except Exception as e:
            logger.error(f"Claim extraction failed: {str(e)}", exc_info=True)
            return []
    
    async def _verify_claim_against_news(
        self,
        claim: Dict,
        news_articles: List[Dict],
        airlines: List[str]
    ) -> Dict:
        """Verify a single claim against news articles."""
        claim_text = claim.get("text", "")
        if not claim_text:
            return {"status": "unverified", "confidence": 0.0, "articles": []}
        
        # Find relevant articles using semantic similarity
        claim_embedding = await self._get_embedding(claim_text[:2000])
        
        relevant_articles = []
        for article in news_articles:
            article_text = f"{article.get('title', '')} {article.get('fullText', '')[:2000]}"
            article_embedding = await self._get_embedding(article_text)
            
            similarity = self._cosine_similarity(claim_embedding, article_embedding)
            if similarity >= 0.6:  # Threshold for relevance
                article["similarity"] = similarity
                relevant_articles.append(article)
        
        if not relevant_articles:
            return {"status": "unverified", "confidence": 0.0, "articles": []}
        
        # Use AI to verify if claim matches news
        articles_text = "\n\n".join([
            f"Title: {a.get('title', '')}\nSource: {a.get('source', '')}\n{a.get('fullText', '')[:1000]}"
            for a in sorted(relevant_articles, key=lambda x: x.get('similarity', 0), reverse=True)[:5]
        ])
        
        try:
            verification_prompt = f"""Verify if the following claim is supported or contradicted by the news articles below.

Claim: {claim_text}

News Articles:
{articles_text}

Respond with JSON:
{{
    "status": "verified|contradicted|unclear",
    "confidence": 0.0-1.0,
    "reason": "brief explanation",
    "articleUrls": ["url1", "url2"]
}}
"""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a fact-checker. Verify claims against news sources. Return only valid JSON."},
                    {"role": "user", "content": verification_prompt}
                ],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            
            # Map article URLs to full article objects
            verified_articles = []
            article_urls = result.get("articleUrls", [])
            for url in article_urls:
                matching = [a for a in relevant_articles if a.get("url") == url]
                verified_articles.extend(matching)
            
            # If no URLs but high similarity, use top similar articles
            if not verified_articles and relevant_articles:
                verified_articles = relevant_articles[:3]
            
            return {
                "status": result.get("status", "unclear"),
                "confidence": result.get("confidence", 0.0),
                "reason": result.get("reason", ""),
                "articles": verified_articles[:3]  # Top 3 supporting articles
            }
            
        except Exception as e:
            logger.error(f"Claim verification failed: {str(e)}", exc_info=True)
            # Fallback: if high similarity, consider verified
            if relevant_articles[0].get("similarity", 0) >= 0.8:
                return {
                    "status": "verified",
                    "confidence": 0.7,
                    "reason": "High semantic similarity found",
                    "articles": relevant_articles[:3]
                }
            return {"status": "unverified", "confidence": 0.0, "articles": []}

