"""Airline configuration and keywords for content extraction."""
from typing import Dict, List, Optional
import json
import re


# Airline names and their associated keywords for detection
AIRLINE_KEYWORDS: Dict[str, List[str]] = {
    "Indigo": [
        "indigo", "6e", "indigo airlines", "indigo air", 
        "indigo flights", "indigo fleet", "indigo pilots"
    ],
    "Air India": [
        "air india", "air india express", "air india flights",
        "air india fleet", "tata group", "tata airlines"
    ],
    "SpiceJet": [
        "spicejet", "sg", "spice jet", "spicejet flights",
        "spicejet fleet", "spicejet pilots"
    ],
    "Vistara": [
        "vistara", "uk", "vistara flights", "vistara fleet",
        "tata sia", "tata singapore airlines"
    ],
    "Go First": [
        "go first", "g8", "goair", "go air", "go first flights"
    ],
    "Akasa Air": [
        "akasa", "akasa air", "qp", "akasa flights", "akasa fleet"
    ],
    "Alliance Air": [
        "alliance air", "9i", "alliance air flights"
    ],
    "AirAsia India": [
        "airasia india", "i5", "airasia", "air asia india"
    ],
    "TruJet": [
        "trujet", "2t", "tru jet", "trujet flights"
    ],
    "Star Air": [
        "star air", "s5", "star air flights"
    ],
    "Emirates": [
        "emirates", "emirates airlines", "emirates air", 
        "emirates flights", "emirates fleet", "emirates pilots"
    ],
    "Qatar Airways": [
        "qatar airways", "qatar air", "qatar flights", "qatar airline"
    ],
    "Singapore Airlines": [
        "singapore airlines", "singapore air", "sia", "singapore airline"
    ],
    "Lufthansa": [
        "lufthansa", "lufthansa airlines", "lufthansa flights", "lufthansa air"
    ],
    "British Airways": [
        "british airways", "british air", "british airways flights"
    ],
    "Air France": [
        "air france", "air france flights", "air france airlines"
    ],
    "Etihad": [
        "etihad", "etihad airways", "etihad flights", "etihad air"
    ]
}

# Country-specific airlines
COUNTRY_AIRLINES: Dict[str, List[str]] = {
    "India": list(AIRLINE_KEYWORDS.keys()),
    "International": [
        "Emirates", "Qatar Airways", "Singapore Airlines", 
        "Lufthansa", "British Airways", "Air France", "Etihad"
    ]
}


def get_airline_keywords() -> Dict[str, List[str]]:
    """Get all airline keywords for detection."""
    return AIRLINE_KEYWORDS


