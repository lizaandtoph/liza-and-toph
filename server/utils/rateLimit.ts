// server/utils/rateLimit.ts
/**
 * Simple in-memory rate limiter
 * Prevents a single email from being sent repeatedly within a short time.
 * (Resets automatically every few minutes.)
 */

const attempts = new Map<string, { count: number; last: number }>();

export function checkRateLimit(key: string, limit = 3, windowMs = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = attempts.get(key) || { count: 0, last: now };

  // Reset if outside window
  if (now - entry.last > windowMs) {
    attempts.set(key, { count: 1, last: now });
    return true;
  }

  // Increment and check limit
  entry.count += 1;
  entry.last = now;
  attempts.set(key, entry);

  return entry.count <= limit;
}

export function resetRateLimit() {
  attempts.clear();
}