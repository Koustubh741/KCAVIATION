import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getInsights, createInsight, InsightFilters } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    
    const filters: InsightFilters = {
      airline: searchParams.get('airline') || undefined,
      theme: searchParams.get('theme') || undefined,
      sentiment: searchParams.get('sentiment') as any || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      userId: searchParams.get('userId') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // If not admin/manager, only show own insights
    if (!['admin', 'manager', 'executive'].includes(user.role)) {
      filters.userId = user.userId;
    }

    const result = getInsights(filters);

    return NextResponse.json({
      success: true,
      insights: result.insights,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Insights fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch insights' },
      { status: 500 }
    );
  }
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

    const body = await request.json();
    const {
      transcription,
      airline,
      country,
      theme,
      sentiment,
      score,
      summary,
      keywords,
      analysis,
    } = body;

    // Validate required fields
    if (!transcription || !airline) {
      return NextResponse.json(
        { success: false, error: 'Transcription and airline are required' },
        { status: 400 }
      );
    }

    const newInsight = createInsight({
      userId: user.userId,
      userName: user.name,
      transcription,
      airline,
      country: country || 'Unknown',
      theme: theme || 'General',
      sentiment: sentiment || 'Neutral',
      score: score || 0.5,
      summary: summary || '',
      keywords: keywords || [],
      analysis: analysis || {},
    });

    return NextResponse.json(
      {
        success: true,
        insight: newInsight,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Insight creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create insight' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}



