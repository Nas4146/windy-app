import { test, expect } from '@playwright/test';
import * as process from 'process';

// Test data
const TEST_BOARD = {
    title: 'Test Board'
};

const TEST_TASK = {
    title: 'Test Task',
    description: 'Test Description'
};

test.describe('API Tests', () => {
    let authToken: string;
    let boardId: string;
    let taskId: string;

    // Helper function to wait for server
    async function waitForServer(request: any, baseURL: string, maxRetries = 30) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                console.log(`Attempting to connect to server (attempt ${i + 1}/${maxRetries})...`);
                const response = await request.get(baseURL);
                if (response.ok()) {
                    console.log('Server is ready!');
                    return true;
                }
                console.log(`Server not ready, status: ${response.status()}`);
            } catch (e) {
                console.log('Server connection failed, retrying...');
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        return false;
    }

    test.beforeEach(async ({ page, baseURL, request }) => {
        // Ensure baseURL is set
        const url = baseURL ?? 'http://localhost:4173';
        console.log('Starting API tests with base URL:', url);

        // Wait for server
        const serverReady = await waitForServer(request, url);
        if (!serverReady) {
            throw new Error('Server failed to start');
        }

        // Login through Auth0
        await page.goto(`${url}/login`);
        
        // Wait for redirect to Auth0
        await page.waitForURL(/.*auth0.com.*/);
        
        // Fill in Auth0 login form
        await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL ?? '');
        await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD ?? '');
        await page.getByRole('button', { name: 'Continue' }).click();

        // Wait for redirect back to app
        await page.waitForURL(`${url}/boards`);

        // Get session cookie
        const cookies = await page.context().cookies();
        const sessionCookie = cookies.find(cookie => cookie.name === 'session');
        if (!sessionCookie) {
            throw new Error('Session cookie not found');
        }

        authToken = `session=${sessionCookie.value}`;
    });

    test('GET /api/v1 returns API info', async ({ request }) => {
        const response = await request.get('/api/v1', {
            headers: {
                'Cookie': authToken
            }
        });

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.version).toBe('1.0.0');
        expect(data.endpoints).toContain('/api/v1/tasks');
    });

    test('Board CRUD operations', async ({ request }) => {
        // Create board
        const createResponse = await request.post('/api/v1/boards', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            data: TEST_BOARD
        });
        expect(createResponse.status()).toBe(201);
        const createData = await createResponse.json();
        expect(createData.success).toBe(true);
        expect(createData.data.title).toBe(TEST_BOARD.title);
        boardId = createData.data.id;

        // Get board
        const getResponse = await request.get(`/api/v1/boards/${boardId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(getResponse.status()).toBe(200);
        const getData = await getResponse.json();
        expect(getData.data.title).toBe(TEST_BOARD.title);

        // Update board
        const updateResponse = await request.patch(`/api/v1/boards/${boardId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            data: {
                title: 'Updated Board'
            }
        });
        expect(updateResponse.status()).toBe(200);
        const updateData = await updateResponse.json();
        expect(updateData.data.title).toBe('Updated Board');

        // Delete board
        const deleteResponse = await request.delete(`/api/v1/boards/${boardId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(deleteResponse.status()).toBe(200);
        expect((await deleteResponse.json()).success).toBe(true);
    });

    test('Task CRUD operations', async ({ request }) => {
        // Create board first
        const boardResponse = await request.post('/api/v1/boards', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            data: TEST_BOARD
        });
        boardId = (await boardResponse.json()).data.id;

        // Create task
        const createResponse = await request.post('/api/v1/tasks', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            data: { ...TEST_TASK, boardId }
        });
        expect(createResponse.status()).toBe(201);
        const createData = await createResponse.json();
        expect(createData.success).toBe(true);
        expect(createData.data.title).toBe(TEST_TASK.title);
        taskId = createData.data.id;

        // Get task
        const getResponse = await request.get(`/api/v1/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(getResponse.status()).toBe(200);
        const getData = await getResponse.json();
        expect(getData.data.title).toBe(TEST_TASK.title);

        // Update task
        const updateResponse = await request.patch(`/api/v1/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            data: {
                title: 'Updated Task'
            }
        });
        expect(updateResponse.status()).toBe(200);
        const updateData = await updateResponse.json();
        expect(updateData.data.title).toBe('Updated Task');

        // Delete task
        const deleteResponse = await request.delete(`/api/v1/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(deleteResponse.status()).toBe(200);
        expect((await deleteResponse.json()).success).toBe(true);

        // Clean up - delete board
        await request.delete(`/api/v1/boards/${boardId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
    });

    test('Rate limiting', async ({ request }) => {
        // Test rate limiting by making multiple requests quickly
        const promises = Array(6).fill(null).map(() => 
            request.get('/api/v1/boards', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })
        );

        const responses = await Promise.all(promises);
        expect(responses.some(r => r.status() === 429)).toBe(true);
    });
});