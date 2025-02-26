import { redirect, type Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import dotenv from 'dotenv';

// Load environment variables in development
if (!building) {
    dotenv.config();
}

export const handle: Handle = async ({ event, resolve }) => {
    // Protected routes that require authentication
    const protectedRoutes = ['/boards', '/profile'];
    const isProtectedRoute = protectedRoutes.some(route => 
        event.url.pathname.startsWith(route)
    );

    // API routes are always protected
    const isApiRoute = event.url.pathname.startsWith('/api/v1');

    // Get session from cookie
    const session = event.cookies.get('session');
    event.locals.user = session ? JSON.parse(session).user : null;

        // Handle API authentication
        if (isApiRoute && !event.locals.user) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Unauthorized',
                    status: 401
                }),
                { 
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

    // Redirect to login if accessing protected route without auth
    if (isProtectedRoute && !event.locals.user) {
        throw redirect(303, '/login');
    }

    return await resolve(event);
};