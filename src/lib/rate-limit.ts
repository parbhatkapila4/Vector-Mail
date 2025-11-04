import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  interval: number
  uniqueTokenPerInterval: number
}

class RateLimiter {
  private cache: Map<string, number[]>
  private interval: number
  private limit: number

  constructor(config: RateLimitConfig) {
    this.cache = new Map()
    this.interval = config.interval
    this.limit = config.uniqueTokenPerInterval
  }

  check(identifier: string): { success: boolean; remaining: number } {
    const now = Date.now()
    const timestamps = this.cache.get(identifier) || []

    const validTimestamps = timestamps.filter(
      timestamp => now - timestamp < this.interval
    )

    if (validTimestamps.length >= this.limit) {
      return { success: false, remaining: 0 }
    }

    validTimestamps.push(now)
    this.cache.set(identifier, validTimestamps)

    this.cleanup()

    return {
      success: true,
      remaining: this.limit - validTimestamps.length,
    }
  }

  private cleanup() {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((timestamps, key) => {
      const validTimestamps = timestamps.filter(
        timestamp => now - timestamp < this.interval
      )

      if (validTimestamps.length === 0) {
        keysToDelete.push(key)
      } else {
        this.cache.set(key, validTimestamps)
      }
    })

    keysToDelete.forEach(key => this.cache.delete(key))
  }
}

const limiters = {
  api: new RateLimiter({ interval: 60 * 1000, uniqueTokenPerInterval: 100 }),
  auth: new RateLimiter({ interval: 60 * 1000, uniqueTokenPerInterval: 5 }),
  emailSend: new RateLimiter({ interval: 60 * 1000, uniqueTokenPerInterval: 10 }),
}

export function getIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
  return ip
}

export function rateLimit(
  request: NextRequest,
  type: keyof typeof limiters = 'api'
): NextResponse | null {
  const identifier = getIdentifier(request)
  const limiter = limiters[type]
  const { success, remaining } = limiter.check(identifier)

  if (!success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limiter['limit'].toString(),
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60',
        },
      }
    )
  }

  return null
}

export { limiters }

