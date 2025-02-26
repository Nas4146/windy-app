import type { RequestHandler } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth';
import { apiLimiter, checkRateLimit } from '$lib/server/rateLimiter';
import { APIError, handleAPIError } from '$lib/server/apiError';


export const GET: RequestHandler = async (event) => {
    try {
        // Check rate limit
        const rateLimitResult = checkRateLimit(event, apiLimiter);
        if (rateLimitResult instanceof Response) {
            return rateLimitResult;
        }
      await requireAuth(event);
      return new Response(
        JSON.stringify({
            version: '1.0.0',
            endpoints: ['/api/v1/tasks', '/api/v1/tasks/:id', '/api/v1/boards', '/api/v1/boards/:id/tasks']
        }),
        {
            headers: {
                'Content-Type': 'application/json',
                ...rateLimitResult.headers
            }
        }
    );
} catch (error) {
    return handleAPIError(error);
}
};