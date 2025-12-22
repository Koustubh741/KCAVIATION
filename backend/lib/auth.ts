import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken, JWTPayload } from './jwt';

/**
 * Verify authentication from request
 */
export function getAuthUser(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);
  return verifyToken(token);
}

/**
 * Authentication middleware wrapper
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, user: JWTPayload, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const user = getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid or missing token' },
        { status: 401 }
      );
    }

    return handler(request, user, ...args);
  };
}

/**
 * Role-based authorization middleware
 */
export function withRole(allowedRoles: string[]) {
  return function <T extends any[]>(
    handler: (request: NextRequest, user: JWTPayload, ...args: T) => Promise<NextResponse>
  ) {
    return withAuth(async (request: NextRequest, user: JWTPayload, ...args: T) => {
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }

      return handler(request, user, ...args);
    });
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize user object for response (remove sensitive data)
 */
export function sanitizeUser(user: any): any {
  const { passwordHash, ...sanitizedUser } = user;
  return sanitizedUser;
}



