export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  
  export interface APIError {
    success: false;
    error: string;
    status: number;
  }

  export interface PaginatedResponse<T> extends APIResponse<T[]> {
    pagination: {
        total: number;
        page: number;
        limit: number;
    };