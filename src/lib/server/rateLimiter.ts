import type { RequestEvent } from '@sveltejs/kit';

interface RateLimitConfig {
    windowMs: number;    // Time window in milliseconds
    maxRequests: number; // Max requests per window
}

class RateLimiter {
    private requests: Map<string, number[]>;
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
        this.requests = new Map();
        this.config = config;
    }

    isRateLimited(key: string): boolean {
        const now = Date.now();
        const windowStart = now - this.config.windowMs;

        // Get existing requests for this key
        let requestTimestamps = this.requests.get(key) || [];
        
        // Filter out old requests
        requestTimestamps = requestTimestamps.filter(timestamp => timestamp > windowStart);
        
        // Check if rate limit is exceeded
        if (requestTimestamps.length >= this.config.maxRequests) {
            return true;
        }

        // Add new request
        requestTimestamps.push(now);
        this.requests.set(key, requestTimestamps);
        
        return false;
    }

    getRemainingRequests(key: string): number {
        const now = Date.now();
        const windowStart = now - this.config.windowMs;
        const requestTimestamps = this.requests.get(key) || [];
        const validRequests = requestTimestamps.filter(timestamp => timestamp > windowStart);
        return Math.max(0, this.config.maxRequests - validRequests.length);
    }
}

// Create different rate limiters for different endpoints
export const apiLimiter = new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100          // 100 requests per window
});

export const createLimiter = new RateLimiter({
    windowMs: 60 * 1000,     // 1 minute
    maxRequests: 5           // 5 requests per window
});

export function checkRateLimit(event: RequestEvent, limiter: RateLimiter) {
    const clientIp = event.getClientAddress();
    const userId = event.locals.user?.sub;
    const key = userId || clientIp;

    if (limiter.isRateLimited(key)) {
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Rate limit exceeded',
                retryAfter: '15 minutes'
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': '900'
                }
            }
        );
    }

    // Add rate limit headers
    const remaining = limiter.getRemainingRequests(key);
    return {
        headers: {
            'X-RateLimit-Limit': limiter.config.maxRequests.toString(),
            'X-RateLimit-Remaining': remaining.toString()
        }
    };
}