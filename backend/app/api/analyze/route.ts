import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAuthUser } from '@/lib/auth';
import { createInsight, findUserById } from '@/lib/db';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fixed themes for the aviation intelligence platform - STRICT list
const FIXED_THEMES = ['Hiring', 'Expansion', 'Financial', 'Operations', 'Safety', 'Training', 'Firing'] as const;
type Theme = typeof FIXED_THEMES[number];

// Enhanced system prompt for better accuracy
const SYSTEM_PROMPT = `You are an expert aviation market intelligence analyst with 20+ years of experience in the aviation industry. Your role is to analyze voice transcriptions from industry sources and extract actionable market intelligence.

You MUST be precise, accurate, and consistent in your analysis. Focus on:
1. Extracting EXACT keywords that appear in or are directly implied by the transcription
2. Classifying themes STRICTLY from the allowed list
3. Providing realistic sentiment scores based on the actual content
4. Making reasonable market signal predictions based on evidence in the text

CRITICAL: Your analysis must be grounded in the transcription text. Do not hallucinate or make up information not present in the source.`;

// Few-shot examples for better accuracy
const FEW_SHOT_EXAMPLES = `
=== EXAMPLE 1 ===
Transcription: "Indigo Airlines announced they will be hiring 500 new pilots over the next quarter to support their fleet expansion plans. The airline expects to add 30 new aircraft by year end."

Analysis:
{
  "summary": "Indigo Airlines is undertaking major workforce expansion with plans to hire 500 pilots to support their fleet growth of 30 new aircraft by year end, indicating strong market confidence and aggressive growth strategy.",
  "keywords": ["hiring", "pilots", "500", "fleet expansion", "Indigo", "30 aircraft", "workforce"],
  "themes": ["Hiring", "Expansion"],
  "sentiment": {
    "overall": "Positive",
    "score": 0.88,
    "breakdown": { "positive": 85, "neutral": 15, "negative": 0 }
  },
  "marketSignals": [
    { "signal": "Major pilot hiring indicates strong demand forecasting", "strength": "Strong", "trend": "up", "confidence": 0.92 },
    { "signal": "Fleet expansion of 30 aircraft signals aggressive growth", "strength": "Strong", "trend": "up", "confidence": 0.90 }
  ],
  "airlineSpecifications": [
    { "airline": "Indigo", "relevance": "High", "signals": ["Pilot hiring", "Fleet growth"], "competitiveImpact": "High" }
  ],
  "predictiveProbabilities": [
    { "event": "Indigo will increase market share in Indian aviation", "probability": 78, "confidence": 0.85 },
    { "event": "Increased competition for pilot recruitment in India", "probability": 72, "confidence": 0.80 }
  ],
  "confidenceScore": 0.91
}

=== EXAMPLE 2 ===
Transcription: "SpiceJet reported a quarterly loss of 450 crores due to rising fuel costs and operational inefficiencies. The airline is considering laying off 15% of its ground staff."

Analysis:
{
  "summary": "SpiceJet faces significant financial challenges with a 450 crore quarterly loss attributed to fuel costs and operational issues, leading to potential 15% ground staff reduction indicating severe cost-cutting measures.",
  "keywords": ["SpiceJet", "quarterly loss", "450 crores", "fuel costs", "laying off", "15%", "ground staff", "operational inefficiencies"],
  "themes": ["Financial", "Firing", "Operations"],
  "sentiment": {
    "overall": "Negative",
    "score": 0.22,
    "breakdown": { "positive": 5, "neutral": 20, "negative": 75 }
  },
  "marketSignals": [
    { "signal": "Financial distress signals potential restructuring", "strength": "Strong", "trend": "down", "confidence": 0.88 },
    { "signal": "Staff layoffs indicate workforce reduction", "strength": "Strong", "trend": "down", "confidence": 0.85 },
    { "signal": "Operational inefficiencies require urgent attention", "strength": "Moderate", "trend": "down", "confidence": 0.82 }
  ],
  "airlineSpecifications": [
    { "airline": "SpiceJet", "relevance": "High", "signals": ["Financial loss", "Layoffs", "Operational issues"], "competitiveImpact": "Medium" }
  ],
  "predictiveProbabilities": [
    { "event": "SpiceJet will implement further cost reduction measures", "probability": 85, "confidence": 0.88 },
    { "event": "Potential route rationalization in coming months", "probability": 65, "confidence": 0.72 }
  ],
  "confidenceScore": 0.86
}

=== EXAMPLE 3 ===
Transcription: "The DGCA has mandated additional safety training for all Boeing 737 MAX pilots following recent incidents. Airlines must complete compliance within 90 days."

Analysis:
{
  "summary": "DGCA mandates enhanced safety training for Boeing 737 MAX pilots with 90-day compliance deadline, reflecting heightened regulatory focus on aircraft safety following recent incidents.",
  "keywords": ["DGCA", "safety training", "Boeing 737 MAX", "pilots", "compliance", "90 days", "incidents"],
  "themes": ["Safety", "Training"],
  "sentiment": {
    "overall": "Neutral",
    "score": 0.50,
    "breakdown": { "positive": 25, "neutral": 55, "negative": 20 }
  },
  "marketSignals": [
    { "signal": "Increased regulatory scrutiny on 737 MAX operations", "strength": "Strong", "trend": "stable", "confidence": 0.90 },
    { "signal": "Training capacity demand will increase industry-wide", "strength": "Moderate", "trend": "up", "confidence": 0.78 }
  ],
  "airlineSpecifications": [
    { "airline": "Industry-wide", "relevance": "High", "signals": ["Regulatory compliance", "Safety training"], "competitiveImpact": "Medium" }
  ],
  "predictiveProbabilities": [
    { "event": "Airlines will increase simulator training investments", "probability": 80, "confidence": 0.85 },
    { "event": "Temporary capacity reduction during training compliance", "probability": 55, "confidence": 0.65 }
  ],
  "confidenceScore": 0.84
}

=== EXAMPLE 4 (Complex Multi-Theme) ===
Transcription: "Internal workforce and training reality at Indigo. Officially, we say hiring is balanced, but in reality, we are actively recruiting pilots and instructors because training pipelines are stretched. Simulator demand has gone up sharply with new aircraft types coming in. At the same time, some back office roles are being phased out quietly. These decisions are tied directly to keeping operational costs under control while trying to improve fleet utilization."

Analysis:
{
  "summary": "Indigo is experiencing complex workforce dynamics with active pilot and instructor recruitment to address stretched training pipelines, while simultaneously phasing out back office roles to control operational costs and improve fleet utilization.",
  "keywords": ["Indigo", "hiring", "recruiting", "pilots", "instructors", "training pipelines", "simulator demand", "back office", "phased out", "operational costs", "fleet utilization"],
  "themes": ["Hiring", "Training", "Firing", "Operations"],
  "sentiment": {
    "overall": "Neutral",
    "score": 0.52,
    "breakdown": { "positive": 40, "neutral": 35, "negative": 25 }
  },
  "marketSignals": [
    { "signal": "Active pilot recruitment indicates capacity growth", "strength": "Strong", "trend": "up", "confidence": 0.88 },
    { "signal": "Training infrastructure under pressure from fleet growth", "strength": "Strong", "trend": "up", "confidence": 0.85 },
    { "signal": "Back office restructuring signals cost optimization", "strength": "Moderate", "trend": "down", "confidence": 0.78 },
    { "signal": "Focus on fleet utilization improvement", "strength": "Moderate", "trend": "up", "confidence": 0.75 }
  ],
  "airlineSpecifications": [
    { "airline": "Indigo", "relevance": "High", "signals": ["Pilot hiring", "Training expansion", "Cost optimization", "Back office reduction"], "competitiveImpact": "High" }
  ],
  "predictiveProbabilities": [
    { "event": "Increased investment in simulator facilities", "probability": 82, "confidence": 0.86 },
    { "event": "More back office automation and role consolidation", "probability": 70, "confidence": 0.75 },
    { "event": "Pilot shortage may persist in short term", "probability": 65, "confidence": 0.72 }
  ],
  "confidenceScore": 0.85
}
`;

