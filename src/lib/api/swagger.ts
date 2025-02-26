export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Windy API',
        version: '1.0.0',
        description: 'API documentation for Windy task management application'
    },
    servers: [
        {
            url: 'http://localhost:5173/api/v1',
            description: 'Development server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer'
            }
        },
        schemas: {
            Task: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    columnId: { type: 'string' },
                    boardId: { type: 'string' },
                    order: { type: 'number' },
                    createdAt: { type: 'string', format: 'date-time' },
                    createdBy: { type: 'string' }
                }
            },
            Board: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    ownerId: { type: 'string' },
                    columns: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                title: { type: 'string' },
                                order: { type: 'number' }
                            }
                        }
                    },
                    collaborators: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                userId: { type: 'string' },
                                email: { type: 'string' },
                                accessLevel: { type: 'string', enum: ['read-only', 'can-edit'] }
                            }
                        }
                    }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    error: { type: 'string' },
                    code: { type: 'string' }
                }
            }
        },
        responses: {
            NotFound: {
                description: 'Resource not found',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' }
                    }
                }
            },
            Forbidden: {
                description: 'Access denied',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' }
                    }
                }
            },
            Unauthorized: {
                description: 'Unauthorized',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' }
                    }
                }
            },
            TooManyRequests: {
                description: 'Too many requests',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' }
                    }
                }
            }
        }
    },
    paths: {
        '/tasks': {
            get: {
                summary: 'Get all tasks for a user',
                parameters: [
                    {
                        name: 'boardId',
                        in: 'query',
                        schema: { type: 'string' },
                        description: 'Filter tasks by board ID'
                    }
                ],
                responses: {
                    '200': {
                        description: 'List of tasks',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Task' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '429': { $ref: '#/components/responses/TooManyRequests' }
                }
            },
            post: {
                summary: 'Create a new task',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['boardId', 'title'],
                                properties: {
                                    boardId: { type: 'string' },
                                    title: { type: 'string' },
                                    description: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Task created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { $ref: '#/components/schemas/Task' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/tasks/{id}': {
            get: {
                summary: 'Get a specific task',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Task details',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { $ref: '#/components/schemas/Task' }
                                    }
                                }
                            }
                        }
                    },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '403': { $ref: '#/components/responses/Forbidden' }
                }
            },
            patch: {
                summary: 'Update a task',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    columnId: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Task updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { $ref: '#/components/schemas/Task' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            delete: {
                summary: 'Delete a task',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Task deleted successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/boards': {
            get: {
                summary: 'Get all boards for a user',
                responses: {
                    '200': {
                        description: 'List of boards',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Board' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: 'Create a new board',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title'],
                                properties: {
                                    title: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Board created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { $ref: '#/components/schemas/Board' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/boards/{id}': {
            get: {
                summary: 'Get a specific board',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Board details',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { $ref: '#/components/schemas/Board' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            patch: {
                summary: 'Update a board',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    columns: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                title: { type: 'string' },
                                                order: { type: 'number' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Board updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { $ref: '#/components/schemas/Board' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            delete: {
                summary: 'Delete a board',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Board deleted successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};