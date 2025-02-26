<script lang="ts">
    import { updateUserProfile } from '$lib/stores/userStore';
    import { goto } from '$app/navigation';
    import '../../../styles/shared.css';
    
    export let data;

    let loading = false;
    let error = '';
    let avatarFile: File | null = null;
    let avatarPreview: string | null = null;

    $: console.log('Profile page data:', data);

    async function handleAvatarChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        
        if (file) {
            avatarFile = file;
            avatarPreview = URL.createObjectURL(file);
            
            try {
                // TODO: Implement file upload to Firebase Storage
                const avatarUrl = ''; // Will be implemented later
                await updateUserProfile(data.user.sub, {
                    avatarUrl
                });
            } catch (e) {
                error = 'Error updating avatar';
            }
        }
    }

    async function handleLogout() {
        try {
            const response = await fetch('/auth/logout', { method: 'POST' });
            if (response.ok) {
                window.location.href = '/';
            }
        } catch (e) {
            console.error('Logout failed:', e);
        }
    }
    async function handleExit() {
        await goto('/boards');
    }
</script>

{#if data?.profile}
    <div class="container-base">
        <div class="max-w-2xl mx-auto py-8">
            <div class="bg-white shadow rounded-lg">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 class="text-xl font-semibold text-gray-900">Profile Settings</h2>
                    <button 
                    class="exit-button"
                    on:click={handleExit}
                    aria-label="Return to boards"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        class="h-6 w-6" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                </div>

                <div class="p-6 space-y-6">
                    <!-- Avatar Section -->
                    <div class="flex items-center gap-4">
                        <div class="relative">
                            <img
                                src={avatarPreview || data.profile.avatarUrl || '/images/default-avatar.png'}
                                alt="Profile"
                                class="w-20 h-20 rounded-full object-cover"
                            />
                            <label 
                                for="avatar-input"
                                class="avatar-upload-button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </label>
                            <input
                                id="avatar-input"
                                type="file"
                                accept="image/*"
                                class="hidden"
                                on:change={handleAvatarChange}
                            />
                        </div>
                        <div>
                            <h3 class="text-lg font-medium">{data.profile.displayName}</h3>
                            <p class="text-sm text-gray-500">{data.profile.email}</p>
                        </div>
                    </div>

                    <!-- Profile Info -->
                    <dl class="space-y-4">
                        <div>
                            <dt class="block text-sm font-medium text-gray-700">Display Name</dt>
                            <dd class="mt-1 text-gray-900">{data.profile.displayName}</dd>
                        </div>
                        <div>
                            <dt class="block text-sm font-medium text-gray-700">Email</dt>
                            <dd class="mt-1 text-gray-900">{data.profile.email}</dd>
                        </div>
                    </dl>

                    <!-- Logout Button -->
                    <div class="pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            class="btn btn-danger w-full"
                            on:click={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
{:else}
    <div class="flex items-center justify-center min-h-screen">
        <p class="text-gray-500">Loading profile...</p>
    </div>
{/if}