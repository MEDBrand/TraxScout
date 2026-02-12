// Rate Limiting - Protect against abuse and DDoS
//
// ⚠️ IMPORTANT: This in-memory store does NOT work reliably on serverless
// platforms (Vercel, AWS Lambda) because each function instance has its own
// memory and cold starts reset all state. For production, replace with:
//   - Upstash Redis (recommended for Vercel — @upstash/ratelimit)
//   - Vercel KV
//   - Any external Redis instance
//
// The middleware.ts rate limiter has the same limitation.
// TODO: Migrate to Upstash Redis before launch (Feb 26)

import { NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyPrefix?: string;    // Prefix for rate limit key
}

// In-memory store — NOT suitable for serverless production. See note above.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const RATE_LIMITS = {
  // API routes
  api: { windowMs: 60 * 1000, maxRequests: 100 },         // 100/min
  
  // Auth routes (stricter)
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },    // 10/15min
  
  // Scan triggers
  scan: { windowMs: 60 * 60 * 1000, maxRequests: 5 },     // 5/hour
  
  // Checkout
  checkout: { windowMs: 60 * 1000, maxRequests: 5 },      // 5/min
  
  // Webhook (high limit for Stripe)
  webhook: { windowMs: 60 * 1000, maxRequests: 1000 },    // 1000/min
} as const;

/**
 * Check rate limit for a given identifier
 * Returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${config.keyPrefix || 'rl'}:${identifier}`;
  const now = Date.now();
  
  const existing = rateLimitStore.get(key);
  
  if (!existing || existing.resetAt < now) {
    // New window
    const resetAt = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }
  
  if (existing.count >= config.maxRequests) {
    // Rate limited
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }
  
  // Increment
  existing.count++;
  return { 
    allowed: true, 
    remaining: config.maxRequests - existing.count, 
    resetAt: existing.resetAt 
  };
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  handler: (req: Request) => Promise<NextResponse>,
  config: RateLimitConfig = RATE_LIMITS.api
) {
  return async (req: Request): Promise<NextResponse> => {
    // Get identifier (IP or user ID)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0] || 'unknown';
    
    const result = checkRateLimit(ip, config);
    
    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetAt.toString(),
            'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }
    
    const response = await handler(req);
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetAt.toString());
    
    return response;
  };
}

/**
 * IP-based blocking for suspicious activity
 */
const blockedIPs = new Set<string>();

export function blockIP(ip: string, durationMs: number = 24 * 60 * 60 * 1000) {
  blockedIPs.add(ip);
  setTimeout(() => blockedIPs.delete(ip), durationMs);
}

export function isIPBlocked(ip: string): boolean {
  return blockedIPs.has(ip);
}
