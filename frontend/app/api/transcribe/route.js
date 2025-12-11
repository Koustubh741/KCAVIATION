export async function POST(request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio')

    if (!audioFile) {
      return Response.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Mock transcription response
    const mockTranscription = {
      transcription: 'Pilot hiring increasing next month',
      airline: 'Indigo',
      theme: 'Hiring',
      sentiment: 'Positive',
      score: 0.89,
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return Response.json(mockTranscription)
  } catch (error) {
    console.error('Transcription error:', error)
    return Response.json(
      { error: 'Failed to process transcription' },
      { status: 500 }
    )
  }
}


