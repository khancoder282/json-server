const WINDOW_MS = 60_000  // 1 phút
const MAX_REQUESTS = 100

// Map<apiKeyId, timestamp[]>
const hits = new Map<string, number[]>()

export type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: Date
}

export function checkRateLimit(keyId: string): RateLimitResult {
  const now = Date.now()
  const window = (hits.get(keyId) ?? []).filter((t) => now - t < WINDOW_MS)

  if (window.length >= MAX_REQUESTS) {
    hits.set(keyId, window)
    return {
      allowed: false,
      limit: MAX_REQUESTS,
      remaining: 0,
      resetAt: new Date(window[0] + WINDOW_MS),
    }
  }

  window.push(now)
  hits.set(keyId, window)
  return {
    allowed: true,
    limit: MAX_REQUESTS,
    remaining: MAX_REQUESTS - window.length,
    resetAt: new Date(now + WINDOW_MS),
  }
}

export function rateLimitHeaders(rl: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(rl.limit),
    "X-RateLimit-Remaining": String(rl.remaining),
    "X-RateLimit-Reset": rl.resetAt.toISOString(),
  }
  if (!rl.allowed) {
    headers["Retry-After"] = String(
      Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000),
    )
  }
  return headers
}
