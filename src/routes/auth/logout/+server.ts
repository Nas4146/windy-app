import { redirect } from '@sveltejs/kit';
import { authConfig } from '$lib/config/auth0';

export async function POST({ cookies }) {
    // Delete the session cookie
    cookies.delete('session', { path: '/' });
    
    // Construct Auth0 logout URL
    const logoutUrl = new URL(`https://${authConfig.domain}/v2/logout`);
    logoutUrl.searchParams.set('client_id', authConfig.clientId);
    logoutUrl.searchParams.set('returnTo', authConfig.logoutRedirectUri);

    return new Response(logoutUrl.toString());
}