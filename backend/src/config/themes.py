"""Theme configuration for content extraction."""
from typing import Dict, List


# Theme definitions with keywords for detection
THEME_KEYWORDS: Dict[str, List[str]] = {
    "Hiring": [
        "hiring", "recruitment", "pilot hiring", "crew hiring", "employee hiring",
        "employment", "vacancies", "job openings", "positions", "candidates",
        "applicants", "new hires", "onboarding", "talent acquisition", "staffing",
        "workforce expansion", "recruiting", "job postings", "hiring spree",
        "mass hiring", "bulk recruitment", "hiring drive", "hiring campaign"
    ],
    "Firing": [
        "firing", "layoff", "termination", "job cuts", "staff reduction",
        "downsizing", "workforce reduction", "dismissals", "retrenchment",
        "job losses", "employee exits", "workforce cuts", "mass layoffs",
        "redundancy", "job termination", "staff dismissal", "employee termination",
        "workforce downsizing", "job elimination", "staff layoff"
    ],
    "Fleet Expansion": [
        "fleet expansion", "new aircraft", "aircraft orders", "aircraft delivery",
        "aircraft purchase", "fleet growth", "aircraft acquisition", "new planes",
        "aircraft procurement", "fleet size", "aircraft fleet"
    ],
    "Market Competition": [
        "competition", "market share", "competitive", "rival", "competitor",
        "market position", "pricing", "market strategy", "competitive advantage"
    ],
    "Pilot Training Demand": [
        "pilot training", "training program", "pilot school", "flight training",
        "training capacity", "pilot certification", "training demand", "cadet program"
    ],
    "Operational Efficiency": [
        "operational efficiency", "operations", "efficiency", "productivity",
        "operational cost", "fuel efficiency", "route optimization", "on-time performance"
    ],
    "Regulatory Compliance": [
        "regulatory", "compliance", "dgca", "faa", "icao", "regulations",
        "regulatory changes", "safety compliance", "aviation authority"
    ],
    "Financial Performance": [
        "revenue", "profit", "loss", "financial", "earnings", "quarterly results",
        "financial performance", "revenue growth", "profitability"
    ],
    "Route Expansion": [
        "new routes", "route expansion", "new destinations", "route network",
        "international routes", "domestic routes", "route launch"
    ],
    "Technology & Innovation": [
        "technology", "innovation", "digital", "ai", "automation", "digitalization",
        "tech upgrade", "software", "system upgrade"
    ],
    "Safety & Security": [
        "safety", "security", "safety measures", "safety protocols", "incident",
        "accident", "safety record", "security measures"
    ]
}


def get_theme_keywords() -> Dict[str, List[str]]:
    """Get all theme keywords for detection."""
    return THEME_KEYWORDS


def detect_themes_in_text(text: str) -> List[str]:
    """
    Detect themes in text based on keywords.
    
    Args:
        text: Input text to analyze
        
    Returns:
        List of detected themes (sorted by relevance)
    """
    text_lower = text.lower()
    theme_scores = {}
    
    for theme, keywords in THEME_KEYWORDS.items():
        matches = sum(1 for keyword in keywords if keyword in text_lower)
        if matches > 0:
            theme_scores[theme] = matches
    
    # Sort by score and return theme names
    sorted_themes = sorted(theme_scores.items(), key=lambda x: x[1], reverse=True)
    return [theme for theme, _ in sorted_themes[:3]]  # Return top 3 themes

