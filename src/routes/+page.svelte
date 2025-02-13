<script lang="ts">
    import { goto } from '$app/navigation';
    
    const navigateToBoards = () => {
      goto('/boards');
    };
  </script>
  
  <div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">Welcome to Windy</h1>
      <p class="mb-8">Your minimal agile sprint board</p>
      <button
        on:click={navigateToBoards}
        class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
      >
        View Boards
      </button>
    </div>
  </div>