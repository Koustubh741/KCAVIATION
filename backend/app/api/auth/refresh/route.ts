import { NextRequest, NextResponse } from 'next/server';
import { refreshToken, extractToken, verifyToken } from '@/lib/jwt';
import { findUserById } from '@/lib/db';
import { sanitizeUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify current token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user still exists and is active
    const user = findUserById(decoded.userId);
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'User not found or deactivated' },
        { status: 401 }
      );
    }

    // Generate new token
    const newToken = refreshToken(token);
    if (!newToken) {
      return NextResponse.json(
        { success: false, error: 'Failed to refresh token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: sanitizeUser(user),
      token: newToken,
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}



