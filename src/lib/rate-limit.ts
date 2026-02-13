// In-memory rate limiter (stopgap until Upstash Redis)
// Resets on cold start — blocks burst attacks but not persistent attackers
// TODO: Replace with @upstash/ratelimit when credentials are available

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 min
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

export function rateLimit(
  key: string,
  opts: { max: number; windowMs: number }
): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { success: true, remaining: opts.max - 1, resetIn: opts.windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, opts.max - entry.count);
  const resetIn = entry.resetAt - now;

  if (entry.count > opts.max) {
    return { success: false, remaining: 0, resetIn };
  }

  return { success: true, remaining, resetIn };
}
