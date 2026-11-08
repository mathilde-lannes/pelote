import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import Env from 'env';

import { signOut, useAuthStore } from '@/features/auth/use-auth-store';
import { setToken } from '@/lib/auth/utils';
import { refreshAccessToken } from '@/lib/ravelry/oauth';

export const client = axios.create({
  baseURL: Env.EXPO_PUBLIC_API_URL,
  headers: {
    Accept: 'application/json',
  },
});

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;

  if (token?.access) {
    config.headers.Authorization = `Bearer ${token.access}`;
  }

  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshBearer(): Promise<string | null> {
  const current = useAuthStore.getState().token;
  if (!current?.refresh) {
    await signOut();
    return null;
  }

  try {
    const next = await refreshAccessToken(current.refresh);
    await setToken(next);
    useAuthStore.setState({ token: next, status: 'signIn' });
    return next.access;
  }
  catch {
    await signOut();
    return null;
  }
}

/** Ravelry often returns 403 (not 401) when the Bearer token is expired/invalid. */
function isInvalidOAuthToken(error: AxiosError): boolean {
  const status = error.response?.status;
  if (status === 401)
    return true;
  if (status !== 403)
    return false;
  const data = error.response?.data;
  const text
    = typeof data === 'string'
      ? data
      : data == null
        ? ''
        : JSON.stringify(data);
  return /oauth|token is not valid|invalid.?token|expired/i.test(text);
}

client.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (__DEV__ && error.response) {
      const method = (original?.method ?? 'get').toUpperCase();
      const url = `${original?.baseURL ?? ''}${original?.url ?? ''}`;
      console.warn(
        `[api] ${error.response.status} ${method} ${url}`,
        error.response.data ?? '',
      );
    }

    if (isInvalidOAuthToken(error) && original && !original._retry) {
      original._retry = true;

      refreshPromise ??= refreshBearer().finally(() => {
        refreshPromise = null;
      });

      const access = await refreshPromise;
      if (access) {
        original.headers.Authorization = `Bearer ${access}`;
        return client(original);
      }
    }

    return Promise.reject(error);
  },
);
