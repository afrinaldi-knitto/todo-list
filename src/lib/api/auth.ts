import { apiClient } from "./client";
import type { LoginRequest, LoginResponse } from "@/types/api";

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/auth/login", credentials);
  },
};

