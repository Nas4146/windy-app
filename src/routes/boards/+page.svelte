<script lang="ts">
  import { FirestoreCollection } from 'sveltefire';
  import type { Board } from '$lib/types/board';

  const BOARDS_COLLECTION = 'boards';
</script>

<div class="p-4">
  <h1 class="text-2xl font-bold mb-4">My Boards</h1>
  
  <FirestoreCollection path={BOARDS_COLLECTION} let:data={boards}>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each boards as board}
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="text-xl font-semibold">{board.title}</h2>
          <div class="flex space-x-4 mt-4">
            {#each board.columns as column}
              <div class="bg-gray-100 p-3 rounded min-w-[250px]">
                <h3 class="font-medium mb-2">{column.title}</h3>
                <!-- Tasks will go here -->
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </FirestoreCollection>
</div>