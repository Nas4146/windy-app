import type { RequestHandler } from '@sveltejs/kit';
import { adminDB } from '$lib/firebaseAdmin';
import type { APIResponse } from '$lib/types/api';
import { requireAuth } from '$lib/server/auth';
import type { Board } from '$lib/types/board';
import { apiLimiter, createLimiter, checkRateLimit } from '$lib/server/rateLimiter';
import { APIError, handleAPIError } from '$lib/server/apiError';


// Get a specific board
export const GET: RequestHandler = async (event) => {
    try {
        // Check rate limit
        const rateLimitResult = checkRateLimit(event, apiLimiter);
        if (rateLimitResult instanceof Response) {
            return rateLimitResult;
            }

        const userId = await requireAuth(event);
        const boardDoc = await adminDB.collection('boards').doc(event.params.id).get();
        
        if (!boardDoc.exists) {
            throw new APIError('Board not found', 404, 'BOARD_NOT_FOUND');
        }

        const board = boardDoc.data() as Board;
        
        // Check if user has access
        if (board.ownerId !== userId && !board.collaborators?.some(c => c.userId === userId)) {
            throw new APIError('Access denied', 403, 'ACCESS_DENIED');
        }

        return new Response(
            JSON.stringify({
                success: true,
                data: { id: boardDoc.id, ...board }
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

// Update a board
export const PATCH: RequestHandler = async (event) => {
    try {
        // Use stricter rate limit for creation
        const rateLimitResult = checkRateLimit(event, createLimiter);
        if (rateLimitResult instanceof Response) {
            return rateLimitResult;
            }       

        const userId = await requireAuth(event);
        const updates = await event.request.json();
        const boardRef = adminDB.collection('boards').doc(event.params.id);
        const board = await boardRef.get();

        const boardData = board.data() as Board;
        if (boardData.ownerId !== userId) {
            throw new APIError('Access denied', 403, 'ACCESS_DENIED');
        }

        await boardRef.update({
            ...updates,
            updatedAt: new Date().toISOString()
        });

        const updatedBoard = await boardRef.get();
        return new Response(
            JSON.stringify({
                success: true,
                data: { id: updatedBoard.id, ...updatedBoard.data() }
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

// Delete a board
export const DELETE: RequestHandler = async (event) => {
    try {
        // Use stricter rate limit for creation
        const rateLimitResult = checkRateLimit(event, createLimiter);
        if (rateLimitResult instanceof Response) {
            return rateLimitResult;
            }

        const userId = await requireAuth(event);
        const boardRef = adminDB.collection('boards').doc(event.params.id);
        const board = await boardRef.get();

        if (!board.exists) {
            throw new APIError('Board not found', 404, 'BOARD_NOT_FOUND');
        }

        const boardData = board.data() as Board;
        if (boardData.ownerId !== userId) {
            throw new APIError('Access denied', 403, 'ACCESS_DENIED');
        }

        await boardRef.delete();

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