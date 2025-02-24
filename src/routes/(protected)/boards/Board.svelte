<script lang="ts">
 import { dndzone } from 'svelte-dnd-action';
  import { onMount, onDestroy } from 'svelte';
  import type { Board, Task } from '$lib/types/board';
  import { createTask, getTasksQuery } from '$lib/stores/tasksStore';
  import { onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { page } from '$app/stores';
  import ShareBoardModal from '$lib/components/ShareBoardModal.svelte';

  export let board: Board;

   // Get current user
   $: currentUser = $page.data.user;

  // Check user permissions
  $: isOwner = board.ownerId === currentUser.sub;
  $: collaborator = board.collaborators?.find(c => c.email === currentUser.email);
  $: canEdit = isOwner || collaborator?.accessLevel === 'can-edit';
  
  let tasks: Task[] = [];
  let showCreateTaskModal = false;
  let showViewTaskModal = false;
  let showShareModal = false;
  let isEditing = false;
  let editedTask: Task | null = null;
  let selectedTask: Task | null = null;
  let newTask = {
    title: '',
    description: '',
    columnId: ''
  };
  let newTaskTitle: { [key: string]: string } = {};
  let unsubscribe: () => void;
  let previousBoardId: string | undefined;

 // IDs for form controls
  let titleInputId = 'task-title';
  let descInputId = 'task-description';
  let columnSelectId = 'task-column';

  let showDeleteConfirmModal = false;


  // Handle board changes
  $: {
    if (board.id !== previousBoardId) {
      // Only reset inputs when board actually changes
      previousBoardId = board.id;
      newTaskTitle = Object.fromEntries(
        board.columns.map(column => [column.id, ''])
      );
    
      // Update Firebase subscription
      if (unsubscribe) {
        unsubscribe();
      }
      unsubscribe = onSnapshot(getTasksQuery(board.id), snapshot => {
        tasks = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Task));
      });
    }
  }

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  $: tasksByColumn = board.columns.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => task.columnId === column.id);
    return acc;
  }, {} as { [key: string]: Task[] });

  async function handleCreateTask() {
    if (!newTask.title.trim()) return;
    
    try {
      await createTask(board.id, {
        title: newTask.title,
        description: newTask.description,
        columnId: newTask.columnId,
        order: tasksByColumn[newTask.columnId]?.length || 0
      });

            // Reset form and close modal
            newTask = { title: '', description: '', columnId: '' };
      showCreateTaskModal = false;
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }

  async function openCreateTaskModal() {
    // Set default column to first column if none selected
    if (!newTask.columnId && board.columns.length > 0) {
      newTask.columnId = board.columns[0].id;
    }
    showCreateTaskModal = true;
  }

  async function openViewTaskModal(task: Task) {
    selectedTask = { ...task };
    showViewTaskModal = true;
  }

  async function handleDnd(event: CustomEvent, columnId: string) {
    const { items, info } = event.detail;
    
    // Only update Firebase on final drop
    if (event.type === 'finalize') {
      try {
        const task = items.find((item: Task) => item.id === info?.id);
        if (task && task.columnId !== columnId) {
          const taskRef = doc(db, 'tasks', task.id);
          await updateDoc(taskRef, {
            columnId,
            updatedAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error updating task position:', error);
      }
    }

    // Update local state immediately for smooth UI
    tasksByColumn[columnId] = items;
  }

  async function handleUpdateTask() {
    if (!selectedTask) return;
    
    try {
      const taskRef = doc(db, 'tasks', selectedTask.id);
      await updateDoc(taskRef, {
        title: selectedTask.title,
        description: selectedTask.description,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async function handleDeleteTask() {
  if (!selectedTask) return;
  
  try {
    await deleteDoc(doc(db, 'tasks', selectedTask.id));
    showViewTaskModal = false;
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}

  function startEditing() {
    if (!canEdit) return;
    isEditing = true;
    editedTask = { ...selectedTask };
  }

  function cancelEditing() {
    isEditing = false;
    selectedTask = { ...editedTask };
    editedTask = null;
  }

  async function saveChanges() {
    await handleUpdateTask();
    isEditing = false;
    editedTask = null;
  }

</script>

<div class="board-container">
  <!-- <h3 data-testid="board-title" class="board-title mb-6">{board.title}</h3> -->
  
  <div class="board-columns">
    {#each board.columns as column}
      <div class="board-column">
        <div class="column-header"> 
          <h4 data-testid="column-title">{column.title}</h4>
          <span class="task-count">{tasksByColumn[column.id]?.length || 0}</span>
        </div>
        
        <div
        use:dndzone={{
          items: tasksByColumn[column.id] || [],
          flipDurationMs: 150,
          dragDisabled: !canEdit
        }}
        on:consider={canEdit ? (e => handleDnd(e, column.id)) : null}
        on:finalize={canEdit ? (e => handleDnd(e, column.id)) : null}
        class="task-list"
        data-testid="task-list"
      >
        {#each tasksByColumn[column.id] || [] as task (task.id)}
          <button
            class="task-card"
            on:click={() => openViewTaskModal(task)}
            tabindex="0"
            on:keydown={e => e.key === 'Enter' && openViewTaskModal(task)}
            data-testid="task-card"
          >
            {task.title}
          </button>
        {/each}
      </div>
    </div>
  {/each}
</div>

{#if canEdit}
<button class="fab" on:click={openCreateTaskModal}>
  <span class="fab-icon">+</span>
</button>
{/if}

 <!-- Add share button if user is owner -->
 {#if isOwner}
 <button
   class="share-button"
   on:click={() => showShareModal = true}
 >
   <svg 
     xmlns="http://www.w3.org/2000/svg" 
     class="share-icon" 
     viewBox="0 0 20 20" 
     fill="currentColor"
   >
     <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
   </svg>
   Share Board
 </button>
{/if}
</div>

<!-- Share Modal -->
{#if showShareModal}
<ShareBoardModal 
 board={board}
 onClose={() => showShareModal = false}
/>
{/if}

<!-- Create Task Modal -->
{#if showCreateTaskModal}
  <div class="task-modal-overlay">
    <div class="task-modal-content">
      <div class="task-modal-header">
        <h2 class="task-modal-title">Create New Task</h2>
        <button 
          class="task-modal-close"
          on:click={() => showCreateTaskModal = false}
        >
          ✕
        </button>
      </div>

      <form on:submit|preventDefault={handleCreateTask} class="task-modal-body">
        <div>
          <label for={titleInputId} class="task-modal-label">Title</label>
          <input
            id={titleInputId}
            type="text"
            bind:value={newTask.title}
            class="task-modal-field"
            placeholder="Enter task title"
            required
          />
        </div>

        <div>
          <label for={descInputId} class="task-modal-label">Description</label>
          <textarea
            id={descInputId}
            bind:value={newTask.description}
            class="task-modal-description"
            placeholder="Enter task description"
          />
        </div>

        <div>
          <label for={columnSelectId} class="task-modal-label">Column</label>
          <select
            id={columnSelectId}
            bind:value={newTask.columnId}
            class="task-modal-field"
            required
          >
            {#each board.columns as column}
              <option value={column.id}>{column.title}</option>
            {/each}
          </select>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button type="submit" class="btn btn-primary">
            Create Task
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- View/Edit Task Modal -->
{#if showViewTaskModal && selectedTask}
<div class="task-modal-overlay">
 <div class="task-modal-content">
   <div class="task-modal-header">
     {#if canEdit}
       <input
         type="text"
         bind:value={selectedTask.title}
         class="task-modal-title-input"
         on:focus={startEditing}
       />
     {:else}
       <h2 class="task-modal-title">{selectedTask.title}</h2>
     {/if}
     <button 
       class="task-modal-close"
       on:click={() => !isEditing && (showViewTaskModal = false)}
     >
       ✕
     </button>
   </div>
   
   <div class="task-modal-body">
     <div>
       <span class="task-modal-label" id="desc-label">Description</span>
       {#if canEdit}
         <textarea
           bind:value={selectedTask.description}
           class="task-modal-description"
           on:focus={startEditing}
           placeholder="Add a description..."
         />
       {:else}
         <p class="task-detail" aria-labelledby="desc-label">
           {selectedTask.description || 'No description provided'}
         </p>
       {/if}
     </div>

     <!-- Edit/Delete Buttons -->
     <div class="flex justify-end gap-2 mt-6">
       {#if isEditing}
         <!-- Save/Cancel buttons when editing -->
         <button
           type="button"
           class="btn btn-secondary"
           on:click={cancelEditing}
         >
           Cancel
         </button>
         <button
           type="button"
           class="btn btn-primary"
           on:click={saveChanges}
         >
           Save Changes
         </button>
       {:else if canEdit}
         <!-- Delete button when not editing -->
         <button
           type="button"
           class="btn btn-text-danger"
           on:click={() => showDeleteConfirmModal = true}
           >
           Delete
         </button>
       {/if}
     </div>
   </div>
 </div>
</div>
{/if}

{#if showDeleteConfirmModal}
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="task-modal-header">
        <h2 class="heading-2">Delete Task</h2>
        <button 
          class="task-modal-close"
          on:click={() => showDeleteConfirmModal = false}
        >
          ✕
        </button>
      </div>
      
      <div class="task-modal-body">
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete "{selectedTask?.title}"? This action cannot be undone.
        </p>
        
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="btn btn-secondary"
            on:click={() => showDeleteConfirmModal = false}
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-danger"
            on:click={() => {
              handleDeleteTask();
              showDeleteConfirmModal = false;
            }}
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}