// Analysis prompt template with strict validation rules
const ANALYSIS_PROMPT = `Analyze the following aviation industry transcription and provide structured intelligence.

=== TRANSCRIPTION TO ANALYZE ===
"{transcription}"

=== CONTEXT ===
- Airline mentioned or related: {airline}
- Country/Region: {country}
- Source: {recordedBy}

=== STRICT RULES ===
1. THEMES: Extract ALL applicable themes (2-4 themes typical). Use ONLY these exact themes: ${FIXED_THEMES.join(', ')}
   - Hiring: Recruitment, workforce additions, new positions, talent acquisition, staffing, recruiting
   - Expansion: Fleet growth, new routes, new destinations, aircraft orders, market entry
   - Financial: Revenue, profits, losses, investments, costs, funding, financial performance
   - Operations: Day-to-day operations, delays, efficiency, scheduling, maintenance, disruptions, fleet utilization
   - Safety: Safety incidents, protocols, audits, regulatory compliance, DGCA/FAA actions
   - Training: Pilot training, crew certification, simulators, skill development programs, training pipelines
   - Firing: Layoffs, terminations, workforce reductions, job cuts, downsizing, phasing out roles, furloughs, restructuring
   
   IMPORTANT: A single transcription often covers MULTIPLE themes. For example:
   - "hiring pilots" + "training programs" = themes: ["Hiring", "Training"]
   - "layoffs" + "cost control" = themes: ["Firing", "Financial", "Operations"]
   - "recruiting" + "phasing out back office" = themes: ["Hiring", "Firing"]

2. KEYWORDS: Extract 8-12 keywords following these PRIORITY RULES:
   a) AIRLINE NAMES: ALWAYS include any airline names mentioned (Indigo, SpiceJet, Air India, Vistara, etc.) - HIGHEST PRIORITY
   b) ROLES/PEOPLE: Include roles mentioned (pilots, instructors, crew, staff, captains)
   c) ACTIVITIES: Include key actions (hiring, recruiting, training, phasing out, firing, layoffs, expanding)
   d) BUSINESS TERMS: Include business concepts (operational costs, fleet utilization, simulator demand)
   e) SPECIFIC PHRASES: Include multi-word phrases that appear in the text (training pipelines, back office, phased out)
   
   Keywords MUST be actual words/phrases from the transcription, not generic descriptions.
   Include BOTH single words AND multi-word phrases for comprehensive coverage.

3. SENTIMENT SCORE: 
   - Positive (0.65-1.0): Growth, expansion, profits, hiring, success
   - Neutral (0.35-0.65): Regulatory updates, routine operations, mixed news
   - Negative (0.0-0.35): Losses, layoffs, firing, safety incidents, operational failures

4. ACCURACY: Only include information that is explicitly stated or can be reasonably inferred from the transcription. Do not fabricate details.

=== REQUIRED JSON OUTPUT ===
{
  "summary": "2-3 sentence executive summary of key insights",
  "keywords": ["keyword1", "keyword2", "keyword3", "multi-word phrase", "keyword5", "keyword6", "keyword7", "keyword8"],
  "themes": ["Theme1", "Theme2", "Theme3"],
  "sentiment": {
    "overall": "Positive" | "Neutral" | "Negative",
    "score": 0.0-1.0,
    "breakdown": { "positive": 0-100, "neutral": 0-100, "negative": 0-100 }
  },
  "marketSignals": [
    { "signal": "Description", "strength": "Strong|Moderate|Weak", "trend": "up|down|stable", "confidence": 0.0-1.0 }
  ],
  "airlineSpecifications": [
    { "airline": "Name", "relevance": "High|Medium|Low", "signals": ["signal1"], "competitiveImpact": "High|Medium|Low" }
  ],
  "predictiveProbabilities": [
    { "event": "Predicted event", "probability": 0-100, "confidence": 0.0-1.0 }
  ],
  "confidenceScore": 0.0-1.0
}

Respond with ONLY valid JSON. No markdown, no explanation, just the JSON object.`;

