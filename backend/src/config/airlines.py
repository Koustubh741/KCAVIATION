"""Airline configuration and keywords for content extraction."""
from typing import Dict, List, Optional


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
        airlines: List of detected airlines
        themes: List of detected themes
        
    Returns:
        Dict mapping airline name to list of associated themes
    """
    import re
    from src.config.themes import THEME_KEYWORDS
    
    airline_theme_map = {}
    text_lower = text.lower()
    
    # Split text into sentences
    sentences = re.split(r'[.!?]+\s+', text)
    
    for airline in airlines:
        airline_name = airline["airline"]
        airline_name_lower = airline_name.lower()
        airline_keywords = AIRLINE_KEYWORDS.get(airline_name, [])
        all_airline_terms = [airline_name_lower] + [k.lower() for k in airline_keywords]
        
        associated_themes = []
        
        # Check each sentence for airline + theme co-occurrence
        for sentence in sentences:
            sentence_lower = sentence.lower()
            
            # Check if this sentence mentions the airline
            mentions_airline = any(term in sentence_lower for term in all_airline_terms)
            
            if mentions_airline:
                # Check which themes are mentioned in this sentence
                for theme in themes:
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
                    theme_keywords = THEME_KEYWORDS.get(theme, [])
                    if any(kw.lower() in context for kw in theme_keywords):
                        if theme not in associated_themes:
                            associated_themes.append(theme)
        
        airline_theme_map[airline_name] = associated_themes if associated_themes else ["General"]
    
    return airline_theme_map


def map_themes_to_airlines(text: str, airlines: List[Dict], themes: List[str]) -> Dict[str, List[str]]:
    """
    Map themes to airlines (Many-to-One: multiple airlines can share same theme).
    
    Args:
        text: Full transcription text
        airlines: List of detected airlines
        themes: List of detected themes
        
    Returns:
        Dict mapping theme name to list of associated airlines
    """
    theme_airline_map = {}
    
    # First get airline-to-theme mapping
    airline_theme_map = map_airlines_to_themes(text, airlines, themes)
    
    # Reverse the mapping
    for theme in themes:
        associated_airlines = []
        for airline_name, airline_themes in airline_theme_map.items():
            if theme in airline_themes:
                associated_airlines.append(airline_name)
        theme_airline_map[theme] = associated_airlines if associated_airlines else []
    
    return theme_airline_map

