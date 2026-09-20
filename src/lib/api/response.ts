import { ApiResponse } from '../types/api';

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      phase: 1,
      mock: true,
      ...meta
    }
  };
}

/**
 * Create an error API response
 */
export function createErrorResponse(code: string, message: string, meta?: Record<string, unknown>): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message
    },
    meta: {
      phase: 1,
      mock: true,
      ...meta
    }
  };
}