// Validation helper to ensure themes are from the fixed list
function validateAndNormalizeThemes(themes: string[]): Theme[] {
  if (!themes || !Array.isArray(themes)) return ['Operations'];
  
  const normalizedThemes: Theme[] = [];
  
  for (const theme of themes) {
    // Find matching theme (case-insensitive)
    const matchedTheme = FIXED_THEMES.find(
      (t) => t.toLowerCase() === theme.toLowerCase()
    );
    
    if (matchedTheme) {
      normalizedThemes.push(matchedTheme);
    } else {
      // Map common variations to fixed themes
      const lowerTheme = theme.toLowerCase();
      if (lowerTheme.includes('hire') || lowerTheme.includes('recruit') || lowerTheme.includes('workforce addition')) {
        normalizedThemes.push('Hiring');
      } else if (lowerTheme.includes('firing') || lowerTheme.includes('layoff') || lowerTheme.includes('terminat') || lowerTheme.includes('downsiz') || lowerTheme.includes('phased out') || lowerTheme.includes('phasing out') || lowerTheme.includes('redundanc') || lowerTheme.includes('furlough') || lowerTheme.includes('job cut') || lowerTheme.includes('retrench') || lowerTheme.includes('workforce reduction')) {
        normalizedThemes.push('Firing');
      } else if (lowerTheme.includes('expand') || lowerTheme.includes('fleet') || lowerTheme.includes('route') || lowerTheme.includes('growth')) {
        normalizedThemes.push('Expansion');
      } else if (lowerTheme.includes('financ') || lowerTheme.includes('profit') || lowerTheme.includes('loss') || lowerTheme.includes('revenue')) {
        normalizedThemes.push('Financial');
      } else if (lowerTheme.includes('operat') || lowerTheme.includes('delay') || lowerTheme.includes('maintenance')) {
        normalizedThemes.push('Operations');
      } else if (lowerTheme.includes('safe') || lowerTheme.includes('incident') || lowerTheme.includes('compliance')) {
        normalizedThemes.push('Safety');
      } else if (lowerTheme.includes('train') || lowerTheme.includes('simulat') || lowerTheme.includes('certif')) {
        normalizedThemes.push('Training');
      }
    }
  }
  
  // Remove duplicates and ensure at least one theme
  const uniqueThemes = Array.from(new Set(normalizedThemes));
  return uniqueThemes.length > 0 ? uniqueThemes : ['Operations'];
}