async def detect_airlines_with_ai(
    text: str,
    openai_client,
    model: str = "gpt-4o"
) -> List[Dict[str, any]]:
    """
    Detect airlines mentioned in text using OpenAI AI.
    This method can identify airlines even if they're not in the keyword list.
    
    Args:
        text: Input text to analyze
        openai_client: OpenAI client instance
        model: OpenAI model to use (default: gpt-4o)
        
    Returns:
        List of detected airlines with relevance scores
    """
    # Get list of known airlines for context
    known_airlines = list(AIRLINE_KEYWORDS.keys())
    airlines_list = ", ".join(known_airlines)
    
    # Limit text length to avoid token limits
    text_snippet = text[:2000] if len(text) > 2000 else text
    
    prompt = f"""You are an expert aviation intelligence analyst. Analyze this text and identify ALL airlines mentioned.

TEXT:
"{text_snippet}"

KNOWN AIRLINES (use these EXACT names when detected):
{airlines_list}

REQUIREMENTS:
1. Identify EVERY airline mentioned (directly or indirectly)
2. Include airline codes (e.g., "6E" = Indigo, "SG" = SpiceJet, "M8" = SkyJet)
3. Include indirect references (e.g., "blue airline" = Indigo, "Tata's airline" = Air India/Vistara)
4. For each airline, provide:
   - "airline": Exact airline name (use standard name from known list)
   - "relevance": "High", "Medium", or "Low"
   - "confidence": Number between 0.0 and 1.0
   - "reason": Brief explanation

IMPORTANT: If NO airlines are mentioned, return an empty array. Otherwise, return ALL detected airlines.

Return ONLY a valid JSON object with this exact structure:
{{
  "airlines": [
    {{
      "airline": "Airline Name",
      "relevance": "High",
      "confidence": 0.9,
      "reason": "Mentioned directly in text"
    }}
  ]
}}"""

    try:
        response = openai_client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert aviation intelligence analyst. You MUST identify airlines in text. Always return valid JSON with an 'airlines' array. If no airlines are found, return empty array."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,  # Lower temperature for more consistent results
            max_tokens=800,  # Increased for better detection
            response_format={"type": "json_object"}
        )
        
        # Parse AI response
        ai_content = response.choices[0].message.content.strip()
        
        # Try to parse JSON
        try:
            parsed = json.loads(ai_content)
        except json.JSONDecodeError:
            # Try to extract JSON from text if wrapped
            import re
            json_match = re.search(r'\{[^{}]*"airlines"[^{}]*\[[^\]]*\][^{}]*\}', ai_content, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
            else:
                # Last resort: try to find airlines array
                airlines_match = re.search(r'"airlines"\s*:\s*\[(.*?)\]', ai_content, re.DOTALL)
                if airlines_match:
                    # Try to parse just the array
                    parsed = {"airlines": json.loads("[" + airlines_match.group(1) + "]")}
                else:
                    raise ValueError("Could not parse JSON response")
        
        # Extract airlines array
        airlines_data = parsed.get("airlines", [])
        if not isinstance(airlines_data, list):
            # If it's a single object, wrap it in a list
            if isinstance(airlines_data, dict):
                airlines_data = [airlines_data]
            else:
                airlines_data = []
        
        # Convert AI response to standard format
        detected_airlines = []
        text_lower = text.lower()
        
        for item in airlines_data:
            if isinstance(item, dict):
                airline_name = item.get("airline", "").strip()
                if not airline_name:
                    # Try alternative keys
                    airline_name = item.get("name", "").strip() or item.get("airlineName", "").strip()
                
                if airline_name:
                    # Normalize airline name (check if it matches known airlines)
                    normalized_name = _normalize_airline_name(airline_name)
                    
                    # Skip if normalization failed (empty name)
                    if not normalized_name:
                        continue
                    
                    relevance = item.get("relevance", "Medium")
                    # Handle case variations
                    if isinstance(relevance, str):
                        relevance = relevance.capitalize()
                        if relevance not in ["High", "Medium", "Low"]:
                            relevance = "Medium"
                    
                    try:
                        confidence = float(item.get("confidence", 0.7))
                        confidence = max(0.0, min(1.0, confidence))  # Clamp between 0 and 1
                    except (ValueError, TypeError):
                        confidence = 0.7
                    
                    # Calculate score based on relevance and confidence
                    relevance_scores = {"High": 0.8, "Medium": 0.5, "Low": 0.3}
                    base_score = relevance_scores.get(relevance, 0.5)
                    score = base_score * confidence
                    
                    # Find position in text (try both original and normalized name)
                    first_mention_pos = text_lower.find(airline_name.lower())
                    if first_mention_pos == -1:
                        first_mention_pos = text_lower.find(normalized_name.lower())
                    if first_mention_pos == -1:
                        first_mention_pos = len(text_lower)
                    
                    # Count mentions (try both names)
                    mention_count = text_lower.count(airline_name.lower())
                    if mention_count == 0:
                        mention_count = text_lower.count(normalized_name.lower())
                    if mention_count == 0:
                        mention_count = 1  # At least 1 if detected
                    
                    detected_airlines.append({
                        "airline": normalized_name,
                        "relevance": relevance,
                        "score": score,
                        "matches": 1,
                        "mention_count": mention_count,
                        "first_mention_position": first_mention_pos,
                        "detection_method": "ai",
                        "reason": item.get("reason", "Detected by AI analysis")
                    })
        
        # Sort by score (highest first)
        detected_airlines.sort(key=lambda x: x["score"], reverse=True)
        
        # Log for debugging
        if detected_airlines:
            import logging
            logging.info(f"AI detected {len(detected_airlines)} airlines: {[a['airline'] for a in detected_airlines]}")
        else:
            import logging
            logging.warning(f"AI detection returned no airlines for text: {text[:100]}...")
        
        return detected_airlines[:5]  # Return top 5
        
    except Exception as e:
        # If AI detection fails, log the error and return empty list (fallback to keyword-based)
        import logging
        logging.error(f"AI airline detection failed: {str(e)}", exc_info=True)
        # Log the text that failed (first 200 chars for debugging)
        logging.error(f"Failed text snippet: {text[:200] if text else 'Empty text'}")
        
        # Try a simpler fallback: ask AI directly without JSON format
        try:
            simple_prompt = f"""List all airline names mentioned in this text. Return only airline names, one per line.

Text: "{text[:1000]}"

Known airlines: {airlines_list[:200]}

Return airline names only:"""
            
            fallback_response = openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an expert at identifying airlines. Return only airline names, one per line."},
                    {"role": "user", "content": simple_prompt}
                ],
                temperature=0.2,
                max_tokens=200
            )
            
            fallback_text = fallback_response.choices[0].message.content.strip()
            # Extract airline names from lines
            airline_names = [line.strip() for line in fallback_text.split('\n') if line.strip()]
            
            # Convert to standard format
            detected_airlines = []
            for name in airline_names[:5]:
                normalized = _normalize_airline_name(name)
                if normalized:
                    detected_airlines.append({
                        "airline": normalized,
                        "relevance": "Medium",
                        "score": 0.5,
                        "matches": 1,
                        "mention_count": 1,
                        "first_mention_position": 0,
                        "detection_method": "ai_fallback",
                        "reason": "Detected via fallback method"
                    })
            
            if detected_airlines:
                logging.info(f"Fallback AI detection found {len(detected_airlines)} airlines")
                return detected_airlines
        except Exception as fallback_error:
            logging.error(f"Fallback AI detection also failed: {str(fallback_error)}")
        
        return []


