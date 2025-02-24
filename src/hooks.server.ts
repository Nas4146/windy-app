import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // Protected routes that require authentication
    const protectedRoutes = ['/boards'];
    const isProtectedRoute = protectedRoutes.some(route => 
        event.url.pathname.startsWith(route)
    );

    // Get session from cookie
    const session = event.cookies.get('session');
    event.locals.user = session ? JSON.parse(session).user : null;

    // Redirect to login if accessing protected route without auth
    if (isProtectedRoute && !event.locals.user) {
        throw redirect(303, '/login');
    }

    return await resolve(event);
};