// Minimal middleware — security headers only
// Auth redirects disabled until auth flow is stable

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const securityHeaders: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

export async function middleware(request: NextRequest) {
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
