/**
 * Simple in-memory rate limiter for auth endpoints.
 * Tracks requests by IP address with a sliding window.
 *
 * For production, replace with Redis-based rate limiting (e.g., rate-limiter-flexible).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // timestamp when window resets
}

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 20; // max requests per window

// In-flight cleanup interval
const tracked = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of tracked.entries()) {
    if (entry.resetAt <= now) {
      tracked.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request from this IP should be rate limited.
 * Returns { allowed, remaining, resetAt }.
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = tracked.get(ip);

  if (!entry || entry.resetAt <= now) {
    // Start a new window
    const resetAt = now + WINDOW_MS;
    tracked.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt };
  }

  // Within active window
  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}

/**
 * Get remaining requests for an IP without incrementing.
 */
export function getRateLimitStatus(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = tracked.get(ip);

  if (!entry || entry.resetAt <= now) {
    return { allowed: true, remaining: MAX_REQUESTS, resetAt: now + WINDOW_MS };
  }

  return {
    allowed: entry.count < MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - entry.count),
    resetAt: entry.resetAt,
  };
}
