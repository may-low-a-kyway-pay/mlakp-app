import {
  ApiErrorResponse,
  AuthResponse,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  SendOTPRequest,
  SendOTPResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '@/src/modules/auth/types/authTypes'
import { apiClient } from '@/src/shared/api/client'
import { isAxiosError } from 'axios'

export async function login(request: LoginRequest) {
  const response = await apiClient.post<AuthResponse>('/v1/auth/login', request)
  return response.data.data
}

export async function register(request: RegisterRequest) {
  const response = await apiClient.post<AuthResponse>('/v1/auth/register', request)
  return response.data.data
}

export async function logout() {
  await apiClient.post('/v1/auth/logout')
}

export async function sendOTP(request: SendOTPRequest) {
  const response = await apiClient.post<SendOTPResponse>('/v1/auth/send-otp', request, { skipAuth: true })
  return response.data.data
}

export async function verifyEmail(request: VerifyEmailRequest) {
  const response = await apiClient.post<VerifyEmailResponse>('/v1/auth/verify-otp', request, { skipAuth: true })
  return response.data.data
}

export async function sendAccountPasswordOTP() {
  const response = await apiClient.post<SendOTPResponse>('/v1/auth/send-otp/account')
  return response.data.data
}

export async function resetPassword(request: ResetPasswordRequest) {
  const response = await apiClient.post<MessageResponse>('/v1/auth/reset-password', request, { skipAuth: true })
  return response.data.data
}

export function getAuthErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error?.message ?? 'Unable to reach the server. Please try again.'
  }

  return 'Something went wrong. Please try again.'
}

export function getAuthErrorCode(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error?.code ?? null
  }

  return null
}
