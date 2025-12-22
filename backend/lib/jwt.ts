import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export interface DecodedToken extends JWTPayload {
  iat: number;
  exp: number;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string | undefined | null): JWTPayload | null {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Refresh an existing token
 */
export function refreshToken(oldToken: string): string | null {
  const decoded = verifyToken(oldToken);
  if (!decoded) return null;

  return generateToken({
    userId: decoded.userId,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
  });
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
}



