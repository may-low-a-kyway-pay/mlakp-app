export type AuthUser = {
  id: string
  name: string
  username: string
  email: string
  email_verified_at?: string | null
  verification_deadline?: string | null
  verification_status?: 'verified' | 'pending_grace_period' | 'expired'
}

export type AuthTokenData = {
  access_token: string
  refresh_token: string
  token_type: 'Bearer'
  expires_at: string
  user: AuthUser
  verification_warning?: string
  verification_deadline?: string
  verification_status?: 'pending_grace_period' | 'expired'
}

export type AuthRefreshData = Omit<AuthTokenData, 'user'>

export type AuthResponse = {
  success: true
  data: AuthTokenData
}

export type AuthRefreshResponse = {
  success: true
  data: AuthRefreshData
}

export type ApiErrorResponse = {
  success: false
  error: {
    code: string
    message: string
  }
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = LoginRequest & {
  name: string
  username: string
}

export type OTPPurpose = 'signup' | 'password_reset'

export type SendOTPRequest = {
  email: string
  purpose: OTPPurpose
}

export type SendOTPData = {
  message: string
  expires_at?: string
  purpose?: OTPPurpose
}

export type SendOTPResponse = {
  success: true
  data: SendOTPData
}

export type VerifyEmailRequest = {
  email: string
  otp: string
  purpose: 'signup'
}

export type VerifyEmailData = {
  verified: true
  access_token: string
  refresh_token: string
  token_type: 'Bearer'
  expires_at: string
}

export type VerifyEmailResponse = {
  success: true
  data: VerifyEmailData
}

export type ResetPasswordRequest = {
  email: string
  otp: string
  new_password: string
}

export type MessageResponse = {
  success: true
  data: {
    message: string
  } | null
}
