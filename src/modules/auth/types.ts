export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthTokenData = {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_at: string;
  user: AuthUser;
};

export type AuthResponse = {
  success: true;
  data: AuthTokenData;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  name: string;
};
