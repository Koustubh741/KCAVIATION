import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAuthUser } from '@/lib/auth';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Aviation-specific prompt to improve Whisper accuracy
// This helps Whisper understand domain-specific terminology
const AVIATION_CONTEXT_PROMPT = `Aviation industry terminology: 
Airlines: Indigo, Air India, SpiceJet, Vistara, GoAir, AirAsia, Emirates, Lufthansa, British Airways, Singapore Airlines, Qatar Airways, Etihad Airways, American Airlines, Delta Airlines, United Airlines, Southwest Airlines.
Aircraft: Boeing 737, 747, 777, 787 Dreamliner, Airbus A320, A321, A330, A350, A380, ATR 72, Embraer E190.
Terms: fleet expansion, pilot hiring, crew training, fuel costs, load factor, revenue passenger kilometers, RPK, ASK, available seat kilometers, codeshare, wet lease, dry lease, MRO, maintenance repair overhaul, DGCA, FAA, EASA, CAA, slots, hub, spoke, LCC, FSC, narrowbody, widebody, turboprop.
Actions: hiring pilots, laying off staff, expanding fleet, adding routes, ordering aircraft, training crew, reporting profits, reporting losses, safety incidents, operational delays.`;

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
        { success: false, error: 'Transcription service not configured' },
        { status: 503 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg'];
    if (!validTypes.some(type => audioFile.type.includes(type.split('/')[1]))) {
      return NextResponse.json(
        { success: false, error: 'Invalid audio format. Supported: webm, mp3, wav, m4a, ogg' },
        { status: 400 }
      );
    }

    // Convert to OpenAI-compatible format
    const audioBuffer = await audioFile.arrayBuffer();
    const audioFileForOpenAI = new File(
      [audioBuffer],
      audioFile.name || 'recording.webm',
      { type: audioFile.type || 'audio/webm' }
    );

    // Transcribe with Whisper using aviation context for improved accuracy
    const transcription = await openai.audio.transcriptions.create({
      file: audioFileForOpenAI,
      model: 'whisper-1',
      language: 'en',
      response_format: 'verbose_json',
      // The prompt parameter significantly improves accuracy for domain-specific content
      // by providing context about expected terminology
      prompt: AVIATION_CONTEXT_PROMPT,
      // Temperature 0 for most deterministic/accurate results
      temperature: 0,
    });

    // Calculate approximate duration from segments if available
    let duration = 0;
    if (transcription.segments && transcription.segments.length > 0) {
      const lastSegment = transcription.segments[transcription.segments.length - 1];
      duration = lastSegment.end || 0;
    } else {
      // Fallback to file size estimate
      const fileSizeKB = audioFile.size / 1024;
      duration = Math.max(1, fileSizeKB / 16);
    }

    // Calculate average confidence from segments if available
    let avgConfidence = 0.95;
    if (transcription.segments && transcription.segments.length > 0) {
      const totalConfidence = transcription.segments.reduce(
        (sum: number, seg: any) => sum + (seg.avg_logprob ? Math.exp(seg.avg_logprob) : 0.9),
        0
      );
      avgConfidence = Math.min(0.99, Math.max(0.5, totalConfidence / transcription.segments.length));
    }

    return NextResponse.json({
      success: true,
      transcription: transcription.text,
      metadata: {
        duration: Math.round(duration * 10) / 10,
        language: transcription.language || 'en',
        confidence: Math.round(avgConfidence * 100) / 100,
        segmentCount: transcription.segments?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Transcription error:', error);

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
      { success: false, error: error.message || 'Transcription failed' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}