// Validate and normalize sentiment score
function validateSentiment(sentiment: any): { overall: string; score: number; breakdown: any } {
  const defaultSentiment = {
    overall: 'Neutral' as const,
    score: 0.5,
    breakdown: { positive: 33, neutral: 34, negative: 33 }
  };
  
  if (!sentiment) return defaultSentiment;
  
  let overall = sentiment.overall || 'Neutral';
  let score = parseFloat(sentiment.score) || 0.5;
  
  // Normalize score to 0-1 range
  if (score > 1) score = score / 100;
  score = Math.max(0, Math.min(1, score));
  
  // Ensure overall matches score
  if (score >= 0.65 && overall !== 'Positive') {
    overall = 'Positive';
  } else if (score <= 0.35 && overall !== 'Negative') {
    overall = 'Negative';
  } else if (score > 0.35 && score < 0.65 && overall !== 'Neutral') {
    overall = 'Neutral';
  }
  
  // Validate breakdown
  let breakdown = sentiment.breakdown || {};
  const positive = parseInt(breakdown.positive) || 33;
  const neutral = parseInt(breakdown.neutral) || 34;
  const negative = parseInt(breakdown.negative) || 33;
  
  // Normalize to 100%
  const total = positive + neutral + negative;
  if (total !== 100 && total > 0) {
    breakdown = {
      positive: Math.round((positive / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      negative: Math.round((negative / total) * 100)
    };
  }
  
  return { overall, score: Math.round(score * 100) / 100, breakdown };
}

// ==================== INTELLIGENT KEYWORD EXTRACTION ====================

// Airline names to always capture when mentioned
const AIRLINE_NAMES = [
  'indigo', 'air india', 'spicejet', 'vistara', 'goair', 'go air', 'akasa', 'airasia',
  'emirates', 'lufthansa', 'british airways', 'singapore airlines', 'qatar airways',
  'etihad', 'american airlines', 'delta', 'united airlines', 'southwest',
  'ryanair', 'easyjet', 'thai airways', 'cathay pacific', 'qantas', 'virgin atlantic',
  'jet airways', 'kingfisher', 'air france', 'klm', 'turkish airlines'
];

// Theme-related keywords that are always important
const THEME_KEYWORDS = {
  Hiring: ['hiring', 'recruit', 'recruiting', 'recruitment', 'workforce', 'staff', 'employees', 'talent', 'jobs', 'positions', 'vacancies', 'onboarding', 'headcount'],
  Expansion: ['expansion', 'fleet', 'routes', 'aircraft', 'planes', 'growth', 'new routes', 'destinations', 'orders', 'delivery', 'network', 'capacity'],
  Financial: ['revenue', 'profit', 'loss', 'costs', 'funding', 'investment', 'earnings', 'financial', 'budget', 'expenses', 'margins', 'debt', 'cash flow'],
  Operations: ['operations', 'operational', 'delays', 'efficiency', 'scheduling', 'maintenance', 'utilization', 'on-time', 'disruption', 'turnaround', 'ground handling'],
  Safety: ['safety', 'incident', 'accident', 'compliance', 'audit', 'dgca', 'faa', 'regulations', 'protocol', 'inspection', 'certification'],
  Training: ['training', 'simulator', 'pilots', 'instructors', 'crew', 'certification', 'type rating', 'license', 'academy', 'cadet', 'pipeline'],
  Firing: ['firing', 'layoff', 'layoffs', 'laid off', 'termination', 'terminated', 'downsizing', 'redundancy', 'redundancies', 'phased out', 'phasing out', 'let go', 'workforce reduction', 'job cuts', 'furlough', 'furloughed', 'severance', 'restructuring', 'cutbacks', 'retrenchment']
};

// Important aviation terms to capture
const AVIATION_TERMS = [
  'pilots', 'crew', 'cabin crew', 'flight attendants', 'captains', 'first officers',
  'simulator', 'simulators', 'type rating', 'training pipeline', 'training pipelines',
  'fleet utilization', 'load factor', 'passenger', 'passengers',
  'back office', 'operational costs', 'cost cutting', 'layoffs', 'phased out',
  'aircraft types', 'narrowbody', 'widebody', 'turboprop',
  'boeing', 'airbus', 'a320', 'a321', '737', '787', '777',
  'mrp', 'mro', 'hub', 'spoke', 'slots', 'codeshare',
  // Firing/Layoff related terms
  'layoff', 'layoffs', 'fired', 'firing', 'terminated', 'termination',
  'workforce reduction', 'job cuts', 'downsizing', 'restructuring',
  'furlough', 'furloughed', 'redundancies', 'retrenchment', 'severance'
];

// Extract keywords intelligently from transcription
function extractKeywordsFromText(transcription: string): string[] {
  const lowerText = transcription.toLowerCase();
  const foundKeywords: string[] = [];
  
  // 1. Find airline names mentioned
  for (const airline of AIRLINE_NAMES) {
    if (lowerText.includes(airline)) {
      // Capitalize properly
      const properName = airline.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      foundKeywords.push(properName);
    }
  }
  
  // 2. Find theme-related keywords
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
      }
    }
  }
  
  // 3. Find aviation terms
  for (const term of AVIATION_TERMS) {
    if (lowerText.includes(term.toLowerCase())) {
      foundKeywords.push(term);
    }
  }
  
  // 4. Extract multi-word phrases (2-3 word combinations that appear together)
  const importantPhrases = [
    'training pipelines', 'training pipeline', 'simulator demand', 'operational costs',
    'fleet utilization', 'back office', 'aircraft types', 'new aircraft',
    'pilot shortage', 'crew shortage', 'hiring freeze', 'cost cutting',
    'route expansion', 'fleet expansion', 'market share', 'load factor',
    'on time performance', 'fuel costs', 'labor costs'
  ];
  
  for (const phrase of importantPhrases) {
    if (lowerText.includes(phrase)) {
      foundKeywords.push(phrase);
    }
  }
  
  return foundKeywords;
}

