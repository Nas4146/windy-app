<script lang="ts">
  import { FirebaseApp } from 'sveltefire';
  import { app } from '$lib/firebase';
</script>

<FirebaseApp {app}>
  <main class="min-h-screen bg-gray-50">
    <slot />
  </main>
</FirebaseApp>