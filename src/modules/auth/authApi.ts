import { ApiErrorResponse, AuthResponse, LoginRequest, RegisterRequest } from '@/src/modules/auth/types';
import { apiClient } from '@/src/shared/api/client';
import { isAxiosError } from 'axios';

export async function login(request: LoginRequest) {
  const response = await apiClient.post<AuthResponse>('/v1/auth/login', request);
  return response.data.data;
}

export async function register(request: RegisterRequest) {
  const response = await apiClient.post<AuthResponse>('/v1/auth/register', request);
  return response.data.data;
}

export function getAuthErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error?.message ?? 'Unable to reach the server. Please try again.';
  }

  return 'Something went wrong. Please try again.';
}
