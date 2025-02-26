import type { RequestEvent } from '@sveltejs/kit';
import type { APIError } from '$lib/types/api';

export async function requireAuth(event: RequestEvent) {
    const userId = event.locals.user?.sub;
    
    if (!userId) {
        const error: APIError = {
            success: false,
            error: 'Unauthorized',
            status: 401
        };
        
        throw new Response(JSON.stringify(error), {
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    
    return userId;
}