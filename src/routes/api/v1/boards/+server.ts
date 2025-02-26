import type { RequestHandler } from '@sveltejs/kit';
import { adminDB } from '$lib/firebaseAdmin';
import type { APIResponse } from '$lib/types/api';
import { requireAuth } from '$lib/server/auth';
import type { Board } from '$lib/types/board';
import { APIError, handleAPIError } from '$lib/server/apiError';
import { apiLimiter, createLimiter, checkRateLimit } from '$lib/server/rateLimiter';


// Get all boards for a user
export const GET: RequestHandler = async (event) => {
    try {
        // Check rate limit
        const rateLimitResult = checkRateLimit(event, apiLimiter);
        if (rateLimitResult instanceof Response) {
            return rateLimitResult;
            }

        const userId = await requireAuth(event);
        const snapshot = await adminDB
            .collection('boards')
            .where('ownerId', '==', userId)
            .get();

        const boards = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return new Response(
            JSON.stringify({
                success: true,
                data: boards
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

// Create a new board
export const POST: RequestHandler = async (event) => {
    try {
        // Use stricter rate limit for creation
        const rateLimitResult = checkRateLimit(event, createLimiter);
        if (rateLimitResult instanceof Response) {
            return rateLimitResult;
            }

        const userId = await requireAuth(event);
        const { title } = await event.request.json();

        if (!title) {
            throw new APIError(
                'Title is required',
                400,
                'MISSING_REQUIRED_FIELDS'
            );
        }

        const newBoard = {
            title,
            ownerId: userId,
            columns: [
                { id: '1', title: 'To Do', order: 0 },
                { id: '2', title: 'In Progress', order: 1 },
                { id: '3', title: 'Done', order: 2 }
            ],
            collaborators: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const docRef = await adminDB.collection('boards').add(newBoard);
        return new Response(
            JSON.stringify({
                success: true,
                data: { id: docRef.id, ...newBoard }
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