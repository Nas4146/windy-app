<script lang="ts">
  import { Collection } from 'sveltefire';
  import { boardsCollection, createBoard, getBoardsQuery } from '$lib/stores/boardStore';  // Add getBoardsQuery import
  import Board from './Board.svelte';
  import type { Board as BoardType } from '$lib/types/board';
  import { page } from '$app/stores';
  import '../../../styles/shared.css';

  let showCreateForm = false;
  let newBoardTitle = '';
  let selectedBoardId: string | null = null;

  $: userId = $page.data.user?.sub;
  $: boardsQuery = getBoardsQuery(userId);

  async function handleCreateBoard() {
    if (!newBoardTitle.trim() || !userId) return;
    
    try {
      const docRef = await createBoard({
        title: newBoardTitle,
        columns: [
          { id: '1', title: 'To Do', order: 0 },
          { id: '2', title: 'In Progress', order: 1 },
          { id: '3', title: 'Done', order: 2 }
        ],
        ownerId: userId
      });
      newBoardTitle = '';
      showCreateForm = false;
      selectedBoardId = docRef.id;
    } catch (error) {
      console.error('Error creating board:', error);
    }
  }
</script>

<div class="container-base pt-2">
  <div class="flex flex-col gap-2 mb-4">
    <h1 class="heading-1">My Boards</h1>
  
    <Collection
    ref={boardsQuery}
    let:data={boards}
    let:loading
    let:error
  >
    {#if loading}
      <div class="h-10 flex items-center">
        <div class="animate-spin h-5 w-5 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
      </div>
    {:else if error}
      <div class="text-red-500">Error loading boards: {error.message}</div>
    {:else if boards && boards.length > 0}
      <div class="flex items-center gap-4">
        <select
          bind:value={selectedBoardId}
          class="board-select"
        >
          <option value={null}>Select a board...</option>
          {#each boards as board}
            <option value={board.id}>{board.title}</option>
          {/each}
        </select>
        
        <button 
          class="btn btn-primary"
          on:click={() => showCreateForm = true}
        >
          New Board
        </button>
      </div>

      {#if selectedBoardId}
      {#each boards.filter(board => board.id === selectedBoardId) as selectedBoard}
        <div class="mt-6">
          <Board board={selectedBoard} />
        </div>
      {/each}
    {:else}
    <div class="text-gray-500 mt-4">Please select a board to view</div>
    {/if}
  {:else}
    <div class="text-center text-gray-500 py-12">
      <p class="text-lg">No boards found. Create your first board!</p>
      <button 
        class="btn btn-primary mt-4"
        on:click={() => showCreateForm = true}
      >
        Create Board
      </button>
    </div>
  {/if}
</Collection>
</div>

{#if showCreateForm}
    <div class="modal-overlay">
      <div class="modal-content">
        <h2 class="heading-2 mb-4">Create New Board</h2>
        <form on:submit|preventDefault={handleCreateBoard}>
          <input
            type="text"
            bind:value={newBoardTitle}
            placeholder="Board Title"
            class="task-input mb-4"
            required
          />
          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="btn btn-secondary"
              on:click={() => showCreateForm = false}
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>