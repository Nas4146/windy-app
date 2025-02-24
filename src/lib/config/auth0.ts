import { env } from '$env/dynamic/private';

export const authConfig = {
    domain: env.AUTH0_DOMAIN,
    clientId: env.AUTH0_CLIENT_ID,
    clientSecret: env.AUTH0_CLIENT_SECRET,
    redirectUri: env.AUTH0_CALLBACK_URL,
    logoutRedirectUri: env.AUTH0_LOGOUT_URL
};