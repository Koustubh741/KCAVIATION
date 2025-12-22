import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting storage (in-memory - for production use Redis)
const rateLimit = new Map<string, { count: number; timestamp: number }>();

const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    setCorsHeaders(response);
    return response;
  }

  // Rate limiting
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const rateLimitData = rateLimit.get(ip);

  if (rateLimitData) {
    if (now - rateLimitData.timestamp > RATE_LIMIT_WINDOW) {
      // Reset window
      rateLimit.set(ip, { count: 1, timestamp: now });
    } else if (rateLimitData.count >= RATE_LIMIT_MAX) {
      // Rate limit exceeded
      const response = NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
      setCorsHeaders(response);
      response.headers.set('Retry-After', String(Math.ceil((RATE_LIMIT_WINDOW - (now - rateLimitData.timestamp)) / 1000)));
      return response;
    } else {
      // Increment count
      rateLimit.set(ip, { count: rateLimitData.count + 1, timestamp: rateLimitData.timestamp });
    }
  } else {
    // First request from this IP
    rateLimit.set(ip, { count: 1, timestamp: now });
  }

  // Continue to the API route
  const response = NextResponse.next();
  setCorsHeaders(response);
  
  return response;
}

function setCorsHeaders(response: NextResponse) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  
  response.headers.set('Access-Control-Allow-Origin', allowedOrigins[0] || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
}

export const config = {
  matcher: '/api/:path*',
};



