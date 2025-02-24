<script lang="ts">
    import { createUserProfile } from '$lib/stores/userStore';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    export let data;

    let displayName = '';
    let avatarFile: File | null = null;
    let loading = false;
    let error = '';

    console.log('Profile setup mounted with data:', data);


    async function handleSubmit() {
        if (!displayName) {
            error = 'Display name is required';
            return;
        }

        loading = true;
        error = '';

        try {
            console.log('Attempting to create profile with data:', {
                tempSession: data.tempSession,
                displayName
            });

            if (!data.tempSession?.user) {
                console.error('No user data in tempSession:', data);
                throw new Error('No user data found');
            }

            const profile = await createUserProfile({
                user: data.tempSession.user,
                displayName
            });

            console.log('Profile created successfully:', profile);

            const response = await fetch('/profile/setup/complete-setup', {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to complete setup');
            }

            await goto('/boards');
        } catch (e) {
            console.error('Profile setup error:', e);
            error = e instanceof Error ? e.message : 'An error occurred';
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <div class="text-center">
            <h2 class="text-3xl font-extrabold text-gray-900">
                Almost There!
            </h2>
            <p class="mt-2 text-gray-600">
                Just one last step - choose a display name for your profile
            </p>
        </div>
        <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Complete Your Profile
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                Please provide a display name to continue
            </p>
        </div>

        <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
            <div class="rounded-md shadow-sm -space-y-px">
                <div>
                    <label for="display-name" class="sr-only">Display Name</label>
                    <input
                        id="display-name"
                        name="display-name"
                        type="text"
                        required
                        bind:value={displayName}
                        class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Display Name"
                    />
                </div>
            </div>

            {#if error}
                <p class="text-red-500 text-sm">{error}</p>
            {/if}

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {loading ? 'Setting up...' : 'Complete Setup'}
                </button>
            </div>
        </form>
    </div>
</div>