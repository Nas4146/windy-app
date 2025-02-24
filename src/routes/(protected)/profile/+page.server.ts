import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getUserProfile } from '$lib/stores/userStore';

export const load: PageServerLoad = async ({ locals }) => {
    console.log('Profile page load started, locals:', {
        hasUser: !!locals.user,
        userId: locals.user?.sub
    });

    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    try {
        console.log('Fetching profile for user:', locals.user.sub);
        const profile = await getUserProfile(locals.user.sub);
        console.log('Profile load complete:', { profile });

        return {
            profile: profile || {
                id: locals.user.sub,
                email: locals.user.email || '',
                displayName: '',
                avatarUrl: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            user: {
                ...locals.user,
                sub: locals.user.sub
            }
        };
    } catch (e) {
        console.error('Error in profile page load:', e);
        throw error(500, {
            message: 'Failed to load profile',
            code: 'PROFILE_LOAD_ERROR'
        });
    }
};