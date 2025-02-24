<script lang="ts">
  import '../styles/shared.css';
  import { FirebaseApp } from 'sveltefire';
  import { app, db } from '$lib/firebase';
 

  // Log the app to verify it's available
  console.log('Firebase app:', app);
</script>

<FirebaseApp app={app} firestore={db}>
  <main class="min-h-screen bg-gray-50">
    <slot />
  </main>
</FirebaseApp>

