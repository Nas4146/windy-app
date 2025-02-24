import { redirect } from '@sveltejs/kit';

export async function POST({ cookies }) {
    const tempSessionStr = cookies.get('temp_session');
    if (!tempSessionStr) {
        throw redirect(303, '/login');
    }

    const tempSession = JSON.parse(tempSessionStr);

    // Set permanent session
    cookies.set('session', tempSessionStr, { // Use the entire temp session
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    // Clear temporary session
    cookies.delete('temp_session', { path: '/' });

    return new Response(null, { status: 200 });
}