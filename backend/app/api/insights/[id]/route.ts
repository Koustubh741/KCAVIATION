import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getInsightById } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const insight = getInsightById(params.id);

    if (!insight) {
      return NextResponse.json(
        { success: false, error: 'Insight not found' },
        { status: 404 }
      );
    }

    // Check permissions - only allow access to own insights unless admin/manager
    if (!['admin', 'manager', 'executive'].includes(user.role) && insight.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      insight,
    });
  } catch (error: any) {
    console.error('Insight fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch insight' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}



