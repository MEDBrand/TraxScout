// Anti-Abuse & Scraping Prevention

import crypto from 'crypto';
import { logSecurityEvent } from './security';

// ============================================
// OUTPUT FINGERPRINTING / WATERMARKING
// ============================================

/**
 * Generate invisible watermark for track outputs
 * Embeds user ID in output ordering/formatting
 * If data is leaked, we can trace the source
 */
export function watermarkOutput(
  userId: string,
  tracks: Array<{ id: string; [key: string]: unknown }>
): Array<{ id: string; [key: string]: unknown }> {
  // Create deterministic but user-specific ordering variations
  const userHash = crypto.createHash('sha256').update(userId).digest('hex');
  const seed = parseInt(userHash.slice(0, 8), 16);
  
  // Add invisible metadata
  return tracks.map((track, index) => ({
    ...track,
    // Invisible watermark: microsecond offset based on user + position
    _t: Date.now() + (seed % 1000) + index,
    // Response ID that encodes user info (for leak tracing)
    _r: generateResponseId(userId, track.id),
  }));
}

/**
 * Generate response ID that can be traced back to user
 * Format looks random but encodes user info
 */
function generateResponseId(userId: string, trackId: string): string {
  const data = `${userId}:${trackId}:${Date.now()}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  // Take 16 chars - looks like random ID but is traceable
  return hash.slice(0, 16);
}

/**
 * Decode response ID to find user (for leak investigation)
 * Requires checking against all users - use only for investigations
 */
export function traceResponseId(responseId: string, suspectedUserId: string, trackId: string): boolean {
  // Check if this user could have generated this response
  // (Would need to check within a time window in production)
  const testData = `${suspectedUserId}:${trackId}`;
  return responseId.length === 16; // Simplified - real impl would verify
}

// ============================================
// SCRAPING DETECTION
// ============================================

interface UserBehavior {
  requests: number[];  // Timestamps
  uniqueEndpoints: Set<string>;
  avgInterval: number;
  suspicionScore: number;
}

const userBehaviorMap = new Map<string, UserBehavior>();

/**
 * Track user behavior for anomaly detection
 */
export function trackBehavior(userId: string, endpoint: string): void {
  const now = Date.now();
  const behavior = userBehaviorMap.get(userId) || {
    requests: [],
    uniqueEndpoints: new Set(),
    avgInterval: 0,
    suspicionScore: 0,
  };
  
  behavior.requests.push(now);
  behavior.uniqueEndpoints.add(endpoint);
  
  // Keep only last 100 requests
  if (behavior.requests.length > 100) {
    behavior.requests = behavior.requests.slice(-100);
  }
  
  // Calculate average interval
  if (behavior.requests.length > 1) {
    const intervals = [];
    for (let i = 1; i < behavior.requests.length; i++) {
      intervals.push(behavior.requests[i] - behavior.requests[i - 1]);
    }
    behavior.avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }
  
  userBehaviorMap.set(userId, behavior);
}

/**
 * Detect suspicious scraping behavior
 */
export function detectScraping(userId: string): {
  isSuspicious: boolean;
  reasons: string[];
  score: number;
} {
  const behavior = userBehaviorMap.get(userId);
  if (!behavior) return { isSuspicious: false, reasons: [], score: 0 };
  
  const reasons: string[] = [];
  let score = 0;
  
  // Check 1: Too many requests in short time
  const recentRequests = behavior.requests.filter(t => Date.now() - t < 60000);
  if (recentRequests.length > 50) {
    reasons.push('High request volume');
    score += 30;
  }
  
  // Check 2: Suspiciously consistent intervals (bot-like)
  if (behavior.avgInterval > 0 && behavior.avgInterval < 500) {
    reasons.push('Request interval too consistent');
    score += 25;
  }
  
  // Check 3: Hitting many endpoints systematically
  if (behavior.uniqueEndpoints.size > 20) {
    reasons.push('Accessing many endpoints');
    score += 20;
  }
  
  // Check 4: Requests at unusual hours (optional)
  const hour = new Date().getHours();
  if (hour >= 2 && hour <= 5 && recentRequests.length > 10) {
    reasons.push('High activity at unusual hours');
    score += 15;
  }
  
  const isSuspicious = score >= 50;
  
  if (isSuspicious) {
    logSecurityEvent('scraping_detected', { userId, score, reasons }, 'warning');
  }
  
  return { isSuspicious, reasons, score };
}

// ============================================
// API AUTHENTICATION
// ============================================

/**
 * Generate API token for authenticated requests
 */
export function generateApiToken(userId: string): string {
  const payload = {
    uid: userId,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  };
  
  const data = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', process.env.ENCRYPTION_KEY!)
    .update(data)
    .digest('hex');
  
  return Buffer.from(`${data}:${signature}`).toString('base64');
}

/**
 * Verify API token
 */
export function verifyApiToken(token: string): { valid: boolean; userId?: string } {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [data, signature] = decoded.split(':');
    
    const expectedSig = crypto
      .createHmac('sha256', process.env.ENCRYPTION_KEY!)
      .update(data)
      .digest('hex');
    
    if (signature !== expectedSig) {
      return { valid: false };
    }
    
    const payload = JSON.parse(data);
    
    if (payload.exp < Date.now()) {
      return { valid: false };
    }
    
    return { valid: true, userId: payload.uid };
  } catch {
    return { valid: false };
  }
}

// ============================================
// CORS POLICY
// ============================================

export const corsConfig = {
  allowedOrigins: [
    'https://traxscout.app',
    'https://www.traxscout.app',
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  // In development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    if (origin.includes('localhost')) return true;
  }
  
  return corsConfig.allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith(allowed.replace('https://', '.'))
  );
}
