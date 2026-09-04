import "server-only";

/**
 * Small in-process sliding-window rate limiter.
 *
 * Scope note: state lives in this process's memory, so it does not coordinate
 * across serverless instances or multiple servers — a request routed to a cold
 * instance starts with a clean counter. That is fine for slowing down casual
 * form spam and runaway chat loops, which is all it is here for. If the site
 * ever needs a real guarantee (or the chat endpoint starts costing money at
 * scale), move this to Redis / Upstash and keep the same call signature.
 */

type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

// Bounds memory if a burst of unique IPs creates many keys.
const MAX_TRACKED_KEYS = 10_000;

function sweep(now: number) {
  for (const [key, hit] of buckets) {
    if (hit.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the window resets. Only meaningful when `ok` is false. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) sweep(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true, retryAfter: 0 };
}

/**
 * Best-effort client IP.
 *
 * These headers are set by the proxy in front of the app (Vercel, nginx, etc.)
 * and are spoofable when the app is exposed directly. Good enough for rate
 * limiting; do not use for anything security-critical.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
