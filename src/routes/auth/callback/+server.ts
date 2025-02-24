import { redirect } from '@sveltejs/kit';
import { authConfig } from '$lib/config/auth0';
import { createUserProfile, getUserProfile } from '$lib/stores/userStore';

export async function GET({ url, cookies }) {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    
    // Handle email verification requirement
    if (error === 'unauthorized' && errorDescription?.includes('email')) {
        const email = url.searchParams.get('email');
        return new Response(null, {
            status: 303,
            headers: {
                Location: `/verify-email?email=${encodeURIComponent(email || '')}`
            }
        });
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch(`https://${authConfig.domain}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                client_id: authConfig.clientId,
                client_secret: authConfig.clientSecret,
                code,
                redirect_uri: authConfig.redirectUri
            })
        });

        const tokens = await tokenResponse.json();

        if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for tokens');
        }

        // Get user info from Auth0
        const userResponse = await fetch(`https://${authConfig.domain}/userinfo`, {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });

        const user = await userResponse.json();

         // Check if email is verified
         if (!user.email_verified) {
            return new Response(null, {
                status: 303,
                headers: {
                    Location: `/verify-email?email=${encodeURIComponent(user.email)}`
                }
            });
        }

        // Check if user profile exists in Firebase
        const existingProfile = await getUserProfile(user.sub);
        
        if (!existingProfile) {
            cookies.set('temp_session', JSON.stringify({ user }), {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 // 1 hour
            });
            
            return new Response(null, {
                status: 303,
                headers: {
                    Location: '/profile/setup'
                }
            });
        }

        // Set session for existing users
        cookies.set('temp_session', JSON.stringify({ user }), {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 // 1 hour
        });

        return new Response(null, {
            status: 303,
            headers: {
                Location: '/boards'
            }
        });
    } catch (error) {
        console.error('Auth callback error:', error);
        if (error instanceof Response) {
            throw error;
        }
        throw redirect(303, '/?error=authentication_failed');
    }
}