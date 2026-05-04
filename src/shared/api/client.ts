import { getAccessToken } from '@/src/modules/auth/tokenStore';
import { create } from 'axios';

function requiredEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function requiredNumberEnv(name: string, rawValue: string | undefined) {
  const value = Number(requiredEnv(name, rawValue));

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Environment variable ${name} must be a positive number`);
  }

  return value;
}

export const apiClient = create({
  baseURL: requiredEnv('EXPO_PUBLIC_API_BASE_URL', process.env.EXPO_PUBLIC_API_BASE_URL),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: requiredNumberEnv('EXPO_PUBLIC_API_TIMEOUT_MS', process.env.EXPO_PUBLIC_API_TIMEOUT_MS),
});

apiClient.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
