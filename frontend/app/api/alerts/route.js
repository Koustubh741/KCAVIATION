export async function GET(request) {
  try {
    // Get user from query params or headers (if available)
    const url = new URL(request.url)
    const userEmail = url.searchParams.get('user') || null

    // Note: In a real app, you'd get this from session/auth
    // For now, we'll generate alerts from all recordings
    // In production, filter by authenticated user

    // Since this is a server-side route, we can't access localStorage directly
    // Return empty array - alerts will be generated client-side from recordings
    // Or you could implement a backend API endpoint for alerts
    
    return Response.json([])
  } catch (error) {
    console.error('Alerts error:', error)
    return Response.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}


