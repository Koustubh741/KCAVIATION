# Multiple Airlines Detection and Segregation

## Overview

When multiple airlines are mentioned in a single transcription, the system now intelligently:
1. **Detects all airlines** mentioned in the text
2. **Identifies the primary airline** (main focus)
3. **Segregates content** by airline relevance
4. **Displays all airlines** with their relevance scores

## How It Works

### 1. Enhanced Airline Detection

The system uses multiple factors to detect and score airlines:

- **Keyword Matching**: Counts how many airline-specific keywords appear
- **Direct Mentions**: Boosts score if airline name appears directly
- **Mention Frequency**: Counts total mentions of airline and keywords
- **Position Score**: Earlier mentions get higher scores (first mentioned = more important)
- **Relevance Calculation**: Combines all factors into a relevance score

### 2. Primary Airline Determination

When multiple airlines are detected, the system determines the primary airline using:

**Rule-Based Method:**
- If one airline has significantly higher score (>50% more than second)
- If one airline has significantly more mentions (>20% more)
- Otherwise, uses the first mentioned airline

**AI-Based Method (when scores are close):**
- Uses GPT to analyze context and determine primary focus
- Considers which airline is the main subject of the text
- Falls back to highest-scored airline if AI fails

### 3. Content Segregation

The system can segment text by airline:

```python
# Example: Text mentions multiple airlines
text = "Indigo is hiring 500 pilots. Air India is expanding routes. SpiceJet announced new aircraft."

# Segmented output:
{
    "Indigo": "Indigo is hiring 500 pilots.",
    "Air India": "Air India is expanding routes.",
    "SpiceJet": "SpiceJet announced new aircraft."
}
```

### 4. Response Structure

The backend now returns:

```json
{
  "transcription": "Full transcription text...",
  "airline": "Indigo",  // Primary airline
  "allAirlines": ["Indigo", "Air India", "SpiceJet"],  // All detected
  "analysis": {
    "primaryAirline": "Indigo",
    "allAirlines": ["Indigo", "Air India", "SpiceJet"],
    "airlineSpecifications": [
      {
        "airline": "Indigo",
        "relevance": "High",
        "isPrimary": true,  // Marked as primary
        "score": 0.85,
        "mentionCount": 3,
        "signals": ["Hiring", "Expansion"]
      },
      {
        "airline": "Air India",
        "relevance": "Medium",
        "isPrimary": false,
        "score": 0.45,
        "mentionCount": 1,
        "signals": ["Route Expansion"]
      }
    ]
  }
}
```

## Frontend Display

The frontend now shows:

1. **Primary Airline Indicator**: 
   - Marked with "PRIMARY" badge
   - Highlighted with green border
   - Shown in header: "Airline Specifications (Primary: Indigo)"

2. **All Airlines List**:
   - All detected airlines displayed
   - Sorted by relevance (primary first)
   - Shows relevance score and signals for each

3. **Summary Section**:
   - AI-generated summary focuses on primary airline
   - Mentions other airlines if relevant

## Example Scenarios

### Scenario 1: Clear Primary Airline
**Input**: "Indigo is hiring 500 new pilots next quarter. They're expanding their fleet significantly. Air India is also looking to hire some pilots."

**Detection**:
- Indigo: High relevance (primary) - mentioned first, more details
- Air India: Medium relevance - mentioned briefly

**Output**: Primary = Indigo

### Scenario 2: Multiple Airlines, Equal Importance
**Input**: "Indigo announced 500 pilot hires. Air India announced 300 pilot hires. Both airlines are expanding."

**Detection**:
- Both detected with similar scores
- AI determines primary based on context
- Both shown with relevance scores

**Output**: Primary determined by AI analysis

### Scenario 3: Single Airline
**Input**: "Indigo is hiring pilots and expanding routes."

**Detection**:
- Only Indigo detected
- Automatically primary

**Output**: Primary = Indigo

## Configuration

### Airline Keywords

Edit `backend/src/config/airlines.py` to add/modify airline keywords:

```python
AIRLINE_KEYWORDS = {
    "Indigo": ["indigo", "6e", "indigo airlines", ...],
    "Air India": ["air india", "ai", "tata", ...],
    # Add more airlines...
}
```

### Relevance Thresholds

Current thresholds:
- **High**: Score > 0.4 or is primary airline
- **Medium**: Score > 0.2
- **Low**: Score > 0.0

## API Usage

### Filter by Specific Airline

You can filter analysis for a specific airline:

```bash
POST /api/transcribe
FormData:
  - audio: <file>
  - airline_filter: "Indigo"  # Optional
```

This will:
- Only analyze content related to the specified airline
- Ignore other airlines mentioned
- Return analysis focused on that airline

## Benefits

1. **Accurate Primary Detection**: Identifies main focus even with multiple mentions
2. **Complete Information**: Shows all airlines, not just one
3. **Context-Aware**: Uses AI to understand which airline is primary
4. **Flexible Filtering**: Can filter by specific airline if needed
5. **Better Insights**: Summary focuses on primary airline while acknowledging others

## Testing

Test with various scenarios:

```python
# Test 1: Multiple airlines, clear primary
text = "Indigo is hiring 500 pilots. Air India might also hire some."

# Test 2: Equal importance
text = "Indigo hired 500 pilots. Air India hired 300 pilots."

# Test 3: Single airline
text = "Indigo is expanding its fleet with new aircraft orders."
```

The system will correctly identify the primary airline in each case.

