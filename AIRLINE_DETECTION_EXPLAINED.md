# How Airline Detection Works

## Overview
The system automatically detects airline names from voice transcriptions using intelligent keyword matching and relevance scoring.

## Detection Process

### 1. **Keyword Matching** (`backend/src/config/airlines.py`)

The system uses a comprehensive keyword dictionary for each airline:

```python
AIRLINE_KEYWORDS = {
    "Indigo": ["indigo", "6e", "indigo airlines", "indigo air", ...],
    "Air India": ["air india", "ai", "air india express", "tata", ...],
    "Emirates": ["emirates", "ek", "emirates airlines", ...],
    # ... and more
}
```

### 2. **Detection Algorithm** (`detect_airlines_in_text()`)

When text is transcribed, the system:

1. **Scans for Keywords**: Checks if any airline keywords appear in the text (case-insensitive)
2. **Calculates Relevance Score**:
   - Base score: Number of keyword matches / Total keywords
   - Boost: +0.2 if airline name appears directly
   - Position score: Earlier mentions = higher score
   - Frequency: Counts how many times airline is mentioned

3. **Ranks Airlines**: Sorts by relevance score (High > Medium > Low)

4. **Determines Primary Airline**:
   - Uses rule-based scoring (highest relevance)
   - Falls back to AI analysis if multiple airlines detected
   - Considers mention position and frequency

### 3. **Example Detection**

**Input Text:**
```
"Indigo is hiring aggressively because of its massive A320 fleet expansion, 
but pilots are complaining. At the same time, Air India is recruiting 
wide-body pilots for Boeing 787s, and Emirates continuously attracts 
experienced Indian pilots with tax-free salaries."
```

**Detected Airlines:**
1. **Indigo** - High Relevance (mentioned first, multiple keywords)
2. **Air India** - High Relevance (direct mention, specific context)
3. **Emirates** - Medium Relevance (mentioned, but less context)

**Primary Airline:** Indigo (highest score, mentioned first)

## Display in Frontend

### 1. **Summary Section** (Top of Analysis)
- Shows all detected airlines prominently
- Highlights primary airline with ⭐ badge
- Green border for primary airline

### 2. **Airline Specifications Section**
- Detailed view of each detected airline
- Shows relevance level (High/Medium/Low)
- Displays signals and activity
- Primary airline marked with "PRIMARY" badge

### 3. **Visual Indicators**
- **Primary Airline**: Green border, ⭐ icon, "PRIMARY" badge
- **High Relevance**: Green color scheme
- **Medium Relevance**: Yellow/orange color scheme
- **Low Relevance**: Gray color scheme

## Supported Airlines

### Indian Airlines
- Indigo
- Air India
- SpiceJet
- Vistara
- Go First
- Akasa Air
- Alliance Air
- AirAsia India
- TruJet
- Star Air

### International Airlines
- Emirates
- Qatar Airways
- Singapore Airlines
- Lufthansa
- British Airways
- Air France
- Etihad

## How to Add New Airlines

Edit `backend/src/config/airlines.py`:

```python
AIRLINE_KEYWORDS = {
    "New Airline": [
        "new airline", "na", "new airline flights",
        "new airline fleet", "new airline pilots"
    ],
    # ... existing airlines
}
```

The system will automatically detect the new airline in future transcriptions.

## Detection Accuracy

- **High Accuracy**: Direct airline name mentions
- **Medium Accuracy**: Keyword matches (codes, variations)
- **Context Aware**: Considers position and frequency
- **AI Enhanced**: Uses GPT-4o for primary airline determination when multiple airlines detected

## Example Output

When airlines are detected, you'll see:

```
✈️ Auto-Detected Airlines: [Indigo ⭐ Primary] [Air India] [Emirates]
```

In the Airline Specifications section:
- **Indigo** - High Relevance - PRIMARY
- **Air India** - High Relevance
- **Emirates** - Medium Relevance

