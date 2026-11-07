import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import Env from 'env';

import type { TokenType } from '@/lib/auth/utils';

WebBrowser.maybeCompleteAuthSession();

const AUTH_ENDPOINT = 'https://www.ravelry.com/oauth2/auth';
const TOKEN_ENDPOINT = 'https://www.ravelry.com/oauth2/token';

function getClientSecret() {
  const fromExtra
    = (Constants.expoConfig?.extra as { ravelryClientSecret?: string } | undefined)
      ?.ravelryClientSecret;
  return fromExtra || Env.RAVELRY_CLIENT_SECRET || '';
}

function randomState() {
  // Ravelry requires state length > 8
  return Crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

export function getRedirectUri() {
  // AuthSession builds a deep link like pelote://oauth for standalone,
  // or an Expo proxy URL in Expo Go.
  return AuthSession.makeRedirectUri({
    scheme: Env.EXPO_PUBLIC_SCHEME,
    path: Env.EXPO_PUBLIC_RAVELRY_REDIRECT_PATH,
  });
}

export function hasOAuthCredentials() {
  return Boolean(Env.EXPO_PUBLIC_RAVELRY_CLIENT_ID);
}

export function createRavelryAuthRequest() {
  const clientId = Env.EXPO_PUBLIC_RAVELRY_CLIENT_ID;
  if (!clientId) {
    throw new Error('Missing EXPO_PUBLIC_RAVELRY_CLIENT_ID');
  }

  const redirectUri = getRedirectUri();

  return new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    scopes: ['offline'],
    usePKCE: true,
    extraParams: {
      state: randomState(),
    },
  });
}

export async function exchangeCodeForTokens(
  request: AuthSession.AuthRequest,
  result: AuthSession.AuthSessionResult,
): Promise<TokenType> {
  if (result.type !== 'success' || !result.params.code) {
    throw new Error('Ravelry authorization was cancelled or failed');
  }

  const clientId = Env.EXPO_PUBLIC_RAVELRY_CLIENT_ID;
  const clientSecret = getClientSecret();

  if (!clientId) {
    throw new Error('Missing EXPO_PUBLIC_RAVELRY_CLIENT_ID');
  }

  // Ravelry apps are typically confidential; secret comes from EAS / .env via app config.
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: result.params.code,
    redirect_uri: request.redirectUri,
    client_id: clientId,
    code_verifier: request.codeVerifier ?? '',
  });

  if (clientSecret) {
    body.set('client_secret', clientSecret);
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${text}`);
  }

  const json = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  return {
    access: json.access_token,
    refresh: json.refresh_token ?? '',
    expiresAt: json.expires_in
      ? Date.now() + json.expires_in * 1000
      : undefined,
  };
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenType> {
  const clientId = Env.EXPO_PUBLIC_RAVELRY_CLIENT_ID;
  const clientSecret = getClientSecret();

  if (!clientId) {
    throw new Error('Missing EXPO_PUBLIC_RAVELRY_CLIENT_ID');
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  });

  if (clientSecret) {
    body.set('client_secret', clientSecret);
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token refresh failed (${response.status}): ${text}`);
  }

  const json = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  return {
    access: json.access_token,
    refresh: json.refresh_token ?? refreshToken,
    expiresAt: json.expires_in
      ? Date.now() + json.expires_in * 1000
      : undefined,
  };
}

export { AUTH_ENDPOINT, TOKEN_ENDPOINT };
