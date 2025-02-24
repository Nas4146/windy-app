<script lang="ts">
  import { shareBoard } from '$lib/stores/boardStore';
  import type { Board } from '$lib/types/board';

  export let board: Board;
  export let onClose: () => void;

  let email = '';
  let accessLevel: 'read-only' | 'can-edit' = 'read-only';
  let error = '';
  let success = '';

  async function handleShare() {
    try {
      error = '';
      success = '';
      
      await shareBoard(board.id, {
        email,
        accessLevel
      });

      success = 'Board shared successfully';
      email = '';
      setTimeout(onClose, 2000);
    } catch (err) {
      error = err.message;
    }
  }
</script>

<div class="modal-overlay">
  <div class="modal-content">
    <h2 class="heading-2 mb-4">Share Board: {board.title}</h2>
    
    <form on:submit|preventDefault={handleShare} class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">
          Collaborator Email
        </label>
        <input
          type="email"
          id="email"
          bind:value={email}
          class="task-input"
          placeholder="Enter email address"
          required
        />
      </div>

      <div>
        <label for="access" class="block text-sm font-medium text-gray-700">
          Access Level
        </label>
        <select
          id="access"
          bind:value={accessLevel}
          class="board-select"
        >
          <option value="read-only">Read Only</option>
          <option value="can-edit">Can Edit</option>
        </select>
      </div>

      {#if error}
        <p class="text-red-500 text-sm">{error}</p>
      {/if}

      {#if success}
        <p class="text-green-500 text-sm">{success}</p>
      {/if}

      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="btn btn-secondary"
          on:click={onClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
        >
          Share
        </button>
      </div>
    </form>
  </div>
</div>