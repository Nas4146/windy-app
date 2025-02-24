<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import '../../styles/shared.css';
</script>

<div class="layout">
  <header class="header">
    <div class="header-content">
      <div class="flex items-center gap-2">
        <img 
          src="/images/logo.svg" 
          alt="Windy Logo" 
          class="h-8 w-8"
        />
        <h1 class="text-xl font-bold text-indigo-600">Windy</h1>
      </div>
      {#if $page.data.user}
        <div class="flex items-center">
          <button 
            class="profile-button"
            on:click={() => goto('/profile')}
          >
          <img
          src={$page.data.user.avatarUrl || '/images/default-avatar.png'}
          alt="Profile"
          class="w-10 h-10 rounded-full object-cover border-2 border-white hover:border-indigo-500 transition-colors duration-200"
        />
          </button>
        </div>
      {/if}
    </div>
  </header>

  <main>
    <slot />
  </main>
</div>