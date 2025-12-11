export async function GET() {
  try {
    // Mock insights data
    const mockInsights = [
      {
        transcription: 'Pilot hiring increasing next month',
        airline: 'Indigo',
        theme: 'Hiring',
        sentiment: 'Positive',
        score: 0.89,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        transcription: 'New routes to Southeast Asia announced',
        airline: 'Air India',
        theme: 'Expansion',
        sentiment: 'Positive',
        score: 0.92,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        transcription: 'Q3 earnings exceed expectations',
        airline: 'SpiceJet',
        theme: 'Financial',
        sentiment: 'Positive',
        score: 0.85,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        transcription: 'Fleet expansion delayed due to supply chain issues',
        airline: 'Vistara',
        theme: 'Operations',
        sentiment: 'Negative',
        score: 0.78,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        transcription: 'Safety protocols updated following review',
        airline: 'GoAir',
        theme: 'Safety',
        sentiment: 'Neutral',
        score: 0.82,
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      },
      {
        transcription: 'Massive recruitment drive for cabin crew',
        airline: 'Indigo',
        theme: 'Hiring',
        sentiment: 'Positive',
        score: 0.91,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return Response.json(mockInsights)
  } catch (error) {
    console.error('Insights error:', error)
    return Response.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}


