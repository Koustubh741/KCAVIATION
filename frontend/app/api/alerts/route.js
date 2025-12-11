export async function GET() {
  try {
    // Mock alerts data
    const mockAlerts = [
      {
        title: 'High Hiring Activity Detected',
        message:
          'Indigo has announced a significant increase in pilot hiring for the next quarter. This indicates strong growth expectations.',
        severity: 'High',
        airline: 'Indigo',
        category: 'Hiring',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        title: 'Route Expansion Alert',
        message:
          'Air India is planning to launch 15 new routes to Southeast Asia, indicating aggressive expansion strategy.',
        severity: 'Medium',
        airline: 'Air India',
        category: 'Expansion',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Financial Performance Update',
        message:
          'SpiceJet Q3 earnings exceeded market expectations by 12%, showing strong financial health.',
        severity: 'Medium',
        airline: 'SpiceJet',
        category: 'Financial',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Operational Delay Warning',
        message:
          'Vistara reports delays in fleet expansion due to supply chain disruptions. Expected impact on Q4 operations.',
        severity: 'Critical',
        airline: 'Vistara',
        category: 'Operations',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Safety Protocol Update',
        message:
          'GoAir has updated safety protocols following regulatory review. All operations remain normal.',
        severity: 'Low',
        airline: 'GoAir',
        category: 'Safety',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Market Sentiment Shift',
        message:
          'Overall market sentiment for aviation sector has shifted to positive, driven by increased travel demand.',
        severity: 'High',
        airline: 'Market Wide',
        category: 'Sentiment',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ]

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return Response.json(mockAlerts)
  } catch (error) {
    console.error('Alerts error:', error)
    return Response.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}


