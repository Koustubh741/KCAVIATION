"""AI analysis service for extracting insights from transcribed text."""
from typing import Dict, List, Any, Optional
from datetime import datetime
from openai import OpenAI
from src.config.settings import settings
from src.config.airlines import (
    detect_airlines_in_text, 
    detect_airlines_with_ai,
    get_primary_airline, 
    segment_text_by_airline, 
    map_airlines_to_themes, 
    map_themes_to_airlines
)
from src.config.themes import detect_themes_in_text


class AnalysisService:
    """Service for AI-powered analysis of transcribed text."""
    
    def __init__(self):
        """Initialize analysis service."""
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.analysis_model
    
    async def analyze_transcription(
        self, 
        transcription: str,
        airline_filter: Optional[str] = None,
        theme_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze transcribed text and extract insights.
        
        Args:
            transcription: Transcribed text
            airline_filter: Optional airline name to filter by
            theme_filter: Optional theme to filter by
            
        Returns:
            Analysis results with summary, keywords, themes, etc.
        """
        # Detect airlines using AI (primary method) with keyword fallback
        import logging
        logger = logging.getLogger(__name__)
        
        detected_airlines = []
        ai_detected_airlines = []
        keyword_detected_airlines = []
        
        try:
            # Try AI detection first
            logger.info(f"Attempting AI airline detection for text: {transcription[:100]}...")
            ai_detected_airlines = await detect_airlines_with_ai(
                transcription,
                self.client,
                self.model
            )
            logger.info(f"AI detection returned {len(ai_detected_airlines)} airlines")
        except Exception as e:
            logger.error(f"AI airline detection exception: {str(e)}", exc_info=True)
            ai_detected_airlines = []
        
        # Always do keyword-based detection as backup
        try:
            keyword_detected_airlines = detect_airlines_in_text(transcription)
            logger.info(f"Keyword detection returned {len(keyword_detected_airlines)} airlines")
        except Exception as e:
            logger.error(f"Keyword airline detection exception: {str(e)}", exc_info=True)
            keyword_detected_airlines = []
        
        # Merge results: prefer AI results, but include keyword results if not found by AI
        if ai_detected_airlines:
            detected_airlines = ai_detected_airlines.copy()
            ai_airline_names = {a.get("airline", "").lower() for a in ai_detected_airlines if a.get("airline")}
            
            # Add keyword-detected airlines that weren't found by AI
            for keyword_airline in keyword_detected_airlines:
                keyword_name = keyword_airline.get("airline", "").lower()
                if keyword_name and keyword_name not in ai_airline_names:
                    keyword_airline["detection_method"] = "keyword"
                    detected_airlines.append(keyword_airline)
        else:
            # If AI detection failed or returned nothing, use keyword-based
            detected_airlines = keyword_detected_airlines
            for airline in detected_airlines:
                if isinstance(airline, dict):
                    airline["detection_method"] = "keyword"
        
        # Log final result
        if detected_airlines:
            logger.info(f"Final detected airlines: {[a.get('airline', 'Unknown') for a in detected_airlines]}")
        else:
            logger.warning(f"No airlines detected for transcription: {transcription[:200]}...")
        
        # Detect themes
        detected_themes = detect_themes_in_text(transcription)
        
        # Filter if specified
        if airline_filter:
            detected_airlines = [
                a for a in detected_airlines 
                if a["airline"].lower() == airline_filter.lower()
            ]
        
        if theme_filter:
            detected_themes = [
                t for t in detected_themes 
                if t.lower() == theme_filter.lower()
            ]
        
        # Determine primary airline when multiple are detected
        primary_airline = get_primary_airline(detected_airlines) if detected_airlines else None
        
        # If multiple airlines detected, use AI to determine primary focus
        if len(detected_airlines) > 1:
            primary_airline = await self._determine_primary_airline(
                transcription, 
                detected_airlines
            )
        
        # Generate AI summary with primary airline context
        analysis_prompt = self._build_analysis_prompt(
            transcription, 
            detected_airlines, 
            detected_themes,
            primary_airline
        )
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert aviation market intelligence analyst. Analyze aviation market intelligence and extract key insights, market signals, and keywords. Provide structured responses with SUMMARY, MARKET SIGNALS, and KEYWORDS sections as requested."
                    },
                    {
                        "role": "user",
                        "content": analysis_prompt
                    }
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            ai_response = response.choices[0].message.content
            
            # Parse AI response and build structured analysis
            analysis = self._parse_ai_response(
                ai_response,
                transcription,
                detected_airlines,
                detected_themes,
                primary_airline
            )
            
            # Add news correlation if enabled
            analysis = await self._add_news_correlation(
                analysis,
                transcription,
                detected_airlines,
                detected_themes
            )
            
            return analysis
            
        except Exception as e:
            # Log error but continue with fallback
            import logging
            logging.error(f"AI analysis error: {str(e)}")
            # Fallback to rule-based analysis if AI fails
            analysis = self._fallback_analysis(
                transcription,
                detected_airlines,
                detected_themes,
                primary_airline
            )
            
            # Add news correlation even for fallback
            analysis = await self._add_news_correlation(
                analysis,
                transcription,
                detected_airlines,
                detected_themes
            )
            
            return analysis
    
    def _build_analysis_prompt(
        self,
        transcription: str,
        airlines: List[Dict],
        themes: List[str],
        primary_airline: Optional[Dict] = None
    ) -> str:
        """Build prompt for AI analysis."""
        airline_names = ', '.join([a['airline'] for a in airlines[:3]]) if airlines else 'None detected'
        theme_names = ', '.join(themes[:3]) if themes else 'General'
        
        # Add primary airline context if multiple airlines detected
        primary_context = ""
        if primary_airline and len(airlines) > 1:
            primary_context = f" Primary focus: {primary_airline.get('airline', 'Unknown')} (most relevant)."
        
        prompt = f"""Analyze this aviation market intelligence transcription and provide a comprehensive analysis:

TRANSCRIPTION: "{transcription}"

CONTEXT: 
- Airlines mentioned: {airline_names}.{primary_context}
- Themes detected: {theme_names}

REQUIREMENTS:
1. SUMMARY: Write a detailed 3-5 sentence intelligence summary covering:
   - All airlines mentioned and their activities
   - Key market dynamics and competitive landscape
   - Pilot concerns, hiring patterns, and industry trends
   - Market implications and risks
   (Write in plain text, complete sentences, no truncation)

2. MARKET SIGNALS: Identify 3-5 key market signals with strength and trend:
   Format each as: - [Signal description] | Strength: [Strong/Moderate/Weak] | Trend: [up/down/stable]
   
   Examples:
   - Increased pilot demand indicators | Strength: Strong | Trend: up
   - Fleet expansion without salary revisions | Strength: Moderate | Trend: down
   - Talent drain to international carriers | Strength: Strong | Trend: up
   - Pilot union demands for better conditions | Strength: Moderate | Trend: up

3. KEYWORDS: Extract 8-12 key terms from the transcription that are most relevant:
   Include: airline names, aircraft types, key concepts, themes, concerns
   Format: keyword1, keyword2, keyword3, ...

OUTPUT FORMAT (exactly as shown):
SUMMARY: [complete 3-5 sentence summary without truncation]

MARKET SIGNALS:
- [Signal 1] | Strength: [Strong/Moderate/Weak] | Trend: [up/down/stable]
- [Signal 2] | Strength: [Strong/Moderate/Weak] | Trend: [up/down/stable]
- [Signal 3] | Strength: [Strong/Moderate/Weak] | Trend: [up/down/stable]

KEYWORDS: [keyword1, keyword2, keyword3, keyword4, keyword5, keyword6, keyword7, keyword8]"""
        
        return prompt
    
    async def _determine_primary_airline(
        self,
        transcription: str,
        detected_airlines: List[Dict]
    ) -> Optional[Dict]:
        """
        Use AI to determine which airline is the primary focus when multiple are mentioned.
        
        Args:
            transcription: Full transcription text
            detected_airlines: List of detected airlines
            
        Returns:
            Primary airline dict or None
        """
        if len(detected_airlines) <= 1:
            return detected_airlines[0] if detected_airlines else None
        
        try:
            airline_list = ', '.join([a['airline'] for a in detected_airlines[:3]])
            
            prompt = f"""Analyze this text and determine which airline is the PRIMARY focus:

"{transcription}"

Detected airlines: {airline_list}

Respond with ONLY the airline name that is the primary subject of this text. If multiple airlines are equally important, respond with the first one mentioned."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at analyzing text to identify the primary subject. Respond with only the airline name, nothing else."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=50
            )
            
            ai_response = response.choices[0].message.content.strip()
            
            # Find matching airline
            for airline in detected_airlines:
                if airline['airline'].lower() in ai_response.lower() or ai_response.lower() in airline['airline'].lower():
                    return airline
            
            # Fallback to highest scored airline
            return detected_airlines[0]
            
        except Exception as e:
            import logging
            logging.warning(f"Failed to determine primary airline with AI: {str(e)}")
            # Fallback to highest scored airline
            return detected_airlines[0] if detected_airlines else None
    
    def _parse_ai_response(
        self,
        ai_response: str,
        transcription: str,
        airlines: List[Dict],
        themes: List[str],
        primary_airline: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Parse AI response into structured format."""
        # Extract and clean summary
        summary = self._extract_summary(ai_response, transcription)
        
        # Extract keywords (look for keyword section)
        keywords = self._extract_keywords(ai_response, transcription)
        
        # Extract market signals
        market_signals = self._extract_market_signals(ai_response)
        
        # Extract sentiment
        sentiment = self._extract_sentiment(ai_response)
        
        # Extract predictive probabilities
        predictive_probabilities = self._extract_predictions(ai_response)
        
        # Build airline-theme relationships (One-to-Many and Many-to-One)
        # Ensure we have valid airlines and themes
        valid_airlines = [a for a in airlines if a and isinstance(a, dict) and a.get("airline")]
        valid_themes = [t for t in themes if t and isinstance(t, str) and t.strip()]
        
        # If no airlines detected, try to extract from AI response
        if not valid_airlines and ai_response:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning("No airlines detected, attempting to extract from AI response")
            try:
                # Try to extract airline names from AI response
                extraction_prompt = f"""Extract airline names from this analysis text. Return only airline names, one per line.

Analysis: "{ai_response[:1000]}"

Original text: "{transcription[:500]}"

Return airline names only:"""
                
                extraction_response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "Extract airline names from text. Return only airline names, one per line."},
                        {"role": "user", "content": extraction_prompt}
                    ],
                    temperature=0.2,
                    max_tokens=200
                )
                
                extracted_text = extraction_response.choices[0].message.content.strip()
                airline_names = [line.strip() for line in extracted_text.split('\n') if line.strip()]
                
                # Convert to airline dicts
                from src.config.airlines import _normalize_airline_name
                for name in airline_names[:5]:
                    if not name:
                        continue
                    normalized = _normalize_airline_name(name)
                    if normalized:
                        valid_airlines.append({
                            "airline": normalized,
                            "relevance": "Medium",
                            "score": 0.5,
                            "matches": 1,
                            "mention_count": 1,
                            "first_mention_position": 0,
                            "detection_method": "ai_extraction"
                        })
                
                if valid_airlines:
                    logger.info(f"Extracted {len(valid_airlines)} airlines from AI response")
            except Exception as e:
                logger.error(f"Failed to extract airlines from AI response: {str(e)}")
        
        airline_theme_map = {}
        theme_airline_map = {}
        
        if valid_airlines and valid_themes:
            airline_theme_map = map_airlines_to_themes(transcription, valid_airlines, valid_themes)
            theme_airline_map = map_themes_to_airlines(transcription, valid_airlines, valid_themes)
        
        # Build airline specifications with primary airline marked
        airline_specs = self._build_airline_specifications(valid_airlines, ai_response, primary_airline)
        
        # Normalize airline names in specs to match mapping keys
        from src.config.airlines import AIRLINE_KEYWORDS
        
        # Create a mapping from any airline name variation to normalized name
        airline_name_normalization = {}
        for spec in airline_specs:
            airline_name = spec.get("airline", "")
            if airline_name:
                # Find matching airline in AIRLINE_KEYWORDS (case-insensitive)
                for known_airline in AIRLINE_KEYWORDS.keys():
                    if known_airline.lower() == airline_name.lower():
                        airline_name_normalization[airline_name] = known_airline
                        break
                # If no match found, use original name
                if airline_name not in airline_name_normalization:
                    airline_name_normalization[airline_name] = airline_name
        
        # Add themes to each airline specification using normalized names
        for spec in airline_specs:
            airline_name = spec.get("airline")
            if airline_name:
                # Get normalized name
                normalized_name = airline_name_normalization.get(airline_name, airline_name)
                
                # Get themes for this airline from the map (try both original and normalized)
                themes_for_airline = airline_theme_map.get(normalized_name, [])
                if not themes_for_airline:
                    themes_for_airline = airline_theme_map.get(airline_name, [])
                
                # Only set themes if we found some (don't use "General" as default)
                if themes_for_airline:
                    spec["themes"] = themes_for_airline
                else:
                    # If no themes found, try to infer from detected themes
                    spec["themes"] = valid_themes[:2] if valid_themes else []
        
        return {
            "summary": summary,  # Already cleaned and limited
            "keywords": keywords[:12],  # Increased to 12 keywords
            "themes": themes[:3],
            "marketSignals": market_signals[:5],
            "sentiment": sentiment,
            "confidenceScore": 0.85,
            "predictiveProbabilities": predictive_probabilities[:5],
            "airlineSpecifications": airline_specs,
            "primaryAirline": primary_airline.get("airline") if primary_airline else None,
            "allAirlines": [a.get("airline") for a in airlines[:5]],
            "timestamp": datetime.now().isoformat(),
            "originalTheme": themes[0] if themes else None,
            # New: Airline-Theme relationships
            "airlineThemeMap": airline_theme_map,  # One-to-Many: Airline → [Themes]
            "themeAirlineMap": theme_airline_map,   # Many-to-One: Theme → [Airlines]
            "correlation": None  # Will be populated by _add_news_correlation
        }
    
    def _extract_summary(self, ai_response: str, transcription: str) -> str:
        """Extract and clean summary from AI response."""
        import re
        
        if not ai_response or not ai_response.strip():
            # Generate a simple summary from transcription
            return self._generate_fallback_summary(transcription)
        
        # Start with the response
        text = ai_response.strip()
        
        # Remove markdown headers (###, ##, #) and "Intelligence Summary" labels
        text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'^intelligence\s+summary\s*:?\s*', '', text, flags=re.IGNORECASE | re.MULTILINE)
        
        # Remove markdown bold/italic (**text**, *text*)
        text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
        text = re.sub(r'\*([^*]+)\*', r'\1', text)
        
        # Remove code blocks (```json, ```text, etc.)
        text = re.sub(r'```[a-z]*\n?', '', text, flags=re.IGNORECASE)
        text = re.sub(r'```', '', text)
        
        # Extract from JSON if present (handle multiline JSON)
        json_match = re.search(r'["\']summary["\']\s*:\s*["\']([^"\']+)["\']', text, re.IGNORECASE | re.DOTALL)
        if json_match:
            text = json_match.group(1).strip()
        
        # Remove JSON structure markers and quotes
        text = re.sub(r'\{[^}]*"summary"[^}]*:\s*"?', '', text, flags=re.IGNORECASE)
        text = re.sub(r'^["\']|["\']$', '', text)  # Remove surrounding quotes
        
        # Look for "SUMMARY:" section and extract everything until MARKET SIGNALS or KEYWORDS
        summary_match = re.search(
            r'SUMMARY:\s*(.+?)(?=\n(?:MARKET SIGNALS|KEYWORDS)|$)',
            text,
            re.IGNORECASE | re.DOTALL
        )
        if summary_match:
            text = summary_match.group(1).strip()
        else:
            # Fallback: Look for "Summary:" or "Intelligence Summary:" label
            summary_match = re.search(
                r'(?:summary|intelligence summary)[:\-]\s*(.+?)(?:\n\n|\n(?:MARKET SIGNALS|KEYWORDS|[A-Z][a-z]+:)|$)',
                text,
                re.IGNORECASE | re.DOTALL
            )
            if summary_match:
                text = summary_match.group(1).strip()
        
        # Remove any remaining labels or prefixes
        text = re.sub(r'^(summary|intelligence summary)[:\-]\s*', '', text, flags=re.IGNORECASE)
        
        # Split into sentences - take all sentences (3-5 as requested)
        sentences = re.split(r'[.!?]+\s+', text)
        sentences = [s.strip() for s in sentences if s.strip() and len(s.strip()) > 10]
        
        # Take 3-5 meaningful sentences (not just 2-3)
        if sentences:
            summary = '. '.join(sentences[:5])  # Up to 5 sentences
            if summary and not summary.endswith(('.', '!', '?')):
                summary += '.'
        else:
            # If no sentences found, use the whole text (cleaned)
            summary = text
        
        # Clean up any remaining markdown or special characters
        summary = re.sub(r'[#*`\[\](){}]', '', summary)
        summary = re.sub(r'\s+', ' ', summary)  # Normalize whitespace
        summary = summary.strip()
        
        # Don't truncate - let the full summary through (up to 800 chars for safety)
        if len(summary) > 800:
            # Try to cut at sentence boundary
            cut_point = summary[:797].rfind('.')
            if cut_point > 200:
                summary = summary[:cut_point + 1]
            else:
                summary = summary[:797] + '...'
        
        # If summary is too short or empty, generate from transcription
        if not summary or len(summary) < 20:
            summary = self._generate_fallback_summary(transcription)
        
        return summary
    
    def _generate_fallback_summary(self, transcription: str) -> str:
        """Generate a simple summary from transcription when AI response is unclear."""
        # Extract key information
        transcription_lower = transcription.lower()
        
        # Detect key elements
        airlines_mentioned = []
        themes_mentioned = []
        
        # Simple keyword detection for summary
        if any(word in transcription_lower for word in ['hiring', 'recruitment', 'hiring']):
            themes_mentioned.append('hiring')
        if any(word in transcription_lower for word in ['layoff', 'firing', 'termination']):
            themes_mentioned.append('firing')
        if any(word in transcription_lower for word in ['aircraft', 'fleet', 'planes']):
            themes_mentioned.append('fleet expansion')
        
        # Build simple summary
        parts = []
        if 'indigo' in transcription_lower:
            parts.append('Indigo')
        elif 'air india' in transcription_lower:
            parts.append('Air India')
        elif 'spicejet' in transcription_lower:
            parts.append('SpiceJet')
        
        if themes_mentioned:
            parts.append(f"is involved in {themes_mentioned[0]}")
        
        if parts:
            summary = ' '.join(parts) + '. ' + transcription[:150]
        else:
            summary = transcription[:200]
        
        # Ensure it ends properly
        if len(summary) > 250:
            summary = summary[:247] + '...'
        
        return summary
    
    def _extract_keywords(self, ai_response: str, transcription: str) -> List[str]:
        """Extract keywords from AI response and transcription."""
        import re
        keywords = []
        
        # First, try to extract from AI response KEYWORDS section
        keyword_match = re.search(
            r'KEYWORDS:\s*([^\n]+(?:\n[^\n]+)*)',
            ai_response,
            re.IGNORECASE | re.MULTILINE
        )
        if keyword_match:
            keywords_text = keyword_match.group(1).strip()
            # Split by comma and clean
            keywords = [k.strip() for k in keywords_text.split(',') if k.strip()]
            # Remove any trailing content after keywords
            keywords = [k.split('\n')[0].strip() for k in keywords]
            if keywords:
                return keywords[:12]
        
        # Fallback: Extract from transcription using intelligent keyword detection
        transcription_lower = transcription.lower()
        
        # Extract airline names
        from src.config.airlines import AIRLINE_KEYWORDS
        for airline, airline_keywords in AIRLINE_KEYWORDS.items():
            if any(kw in transcription_lower for kw in airline_keywords):
                keywords.append(airline)
        
        # Extract aircraft types
        aircraft_types = ['a320', 'a350', 'a380', '787', 'boeing', 'airbus', 'wide-body', 'narrow-body']
        for aircraft in aircraft_types:
            if aircraft in transcription_lower:
                keywords.append(aircraft.title() if len(aircraft) > 3 else aircraft.upper())
        
        # Extract key aviation terms from transcription
        important_terms = [
            'hiring', 'recruitment', 'pilot', 'crew', 'fleet', 'expansion',
            'aircraft', 'salary', 'revision', 'rest period', 'fatigue',
            'union', 'protest', 'resignation', 'safety', 'talent drain',
            'competitive', 'market', 'wide-body', 'tax-free', 'roster',
            'contract', 'reconstructing', 'firing', 'indirect firing'
        ]
        
        for term in important_terms:
            if term in transcription_lower and term not in [k.lower() for k in keywords]:
                # Capitalize properly
                if ' ' in term:
                    keywords.append(' '.join(word.capitalize() for word in term.split()))
                else:
                    keywords.append(term.capitalize())
        
        # Extract key phrases (2-3 word combinations)
        key_phrases = [
            'pilot demand', 'fleet expansion', 'salary revision', 'rest period',
            'talent drain', 'pilot union', 'safety risk', 'market competition',
            'wide-body pilot', 'tax-free salary', 'better roster'
        ]
        
        for phrase in key_phrases:
            if phrase in transcription_lower and phrase not in [k.lower() for k in keywords]:
                keywords.append(' '.join(word.capitalize() for word in phrase.split()))
        
        # Remove duplicates while preserving order
        seen = set()
        unique_keywords = []
        for kw in keywords:
            kw_lower = kw.lower()
            if kw_lower not in seen:
                seen.add(kw_lower)
                unique_keywords.append(kw)
        
        return unique_keywords[:12]
    
    def _extract_market_signals(self, ai_response: str) -> List[Dict]:
        """Extract market signals from AI response."""
        signals = []
        import re
        
        # Look for MARKET SIGNALS section
        signals_section = re.search(
            r'MARKET SIGNALS:?\s*\n(.*?)(?=\n(?:KEYWORDS|SUMMARY|$))',
            ai_response,
            re.IGNORECASE | re.DOTALL
        )
        
        if signals_section:
            signals_text = signals_section.group(1)
            # Parse each signal line
            signal_lines = re.findall(
                r'[-•]\s*(.+?)\s*\|\s*Strength:\s*(Strong|Moderate|Weak)\s*\|\s*Trend:\s*(up|down|stable)',
                signals_text,
                re.IGNORECASE
            )
            
            for match in signal_lines:
                signal_text = match[0].strip()
                strength = match[1].capitalize() if match[1] else "Moderate"
                trend = match[2].lower() if match[2] else "stable"
                signals.append({
                    "signal": signal_text,
                    "strength": strength,
                    "trend": trend
                })
        
        # Alternative pattern: Look for signal patterns in any format
        if not signals:
            # Pattern 1: "Signal text: Strong/Moderate/Weak (up/down/stable)"
            pattern1 = r'([^:\n]+?):\s*(Strong|Moderate|Weak)\s*(?:\(?(up|down|stable)\)?)?'
            matches1 = re.findall(pattern1, ai_response, re.IGNORECASE)
            
            for match in matches1[:5]:
                signal_text = match[0].strip()
                # Skip if it's a label like "Strength:" or "Trend:"
                if any(label in signal_text.lower() for label in ['strength', 'trend', 'signal', 'market']):
                    continue
                strength = match[1].capitalize() if match[1] else "Moderate"
                trend = match[2].lower() if match[2] else "stable"
                signals.append({
                    "signal": signal_text,
                    "strength": strength,
                    "trend": trend
                })
        
        # Pattern 2: Look for common signal phrases and infer strength/trend
        if not signals:
            transcription_lower = ai_response.lower()
            
            # Detect hiring signals
            if any(word in transcription_lower for word in ['hiring', 'recruitment', 'pilot demand', 'crew demand']):
                strength = "Strong" if any(word in transcription_lower for word in ['significant', 'major', 'massive', 'surge']) else "Moderate"
                signals.append({
                    "signal": "Increased pilot demand indicators",
                    "strength": strength,
                    "trend": "up"
                })
            
            # Detect fleet expansion
            if any(word in transcription_lower for word in ['fleet', 'aircraft', 'expansion', 'delivery', 'order']):
                strength = "Strong" if any(word in transcription_lower for word in ['major', 'significant', 'large']) else "Moderate"
                signals.append({
                    "signal": "Fleet expansion announcements expected",
                    "strength": strength,
                    "trend": "up"
                })
            
            # Detect training constraints
            if any(word in transcription_lower for word in ['training', 'simulator', 'capacity', 'constraint']):
                signals.append({
                    "signal": "Training capacity constraints",
                    "strength": "Moderate",
                    "trend": "stable"
                })
            
            # Detect financial signals
            if any(word in transcription_lower for word in ['financial', 'revenue', 'profit', 'loss', 'earnings']):
                strength = "Strong" if any(word in transcription_lower for word in ['strong', 'positive', 'growth']) else "Moderate"
                trend = "up" if any(word in transcription_lower for word in ['positive', 'growth', 'increase']) else "down"
                signals.append({
                    "signal": "Financial performance indicators",
                    "strength": strength,
                    "trend": trend
                })
        
        # Fallback: Generate at least one signal
        if not signals:
            signals = [
                {"signal": "Market activity detected", "strength": "Moderate", "trend": "stable"}
            ]
        
        return signals[:5]  # Limit to 5 signals
    
    def _extract_sentiment(self, ai_response: str) -> Dict:
        """Extract sentiment from AI response."""
        import re
        sentiment_match = re.search(
            r'sentiment[:\-]\s*(positive|negative|neutral)', 
            ai_response, 
            re.IGNORECASE
        )
        sentiment = sentiment_match.group(1).capitalize() if sentiment_match else "Neutral"
        
        score_match = re.search(r'score[:\-]\s*([0-9.]+)', ai_response, re.IGNORECASE)
        score = float(score_match.group(1)) if score_match else 0.5
        
        return {
            "overall": sentiment,
            "score": min(max(score, 0), 1),  # Clamp between 0 and 1
            "breakdown": {
                "positive": int(score * 100) if sentiment == "Positive" else 20,
                "neutral": 30,
                "negative": int((1 - score) * 100) if sentiment == "Negative" else 20
            }
        }
    
    def _extract_predictions(self, ai_response: str) -> List[Dict]:
        """Extract predictive probabilities from AI response."""
        predictions = []
        import re
        # Look for probability patterns
        prob_pattern = r'([^:]+)[:\-]\s*(\d+)%'
        matches = re.findall(prob_pattern, ai_response)
        
        for match in matches[:5]:
            predictions.append({
                "event": match[0].strip(),
                "probability": int(match[1])
            })
        
        return predictions
    
    def _build_airline_specifications(
        self, 
        airlines: List[Dict], 
        ai_response: str,
        primary_airline: Optional[Dict] = None
    ) -> List[Dict]:
        """Build airline specifications from detected airlines."""
        specs = []
        
        # Safely extract primary airline name
        primary_airline_name = None
        if primary_airline:
            if isinstance(primary_airline, dict):
                primary_airline_name = primary_airline.get("airline", "").lower()
            elif isinstance(primary_airline, str):
                primary_airline_name = primary_airline.lower()
        
        for airline in airlines[:5]:
            # Safely extract airline name
            if not isinstance(airline, dict):
                continue
                
            airline_name = airline.get("airline", "")
            if not airline_name:
                continue
            
            airline_lower = airline_name.lower()
            is_primary = (primary_airline_name == airline_lower) if primary_airline_name else False
            
            # Extract signals for this airline from AI response
            signals = []
            if ai_response and airline_lower in ai_response.lower():
                # Look for signals related to this airline
                signals = ["Market activity", "Industry relevance"]
            
            # Boost relevance if it's the primary airline
            relevance = airline.get("relevance", "Low")
            if is_primary and relevance != "High":
                relevance = "High"
            
            specs.append({
                "airline": airline_name,  # Use extracted name, not from dict access
                "relevance": relevance,
                "isPrimary": is_primary,
                "signals": signals if signals else ["General"],
                "score": airline.get("score", 0),
                "mentionCount": airline.get("mention_count", 0)
            })
        
        # Sort by primary first, then by score
        specs.sort(key=lambda x: (not x.get("isPrimary", False), -x.get("score", 0)), reverse=True)
        return specs
    
    def _fallback_analysis(
        self,
        transcription: str,
        airlines: List[Dict],
        themes: List[str],
        primary_airline: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Fallback analysis using rule-based extraction."""
        # Generate a better summary from transcription
        summary = self._generate_fallback_summary(transcription)
        
        # Build airline-theme relationships
        # Ensure we have valid airlines and themes
        valid_airlines = [a for a in airlines if a and isinstance(a, dict) and a.get("airline")]
        valid_themes = [t for t in themes if t and isinstance(t, str) and t.strip()]
        
        airline_theme_map = {}
        theme_airline_map = {}
        
        if valid_airlines and valid_themes:
            airline_theme_map = map_airlines_to_themes(transcription, valid_airlines, valid_themes)
            theme_airline_map = map_themes_to_airlines(transcription, valid_airlines, valid_themes)
        
        # Build airline specifications with primary airline marked
        airline_specs = self._build_airline_specifications(valid_airlines, "", primary_airline)
        
        # Add themes to each airline specification
        for spec in airline_specs:
            airline_name = spec.get("airline")
            if airline_name:
                # Get themes for this airline from the map
                themes_for_airline = airline_theme_map.get(airline_name, [])
                # Only set themes if we found some
                if themes_for_airline:
                    spec["themes"] = themes_for_airline
                else:
                    # If no themes found, try to infer from detected themes
                    spec["themes"] = valid_themes[:2] if valid_themes else []
        
        return {
            "summary": summary,
            "keywords": self._extract_keywords("", transcription),
            "themes": themes[:3] if themes else ["General"],
            "marketSignals": [
                {"signal": "Content detected", "strength": "Moderate", "trend": "stable"}
            ],
            "sentiment": {
                "overall": "Neutral",
                "score": 0.5,
                "breakdown": {"positive": 33, "neutral": 34, "negative": 33}
            },
            "confidenceScore": 0.6,
            "predictiveProbabilities": [],
            "airlineSpecifications": airline_specs,
            "primaryAirline": primary_airline.get("airline") if primary_airline else None,
            "allAirlines": [a.get("airline") for a in airlines[:5]],
            "timestamp": datetime.now().isoformat(),
            "originalTheme": themes[0] if themes else None,
            # New: Airline-Theme relationships
            "airlineThemeMap": airline_theme_map,  # One-to-Many: Airline → [Themes]
            "themeAirlineMap": theme_airline_map,   # Many-to-One: Theme → [Airlines]
            "correlation": None  # Will be populated by _add_news_correlation
        }
    
    async def _add_news_correlation(
        self,
        analysis: Dict[str, Any],
        transcription: str,
        detected_airlines: List[Dict],
        detected_themes: List[str]
    ) -> Dict[str, Any]:
        """Add news correlation to analysis if enabled."""
        from src.config.settings import settings
        from src.services.news_correlation import NewsCorrelationService
        from src.services.correlation import CorrelationEngine
        import logging
        
        logger = logging.getLogger(__name__)
        
        # Skip if correlation is disabled or no API key
        if not settings.correlation_enabled:
            logger.info("News correlation is disabled (CORRELATION_ENABLED=false)")
            return analysis
        
        if not settings.newsapi_key:
            logger.warning("News correlation skipped - NEWSAPI_KEY not configured in .env")
            return analysis
        
        logger.info(f"Starting news correlation for {len(detected_airlines)} airlines and {len(detected_themes)} themes...")
        
        try:
            logger = logging.getLogger(__name__)
            logger.info("Starting news correlation...")
            
            # Initialize services
            news_service = NewsCorrelationService()
            correlation_engine = CorrelationEngine()
            
            # Extract airline names
            airline_names = [a.get("airline", "") for a in detected_airlines if a.get("airline")]
            
            # Build search query from themes and airlines
            search_terms = detected_themes + airline_names
            search_query = " ".join(search_terms[:5])  # Limit to 5 terms
            
            if not search_query.strip():
                logger.warning("No search terms for news correlation")
                return analysis
            
            # First, try targeted search for relevant news
            news_articles = await news_service.search_aviation_news(
                query=search_query,
                airlines=airline_names if airline_names else None,
                max_results=20
            )
            
            # If targeted search doesn't return enough results, get all aviation news
            if len(news_articles) < 10:
                logger.info("Targeted search returned few results, fetching all aviation news...")
                all_news = await news_service.get_all_aviation_news(max_results=100)
                # Combine and deduplicate by URL
                existing_urls = {a.get("url", "") for a in news_articles}
                for article in all_news:
                    if article.get("url", "") not in existing_urls:
                        news_articles.append(article)
                logger.info(f"Total news articles for verification: {len(news_articles)}")
            
            if not news_articles:
                logger.info("No news articles found for correlation")
                analysis["correlation"] = {
                    "correlationScore": 0.0,
                    "matchedArticles": [],
                    "verificationStatus": "unverified",
                    "supportingReferences": []
                }
                return analysis
            
            # Use comprehensive verification (extracts claims and verifies them)
            correlation_data = await correlation_engine.verify_gossip_correctness(
                transcription,
                news_articles,
                airline_names,
                detected_themes
            )
            
            analysis["correlation"] = correlation_data
            logger.info(f"News correlation completed: {correlation_data.get('verificationStatus')} ({correlation_data.get('correlationScore', 0):.2f})")
            
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"News correlation failed: {str(e)}", exc_info=True)
            # Don't fail the entire analysis if correlation fails
            analysis["correlation"] = {
                "correlationScore": 0.0,
                "matchedArticles": [],
                "verificationStatus": "unverified",
                "supportingReferences": [],
                "error": "Correlation service unavailable"
            }
        
        return analysis