def _normalize_airline_name(airline_name: str) -> str:
    """
    Normalize airline name to match known airlines.
    
    Args:
        airline_name: Detected airline name from AI
        
    Returns:
        Normalized airline name matching known airlines if possible
    """
    airline_lower = airline_name.lower()
    
    # Check against known airlines (fuzzy matching)
    for known_airline in AIRLINE_KEYWORDS.keys():
        known_lower = known_airline.lower()
        
        # Exact match
        if airline_lower == known_lower:
            return known_airline
        
        # Partial match (e.g., "Indigo Airlines" -> "Indigo")
        if known_lower in airline_lower or airline_lower in known_lower:
            return known_airline
        
        # Check keywords
        keywords = AIRLINE_KEYWORDS.get(known_airline, [])
        for keyword in keywords:
            if keyword.lower() in airline_lower or airline_lower in keyword.lower():
                return known_airline
    
    # If no match found, return original (capitalized properly)
    return airline_name.title()


def detect_airlines_in_text(text: str) -> List[Dict[str, any]]:
    """
    Detect airlines mentioned in text based on keywords.
    
    Args:
        text: Input text to analyze
        
    Returns:
        List of detected airlines with relevance scores
    """
    text_lower = text.lower()
    detected_airlines = []
    import re
    
    for airline, keywords in AIRLINE_KEYWORDS.items():
        matches = 0
        matched_keywords = []
        
        for keyword in keywords:
            keyword_lower = keyword.lower()
            
            # For short codes (2-3 characters), use word boundary matching
            # to avoid false positives (e.g., "af" matching in "staff", "craft")
            if len(keyword_lower) <= 3:
                # Use word boundary regex for short codes
                pattern = r'\b' + re.escape(keyword_lower) + r'\b'
                if re.search(pattern, text_lower):
                    matches += 1
                    matched_keywords.append(keyword)
            else:
                # For longer keywords, use exact phrase matching
                # This ensures "air france" only matches when both words appear together
                if keyword_lower in text_lower:
                    matches += 1
                    matched_keywords.append(keyword)
        
        # Only add airline if we have actual matches (not false positives)
        if matches > 0:
            # Calculate relevance score based on matches
            relevance_score = matches / len(keywords)
            
            # Boost score if airline name appears directly
            airline_name_lower = airline.lower()
            if airline_name_lower in text_lower:
                relevance_score += 0.2
            
            # Count frequency of mentions
            mention_count = text_lower.count(airline_name_lower)
            for keyword in keywords:
                mention_count += text_lower.count(keyword.lower())
            
            # Calculate position-based score (earlier mentions are more important)
            first_mention_pos = len(text_lower)
            for keyword in keywords:
                pos = text_lower.find(keyword.lower())
                if pos != -1 and pos < first_mention_pos:
                    first_mention_pos = pos
            
            # Normalize position score (earlier = higher score)
            position_score = 1.0 - (first_mention_pos / max(len(text_lower), 1))
            relevance_score += position_score * 0.1
            
            relevance = (
                "High" if relevance_score > 0.4 
                else "Medium" if relevance_score > 0.2 
                else "Low"
            )
            detected_airlines.append({
                "airline": airline,
                "relevance": relevance,
                "score": relevance_score,
                "matches": matches,
                "mention_count": mention_count,
                "first_mention_position": first_mention_pos
            })
    
    # Sort by relevance score (descending), then by mention count, then by position
    detected_airlines.sort(
        key=lambda x: (x["score"], x["mention_count"], -x["first_mention_position"]), 
        reverse=True
    )
    return detected_airlines[:5]  # Return top 5


