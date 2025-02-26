import type { RequestHandler } from '@sveltejs/kit';
import { adminDB } from '$lib/firebaseAdmin';
import type { APIResponse } from '$lib/types/api';
import { requireAuth } from '$lib/server/auth';
import type { Task } from '$lib/types/board';
import { apiLimiter, createLimiter, checkRateLimit } from '$lib/server/rateLimiter';
import { APIError, handleAPIError } from '$lib/server/apiError';


export const GET: RequestHandler = async (event) => {
  try {
    // Check rate limit
    const rateLimitResult = checkRateLimit(event, apiLimiter);
    if (rateLimitResult instanceof Response) {
      return rateLimitResult;
        }

    const userId = await requireAuth(event);
    const taskDoc = await adminDB.collection('tasks').doc(event.params.id).get();
    
    if (!taskDoc.exists) {
      throw new APIError('Task not found', 404, 'TASK_NOT_FOUND');
  }

    const task = { id: taskDoc.id, ...taskDoc.data() };
    
    return new Response(
      JSON.stringify({
          success: true,
          data: task
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

export const DELETE: RequestHandler = async (event) => {
  try {
    // Use stricter rate limit for creation
    const rateLimitResult = checkRateLimit(event, createLimiter);
    if (rateLimitResult instanceof Response) {
      return rateLimitResult;
       }
    const userId = await requireAuth(event);
    await adminDB.collection('tasks').doc(event.params.id).delete();
    
    return new Response(
      JSON.stringify({ success: true }),
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

export const PATCH: RequestHandler = async (event) => {
  try {
    // Use stricter rate limit for creation
    const rateLimitResult = checkRateLimit(event, createLimiter);
    if (rateLimitResult instanceof Response) {
      return rateLimitResult;
       }

    const userId = await requireAuth(event);
    const updates = await event.request.json();
    await adminDB.collection('tasks').doc(event.params.id).update(updates);
    
    const updatedDoc = await adminDB.collection('tasks').doc(event.params.id).get();
    const updatedTask = { id: updatedDoc.id, ...updatedDoc.data() };
    
    return new Response(
      JSON.stringify({
          success: true,
          data: updatedTask
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