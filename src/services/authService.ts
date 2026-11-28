import { request } from './api';
import type { AuthTokens, RegisterPayload, UserProfile } from './types';

export function login(username: string, password: string): Promise<AuthTokens> {
  return request<AuthTokens>('/login', {
    method: 'POST',
    body: { username, password },
    auth: false,
  });
}

export function register(payload: RegisterPayload): Promise<AuthTokens> {
  return request<AuthTokens>('/register', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

export function profile(): Promise<UserProfile> {
  return request<UserProfile>('/profile');
}

export function logout(): Promise<{ revoked: boolean }> {
  return request<{ revoked: boolean }>('/logout', { method: 'POST' });
}
