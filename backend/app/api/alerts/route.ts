import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getAlerts, createAlert, AlertFilters } from '@/lib/db';

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
    
    const filters: AlertFilters = {
      severity: searchParams.get('severity') as any || undefined,
      airline: searchParams.get('airline') || undefined,
      category: searchParams.get('category') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const result = getAlerts(filters);

    return NextResponse.json({
      success: true,
      alerts: result.alerts,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Alerts fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch alerts' },
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

    // Only admin/manager can create alerts manually
    if (!['admin', 'manager'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to create alerts' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      message,
      severity,
      airline,
      country,
      category,
      relatedInsightIds,
      actionRequired,
    } = body;

    // Validate required fields
    if (!title || !message || !severity) {
      return NextResponse.json(
        { success: false, error: 'Title, message, and severity are required' },
        { status: 400 }
      );
    }

    // Validate severity
    const validSeverities = ['Critical', 'High', 'Medium', 'Low'];
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { success: false, error: 'Invalid severity level' },
        { status: 400 }
      );
    }

    // Validate category - must match fixed themes
    const validCategories = ['Hiring', 'Expansion', 'Financial', 'Operations', 'Safety', 'Training'];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category. Must be one of: Hiring, Expansion, Financial, Operations, Safety, Training' },
        { status: 400 }
      );
    }

    const newAlert = createAlert({
      title,
      message,
      severity,
      airline: airline || 'General',
      country: country || 'Global',
      category: category || 'Sentiment',
      relatedInsightIds: relatedInsightIds || [],
      actionRequired: actionRequired || false,
      acknowledged: false,
    });

    return NextResponse.json(
      {
        success: true,
        alert: newAlert,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Alert creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create alert' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

