export async function POST(request) {
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

    // Get backend API URL from environment or use default
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'
    
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
    return Response.json(
      { error: 'Failed to process transcription: ' + error.message },
      { status: 500 }
    )
  }
}


