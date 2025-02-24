import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies }) => {
    const tempSessionStr = cookies.get('temp_session');
    console.log('Loading profile setup page, temp session:', tempSessionStr); // Debug log

    if (!tempSessionStr) {
        console.log('No temp session found');
        throw redirect(303, '/login');
    }

    try {
        const tempSession = JSON.parse(tempSessionStr);
        console.log('Parsed temp session:', tempSession);

        if (!tempSession.user) {
            console.log('No user in temp session');
            throw redirect(303, '/login');
        }

        return {
            tempSession
        };
    } catch (error) {
        console.error('Error parsing temp session:', error);
        throw redirect(303, '/login');
    }
};