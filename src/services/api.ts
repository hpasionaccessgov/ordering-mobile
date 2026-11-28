import { Capacitor } from '@capacitor/core';

import { getToken, removeToken } from './tokenStorage';
import type { PaginationMeta } from './types';

const fallbackBase = Capacitor.isNativePlatform() ? 'http://10.0.2.2:8080/api' : 'http://localhost:8080/api';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? fallbackBase).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: object;
  auth?: boolean;
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    errors?: Record<string, string[]>;
  };
  meta?: { pagination?: PaginationMeta };
}

export interface Page<T> {
  items: T;
  pagination?: PaginationMeta;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const page = await requestPage<T>(path, options);
  return page.items;
}

export async function requestPage<T>(path: string, options: RequestOptions = {}): Promise<Page<T>> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.auth !== false) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, 'network_error', 'Cannot reach the Cafébara server.');
  }

  let envelope: Envelope<T>;
  try {
    envelope = (await response.json()) as Envelope<T>;
  } catch {
    throw new ApiError(response.status, 'invalid_response', 'Unexpected server response.');
  }

  if (!response.ok || !envelope.success) {
    const error = envelope.error;
    const apiError = new ApiError(
      response.status,
      error?.code ?? 'request_failed',
      error?.message ?? 'Request failed.',
      error?.errors ?? {},
    );
    if (response.status === 401 && options.auth !== false) {
      await removeToken();
      window.dispatchEvent(new CustomEvent('cafebara:unauthorized'));
    }
    throw apiError;
  }

  if (envelope.data === undefined) {
    throw new ApiError(response.status, 'invalid_response', 'Missing response data.');
  }

  return { items: envelope.data, pagination: envelope.meta?.pagination };
}

export function firstError(error: unknown): string {
  if (error instanceof ApiError) {
    const errors = Object.values(error.errors).flat();
    return errors[0] ?? error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong.';
}
