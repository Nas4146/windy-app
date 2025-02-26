import { swaggerDocument } from '../../../../lib/api/swagger';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    return new Response(
        JSON.stringify(swaggerDocument),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
};