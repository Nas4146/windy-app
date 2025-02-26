export class APIError extends Error {
    constructor(
        public message: string,
        public status: number,
        public code?: string
    ) {
        super(message);
        this.name = 'APIError';
    }
}

export function handleAPIError(error: unknown) {
    console.error('API Error:', error);

    if (error instanceof APIError) {
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
                code: error.code
            }),
            {
                status: error.status,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    if (error instanceof Error) {
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    return new Response(
        JSON.stringify({
            success: false,
            error: 'Unknown error occurred',
            code: 'UNKNOWN_ERROR'
        }),
        {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}