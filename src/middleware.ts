import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'https://trax-scout.vercel.app';

const securityHeaders: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

// Routes that require auth (cookie check)
const PROTECTED_ROUTES = ['/dashboard', '/settings', '/discover', '/audio-id', '/crate', '/onboarding'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- CORS for API routes ---
  if (isApiRoute(pathname)) {
    // Preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
          ...securityHeaders,
        },
      });
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    for (const [key, value] of Object.entries(securityHeaders)) {
      response.headers.set(key, value);
    }
    return response;
  }

  // --- Auth gate for protected pages ---
  if (isProtectedRoute(pathname)) {
    const hasSession = request.cookies.has('sb-access-token');
    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- Default: security headers ---
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sw.js|manifest.json|icons/).*)',
  ],
};
