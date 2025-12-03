/**
 * Template response untuk semua API endpoint
 */
export interface ApiResponse<T> {
  message: string | null;
  data: T | null;
}

/**
 * Helper function untuk membuat response sukses
 */
export function successResponse<T>(
  data: T,
  message: string | null = "Success"
): ApiResponse<T> {
  return {
    message,
    data,
  };
}

/**
 * Helper function untuk membuat response error
 */
export function errorResponse(
  message: string,
  data: null = null
): ApiResponse<null> {
  return {
    message,
    data,
  };
}