def get_primary_airline(detected_airlines: List[Dict[str, any]]) -> Optional[Dict[str, any]]:
    """
    Determine the primary airline from detected airlines.
    
    Args:
        detected_airlines: List of detected airlines with scores
        
    Returns:
        Primary airline dict or None
    """
    if not detected_airlines:
        return None
    
    # If only one airline, it's the primary
    if len(detected_airlines) == 1:
        return detected_airlines[0]
    
    # Get the top airline
    primary = detected_airlines[0]
    
    # If top airline has significantly higher score, it's clearly primary
    if len(detected_airlines) > 1:
        second_score = detected_airlines[1].get("score", 0)
        if primary.get("score", 0) > second_score * 1.5:  # 50% higher
            return primary
    
    # If scores are close, prefer the one with more mentions
    if len(detected_airlines) > 1:
        primary_mentions = primary.get("mention_count", 0)
        second_mentions = detected_airlines[1].get("mention_count", 0)
        if primary_mentions >= second_mentions * 1.2:  # 20% more mentions
            return primary
    
    # Default to first one (highest score)
    return primary


def segment_text_by_airline(text: str, airlines: List[str]) -> Dict[str, str]:
    """
    Segment text into parts relevant to each airline.
    Uses sentence-level segmentation.
    
    Args:
        text: Full transcription text
        airlines: List of airline names to segment for
        
    Returns:
        Dict mapping airline name to relevant text segments
    """
    import re
    
    segments = {airline: [] for airline in airlines}
    text_lower = text.lower()
    
    # Split into sentences
    sentences = re.split(r'[.!?]+\s+', text)
    
    # Get keywords for each airline
    airline_keywords_map = {}
    for airline in airlines:
        keywords = AIRLINE_KEYWORDS.get(airline, [])
        airline_keywords_map[airline.lower()] = [k.lower() for k in keywords] + [airline.lower()]
    
    # Assign sentences to airlines
    for sentence in sentences:
        if not sentence.strip():
            continue
        
        sentence_lower = sentence.lower()
        airline_scores = {}
        
        for airline in airlines:
            airline_lower = airline.lower()
            keywords = airline_keywords_map.get(airline_lower, [])
            score = sum(1 for keyword in keywords if keyword in sentence_lower)
            if score > 0:
                airline_scores[airline] = score
        
        # Assign sentence to airline(s) with highest score
        if airline_scores:
            max_score = max(airline_scores.values())
            for airline, score in airline_scores.items():
                if score == max_score:
                    segments[airline].append(sentence.strip())
    
    # Join segments for each airline
    return {
        airline: '. '.join(segments[airline]) + '.' if segments[airline] else ''
        for airline in airlines
    }


