import { redirect } from '@sveltejs/kit';
import { authConfig } from '$lib/config/auth0';

export function GET() {
    const authUrl = new URL(`https://${authConfig.domain}/authorize`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', authConfig.clientId);
    authUrl.searchParams.set('redirect_uri', authConfig.redirectUri);
    authUrl.searchParams.set('scope', 'openid profile email');
    //authUrl.searchParams.set('connection', 'windy-users');
    authUrl.searchParams.set('prompt', 'login');
    authUrl.searchParams.set('screen_hint', 'signup');

    throw redirect(303, authUrl.toString());
}