// Validate and enhance keywords
function validateKeywords(aiKeywords: string[], transcription: string): string[] {
  const lowerTranscription = transcription.toLowerCase();
  const finalKeywords: Set<string> = new Set();
  
  // 1. First, extract keywords directly from transcription (most accurate)
  const extractedKeywords = extractKeywordsFromText(transcription);
  extractedKeywords.forEach(k => finalKeywords.add(k));
  
  // 2. Validate AI-suggested keywords (check if they're in the text)
  if (aiKeywords && Array.isArray(aiKeywords)) {
    for (const keyword of aiKeywords) {
      if (typeof keyword === 'string' && keyword.length > 1) {
        const lowerKeyword = keyword.toLowerCase();
        
        // Check if the keyword or its significant parts appear in transcription
        const keywordParts = lowerKeyword.split(' ').filter(p => p.length > 2);
        const isValid = lowerTranscription.includes(lowerKeyword) ||
          keywordParts.some(part => lowerTranscription.includes(part));
        
        if (isValid) {
          finalKeywords.add(keyword);
        }
      }
    }
  }
  
  // 3. If still not enough keywords, extract important words from transcription
  if (finalKeywords.size < 5) {
    // Extract nouns and important words (longer words are often more meaningful)
    const words = transcription.match(/\b[a-zA-Z]{4,}\b/g) || [];
    const stopWords = new Set([
      'this', 'that', 'with', 'from', 'have', 'will', 'been', 'were', 'they', 'their',
      'about', 'which', 'would', 'there', 'could', 'other', 'some', 'being', 'these',
      'those', 'while', 'trying', 'directly', 'visually', 'visible', 'externally',
      'officially', 'reality', 'balanced', 'actively', 'because', 'stretched',
      'sharply', 'coming', 'same', 'time', 'quietly', 'decisions', 'tied', 'keeping',
      'under', 'control', 'improve', 'none', 'internal'
    ]);
    
    for (const word of words) {
      if (!stopWords.has(word.toLowerCase()) && word.length >= 5) {
        // Prioritize certain types of words
        const lowerWord = word.toLowerCase();
        if (
          lowerWord.includes('pilot') ||
          lowerWord.includes('train') ||
          lowerWord.includes('hire') ||
          lowerWord.includes('recruit') ||
          lowerWord.includes('fleet') ||
          lowerWord.includes('cost') ||
          lowerWord.includes('aircraft') ||
          lowerWord.includes('simul') ||
          lowerWord.includes('operat')
        ) {
          finalKeywords.add(word.toLowerCase());
        }
      }
    }
  }
  
  // Convert to array, remove duplicates (case-insensitive), and limit
  const uniqueKeywords: string[] = [];
  const seenLower = new Set<string>();
  const keywordsArray = Array.from(finalKeywords);
  
  for (const keyword of keywordsArray) {
    const lower = keyword.toLowerCase();
    if (!seenLower.has(lower)) {
      seenLower.add(lower);
      uniqueKeywords.push(keyword);
    }
  }
  
  // Sort by relevance (airline names first, then multi-word phrases, then single words)
  uniqueKeywords.sort((a, b) => {
    const aIsAirline = AIRLINE_NAMES.some(airline => a.toLowerCase().includes(airline));
    const bIsAirline = AIRLINE_NAMES.some(airline => b.toLowerCase().includes(airline));
    if (aIsAirline && !bIsAirline) return -1;
    if (!aIsAirline && bIsAirline) return 1;
    
    const aIsPhrase = a.includes(' ');
    const bIsPhrase = b.includes(' ');
    if (aIsPhrase && !bIsPhrase) return -1;
    if (!aIsPhrase && bIsPhrase) return 1;
    
    return b.length - a.length; // Longer keywords first
  });
  
  return uniqueKeywords.slice(0, 12);
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { success: false, error: 'AI analysis service not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { transcription, context = {} } = body;

    if (!transcription) {
      return NextResponse.json(
        { success: false, error: 'Transcription is required' },
        { status: 400 }
      );
    }

    // Clean and validate transcription
    const cleanTranscription = transcription.trim();
    if (cleanTranscription.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Transcription too short for meaningful analysis' },
        { status: 400 }
      );
    }

    // Build the prompt with few-shot examples for better accuracy
    const prompt = ANALYSIS_PROMPT
      .replace('{transcription}', cleanTranscription)
      .replace('{airline}', context.airline || 'Not specified')
      .replace('{country}', context.country || 'Not specified')
      .replace('{recordedBy}', context.recordedBy || user.email);

    // Call GPT-4o for analysis with optimized settings
    // Using gpt-4o for better accuracy (can fall back to gpt-4o-mini if needed)
    const modelToUse = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    
    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: FEW_SHOT_EXAMPLES,
        },
        {
          role: 'assistant',
          content: 'I understand the analysis format and will follow the examples precisely. I will now analyze your transcription.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      // Lower temperature for more deterministic, accurate results
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      // Add presence and frequency penalty to reduce repetition
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    // Parse the response
    const responseContent = completion.choices[0]?.message?.content || '{}';
    let analysis;
    
    try {
      analysis = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', responseContent);
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI analysis' },
        { status: 500 }
      );
    }

    // POST-PROCESSING: Validate and normalize all fields for accuracy
    
    // 1. Validate themes
    analysis.themes = validateAndNormalizeThemes(analysis.themes);
    
    // 2. Validate sentiment
    analysis.sentiment = validateSentiment(analysis.sentiment);
    
    // 3. Validate keywords against actual transcription
    analysis.keywords = validateKeywords(analysis.keywords, cleanTranscription);
    
    // 4. Ensure confidence scores are valid
    if (analysis.confidenceScore) {
      analysis.confidenceScore = Math.max(0.5, Math.min(0.99, parseFloat(analysis.confidenceScore) || 0.8));
    } else {
      analysis.confidenceScore = 0.8;
    }
    
    // 5. Validate market signals
    if (analysis.marketSignals && Array.isArray(analysis.marketSignals)) {
      analysis.marketSignals = analysis.marketSignals.map((signal: any) => ({
        signal: signal.signal || 'Market activity detected',
        strength: ['Strong', 'Moderate', 'Weak'].includes(signal.strength) ? signal.strength : 'Moderate',
        trend: ['up', 'down', 'stable'].includes(signal.trend) ? signal.trend : 'stable',
        confidence: Math.max(0.5, Math.min(0.99, parseFloat(signal.confidence) || 0.7))
      })).slice(0, 5);
    } else {
      analysis.marketSignals = [];
    }
    
    // 6. Validate airline specifications
    if (analysis.airlineSpecifications && Array.isArray(analysis.airlineSpecifications)) {
      analysis.airlineSpecifications = analysis.airlineSpecifications.map((spec: any) => ({
        airline: spec.airline || context.airline || 'Unknown',
        relevance: ['High', 'Medium', 'Low'].includes(spec.relevance) ? spec.relevance : 'Medium',
        signals: Array.isArray(spec.signals) ? spec.signals.slice(0, 5) : [],
        competitiveImpact: ['High', 'Medium', 'Low'].includes(spec.competitiveImpact) ? spec.competitiveImpact : 'Medium'
      })).slice(0, 5);
    } else {
      analysis.airlineSpecifications = [];
    }
    
    // 7. Validate predictive probabilities
    if (analysis.predictiveProbabilities && Array.isArray(analysis.predictiveProbabilities)) {
      analysis.predictiveProbabilities = analysis.predictiveProbabilities.map((pred: any) => ({
        event: pred.event || 'Predicted market movement',
        probability: Math.max(0, Math.min(100, parseInt(pred.probability) || 50)),
        confidence: Math.max(0.5, Math.min(0.99, parseFloat(pred.confidence) || 0.7))
      })).slice(0, 5);
    } else {
      analysis.predictiveProbabilities = [];
    }
    
    // 8. Ensure summary exists and is reasonable
    if (!analysis.summary || analysis.summary.length < 20) {
      analysis.summary = `Analysis of ${context.airline || 'aviation'} intelligence indicates ${analysis.themes[0] || 'general'} activity with ${analysis.sentiment.overall.toLowerCase()} sentiment.`;
    }

    // Add metadata
    analysis.timestamp = new Date().toISOString();
    analysis.modelUsed = modelToUse;
    analysis.originalTranscriptionLength = cleanTranscription.length;

    // Determine the primary theme for database
    const primaryTheme = analysis.themes[0] || 'Operations';

    // Save insight to database
    if (context.airline || context.country || cleanTranscription.length > 20) {
      const dbUser = findUserById(user.userId);
      
      createInsight({
        userId: user.userId,
        userName: dbUser?.name || user.name,
        transcription: cleanTranscription,
        airline: context.airline || 'Unknown',
        country: context.country || 'Unknown',
        theme: primaryTheme,
        sentiment: analysis.sentiment.overall,
        score: analysis.sentiment.score,
        summary: analysis.summary,
        keywords: analysis.keywords,
        analysis,
      });
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);

    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        { success: false, error: 'Invalid OpenAI API key' },
        { status: 503 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

