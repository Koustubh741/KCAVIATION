export async function POST(request) {
  // Get backend API URL from environment or use default (defined outside try block for error handling)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio')
    const airlineFilter = formData.get('airline_filter') || null
    const themeFilter = formData.get('theme_filter') || null

    if (!audioFile) {
      return Response.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }
    
    // Forward request to backend API
    const backendFormData = new FormData()
    backendFormData.append('audio', audioFile)
    if (airlineFilter) {
      backendFormData.append('airline_filter', airlineFilter)
    }
    if (themeFilter) {
      backendFormData.append('theme_filter', themeFilter)
    }

    const response = await fetch(`${backendUrl}/api/transcribe`, {
      method: 'POST',
      body: backendFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      return Response.json(
        { error: errorData.detail || errorData.error || 'Failed to process transcription' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('Transcription error:', error)
    
    // Check if it's a connection error
    let errorMessage = 'Failed to process transcription: ' + error.message
    if (error.cause?.code === 'ECONNREFUSED' || error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      errorMessage = `Cannot connect to backend server at ${backendUrl}. Please ensure:\n1. Backend server is running (check backend directory)\n2. Backend is accessible at ${backendUrl}\n3. No firewall is blocking the connection`
    }
    
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


