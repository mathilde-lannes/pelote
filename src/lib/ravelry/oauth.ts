import type { TokenType } from '@/lib/auth/utils';
import Env from 'env';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';

import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const AUTH_ENDPOINT = 'https://www.ravelry.com/oauth2/auth';
const TOKEN_ENDPOINT = 'https://www.ravelry.com/oauth2/token';

function getClientSecret() {
  // RAVELRY_CLIENT_SECRET is not Metro-inlined. app.config copies it into
  // `extra` at native/EAS build time (`pnpm ios` / `eas build`).
  const manifestExtra = (
    Constants.manifest as { extra?: { ravelryClientSecret?: string } } | null
  )?.extra;
  const extra = (Constants.expoConfig?.extra ?? manifestExtra) as
    | { ravelryClientSecret?: string }
    | undefined;

  return extra?.ravelryClientSecret?.trim() || '';
}

function requireOAuthClient() {
  const clientId = Env.EXPO_PUBLIC_RAVELRY_CLIENT_ID;
  const clientSecret = getClientSecret();

  if (!clientId) {
    throw new Error('Missing EXPO_PUBLIC_RAVELRY_CLIENT_ID');
  }
  if (!clientSecret) {
    throw new Error(
      'Missing RAVELRY_CLIENT_SECRET — set it in .env and rebuild with pnpm ios (or set the EAS Secret for store builds)',
    );
  }

  return { clientId, clientSecret };
}

/** Ravelry requires client credentials via HTTP Basic, not body params. */
function basicAuthHeader(clientId: string, clientSecret: string) {
  const credentials = `${clientId}:${clientSecret}`;
  const bytes = new TextEncoder().encode(credentials);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return `Basic ${globalThis.btoa(binary)}`;
}

async function postTokenRequest(body: URLSearchParams): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}> {
  const { clientId, clientSecret } = requireOAuthClient();

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': basicAuthHeader(clientId, clientSecret),
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };
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
  // Gate the button on the public client id only. The secret is read from
  // Constants.expoConfig.extra at token-exchange time (not available as
  // process.env in the app bundle).
  return Boolean(Env.EXPO_PUBLIC_RAVELRY_CLIENT_ID);
}

export function createRavelryAuthRequest() {
  const { clientId } = requireOAuthClient();
  const redirectUri = getRedirectUri();

  // Ravelry confidential apps authenticate with Basic auth at the token
  // endpoint; they do not use PKCE.
  return new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    scopes: ['offline'],
    usePKCE: false,
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

  const json = await postTokenRequest(
    new URLSearchParams({
      grant_type: 'authorization_code',
      code: result.params.code,
      redirect_uri: request.redirectUri,
    }),
  );

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
  const json = await postTokenRequest(
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  );

  return {
    access: json.access_token,
    refresh: json.refresh_token ?? refreshToken,
    expiresAt: json.expires_in
      ? Date.now() + json.expires_in * 1000
      : undefined,
  };
}

export { AUTH_ENDPOINT, TOKEN_ENDPOINT };