def map_airlines_to_themes(text: str, airlines: List[Dict], themes: List[str]) -> Dict[str, List[str]]:
    """
    Map airlines to themes (One-to-Many: one airline can have multiple themes).
    
    Args:
        text: Full transcription text
        airlines: List of detected airlines (dicts with "airline" key)
        themes: List of detected themes
        
    Returns:
        Dict mapping airline name to list of associated themes
    """
    import re
    from src.config.themes import THEME_KEYWORDS
    
    if not airlines or not themes:
        return {}
    
    airline_theme_map = {}
    text_lower = text.lower()
    
    # Split text into sentences
    sentences = re.split(r'[.!?]+\s+', text)
    
    for airline in airlines:
        # Extract airline name safely
        if isinstance(airline, dict):
            airline_name = airline.get("airline", "")
        elif isinstance(airline, str):
            airline_name = airline
        else:
            continue
        
        if not airline_name:
            continue
        
        airline_name_lower = airline_name.lower()
        
        # Try to find matching airline in AIRLINE_KEYWORDS (case-insensitive)
        matching_airline = None
        for known_airline in AIRLINE_KEYWORDS.keys():
            if known_airline.lower() == airline_name_lower:
                matching_airline = known_airline
                break
        
        # Use matching airline name if found, otherwise use original
        normalized_airline_name = matching_airline if matching_airline else airline_name
        airline_keywords = AIRLINE_KEYWORDS.get(normalized_airline_name, [])
        all_airline_terms = [airline_name_lower] + [k.lower() for k in airline_keywords]
        
        # Also add normalized name to terms
        if matching_airline:
            all_airline_terms.append(matching_airline.lower())
        
        associated_themes = []
        
        # Check each sentence for airline + theme co-occurrence
        for sentence in sentences:
            if not sentence.strip():
                continue
                
            sentence_lower = sentence.lower()
            
            # Check if this sentence mentions the airline
            mentions_airline = any(term in sentence_lower for term in all_airline_terms)
            
            if mentions_airline:
                # Check which themes are mentioned in this sentence
                for theme in themes:
                    if not theme:
                        continue
                    theme_keywords = THEME_KEYWORDS.get(theme, [])
                    if any(kw.lower() in sentence_lower for kw in theme_keywords):
                        if theme not in associated_themes:
                            associated_themes.append(theme)
        
        # If no themes found in sentences with airline, check proximity
        if not associated_themes:
            # Find airline position
            airline_positions = []
            for term in all_airline_terms:
                pos = text_lower.find(term)
                if pos != -1:
                    airline_positions.append(pos)
            
            if airline_positions:
                min_airline_pos = min(airline_positions)
                # Check themes in nearby context (200 chars before/after)
                context_start = max(0, min_airline_pos - 200)
                context_end = min(len(text_lower), min_airline_pos + 200)
                context = text_lower[context_start:context_end]
                
                for theme in themes:
                    if not theme:
                        continue
                    theme_keywords = THEME_KEYWORDS.get(theme, [])
                    if any(kw.lower() in context for kw in theme_keywords):
                        if theme not in associated_themes:
                            associated_themes.append(theme)
        
        # Only add if we found themes (don't add "General" as default)
        if associated_themes:
            # Use normalized airline name for consistency (this ensures correct mapping)
            airline_theme_map[normalized_airline_name] = associated_themes
    
    return airline_theme_map


def map_themes_to_airlines(text: str, airlines: List[Dict], themes: List[str]) -> Dict[str, List[str]]:
    """
    Map themes to airlines (Many-to-One: multiple airlines can share same theme).
    
    Args:
        text: Full transcription text
        airlines: List of detected airlines (dicts with "airline" key)
        themes: List of detected themes
        
    Returns:
        Dict mapping theme name to list of associated airlines
    """
    if not airlines or not themes:
        return {}
    
    theme_airline_map = {}
    
    # First get airline-to-theme mapping
    airline_theme_map = map_airlines_to_themes(text, airlines, themes)
    
    # Initialize all themes
    for theme in themes:
        if theme:
            theme_airline_map[theme] = []
    
    # Reverse the mapping: for each airline-theme pair, add airline to theme's list
    for airline_name, airline_themes in airline_theme_map.items():
        for theme in airline_themes:
            if theme and theme in theme_airline_map:
                # Avoid duplicates
                if airline_name not in theme_airline_map[theme]:
                    theme_airline_map[theme].append(airline_name)
    
    # Remove empty themes
    theme_airline_map = {
        theme: airlines_list 
        for theme, airlines_list in theme_airline_map.items() 
        if airlines_list  # Only keep themes with airlines
    }
    
    return theme_airline_map

