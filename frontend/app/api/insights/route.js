export async function GET() {
  try {
    // Note: Server-side routes can't access localStorage
    // Return empty array - insights are loaded client-side from localStorage
    // In production, you'd fetch from a backend database
    
    return Response.json([])
  } catch (error) {
    console.error('Insights error:', error)
    return Response.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}


