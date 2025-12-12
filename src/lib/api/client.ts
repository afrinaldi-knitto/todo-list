import { storage } from "@/lib/utils/storage";
import type { ApiResponse } from "@/types/api";

const BASE_URL = "http://localhost:8000";

export class ApiError extends Error {
  constructor(message: string, public status: number, public data?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = storage.getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch (jsonError) {
      if (!response.ok) {
        throw new ApiError(
          `Server error: ${response.status} ${response.statusText}`,
          response.status
        );
      }
      throw new ApiError("Invalid response from server", response.status);
    }

    if (!response.ok) {
      throw new ApiError(
        data.message || "Terjadi kesalahan",
        response.status,
        data
      );
    }

    return data.result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new ApiError(
        "Tidak dapat terhubung ke server. Pastikan server berjalan di http://localhost:8000",
        0
      );
    }

    throw new ApiError("Terjadi kesalahan yang tidak diketahui", 500);
  }
}

export const apiClient = {
  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
};
