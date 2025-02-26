import type { RequestHandler } from '@sveltejs/kit';
import { adminDB } from '$lib/firebaseAdmin';
import type { APIResponse } from '$lib/types/api';
import type { Task } from '$lib/types/board';
import { requireAuth } from '$lib/server/auth';
import { apiLimiter, createLimiter, checkRateLimit } from '$lib/server/rateLimiter';
import { APIError, handleAPIError } from '$lib/server/apiError';



// Get all tasks for a user
export const GET: RequestHandler = async (event) => {
  try {
      // Check rate limit
      const rateLimitResult = checkRateLimit(event, apiLimiter);
      if (rateLimitResult instanceof Response) {
        return rateLimitResult;
          }

      const userId = await requireAuth(event);
      const boardId = event.url.searchParams.get('boardId');
      const taskDoc = await adminDB.collection('tasks').doc(event.params.id).get();

      const task = taskDoc.data();
      
      let queryRef = adminDB.collection('tasks');

      if (boardId) {
        // Verify board exists and user has access
        const boardDoc = await adminDB.collection('boards').doc(task.boardId).get();
        if (!boardDoc.exists) {
            throw new APIError('Board not found', 404, 'BOARD_NOT_FOUND');
        }

        const board = boardDoc.data();
        if (board.ownerId !== userId && !board.collaborators?.some(c => c.userId === userId)) {
            throw new APIError('Access denied', 403, 'ACCESS_DENIED');
        }

        queryRef = queryRef.where('boardId', '==', boardId);
    }

    const snapshot = await queryRef.get();
    const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return new Response(
      JSON.stringify({
          success: true,
          data: { id: taskDoc.id, ...task }
      }),
      {
          headers: {
              'Content-Type': 'application/json',
              ...rateLimitResult.headers
          }
      }
  );
} catch (error) {
  return handleAPIError(error);
}
};

// Create a new task
export const POST: RequestHandler = async (event) => {
  try {
      // Use stricter rate limit for creation
      const rateLimitResult = checkRateLimit(event, createLimiter);
      if (rateLimitResult instanceof Response) {
          return rateLimitResult;
      }  
  
      const userId = await requireAuth(event);
      const { boardId, title, description } = await event.request.json();

      if (!boardId || !title) {
          throw new APIError(
              'Missing required fields', 
              400, 
              'MISSING_REQUIRED_FIELDS'
          );
      }

      const boardRef = adminDB.collection('boards').doc(boardId);
      const board = await boardRef.get();

      if (!board.exists) {
          throw new APIError('Board not found', 404, 'BOARD_NOT_FOUND');
      }

      // Get first column (To Do)
      const boardData = board.data();
      const todoColumn = boardData?.columns?.find(c => c.title.toLowerCase() === 'to do');

      if (!todoColumn) {
          throw new APIError(
              'Invalid board configuration', 
              400, 
              'INVALID_BOARD_CONFIG'
          );
      }

      const newTask = {
          boardId,
          title,
          description,
          columnId: todoColumn.id,
          createdBy: userId,
          createdAt: new Date(),
          order: 0
      };

      const docRef = await adminDB.collection('tasks').add(newTask);
      
      return new Response(
          JSON.stringify({
              success: true,
              data: { id: docRef.id, ...newTask }
          }),
          {
              status: 201,
              headers: {
                  'Content-Type': 'application/json',
                  ...rateLimitResult.headers
              }
          }
      );
  } catch (error) {
      return handleAPIError(error);
  }
};