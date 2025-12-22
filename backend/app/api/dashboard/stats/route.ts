import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getDashboardStats } from '@/lib/db';

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

    // Get stats - if not admin/manager, only get own stats
    const userId = ['admin', 'manager', 'executive'].includes(user.role)
      ? undefined
      : user.userId;

    const stats = getDashboardStats(userId);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}



