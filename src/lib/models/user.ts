/**
 * Model untuk User entity
 */
export interface User {
  id: string;
  username: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * DTO untuk register request
 */
export interface RegisterRequest {
  username: string;
  password: string;
}

/**
 * DTO untuk register response (tanpa password)
 */
export interface RegisterResponse {
  id: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * DTO untuk login request
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * DTO untuk login response
 */
export interface LoginResponse {
  token: string;
}

