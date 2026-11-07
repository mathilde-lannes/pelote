import { useRouter } from 'expo-router';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';

import { FocusAwareStatusBar } from '@/components/ui';
import { fetchCurrentUser } from '@/lib/ravelry/api';
import { mockCurrentUser } from '@/lib/ravelry/mock-data';
import {
  AUTH_ENDPOINT,
  createRavelryAuthRequest,
  exchangeCodeForTokens,
  hasOAuthCredentials,
} from '@/lib/ravelry/oauth';
import { LoginForm } from './components/login-form';
import { setAuthUser, useAuthStore } from './use-auth-store';

export function LoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore.use.signIn();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const oauthAvailable = hasOAuthCredentials();

  const finishLogin = React.useCallback(async (demo: boolean) => {
    try {
      if (demo) {
        setAuthUser(mockCurrentUser);
      }
      else {
        const user = await fetchCurrentUser();
        setAuthUser(user);
      }
      router.replace('/');
    }
    catch (e) {
      console.error(e);
      setError('Signed in, but could not load your Ravelry profile.');
    }
  }, [router]);

  const onDemo = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn(
        { access: 'demo-access', refresh: 'demo-refresh' },
        { demo: true },
      );
      await finishLogin(true);
    }
    finally {
      setLoading(false);
    }
  }, [finishLogin, signIn]);

  const onOAuth = React.useCallback(async () => {
    if (!oauthAvailable) {
      setError(
        'Set EXPO_PUBLIC_RAVELRY_CLIENT_ID (and RAVELRY_CLIENT_SECRET in EAS/.env) to enable OAuth.',
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request = createRavelryAuthRequest();
      const result = await request.promptAsync({
        authorizationEndpoint: AUTH_ENDPOINT,
      });

      if (result.type === 'dismiss' || result.type === 'cancel') {
        return;
      }
      if (result.type !== 'success') {
        throw new Error('Authorization failed');
      }

      const tokens = await exchangeCodeForTokens(request, result);
      await signIn(tokens, { demo: false });
      await finishLogin(false);
      showMessage({ message: 'Signed in with Ravelry', type: 'success' });
    }
    catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'OAuth failed');
    }
    finally {
      setLoading(false);
    }
  }, [finishLogin, oauthAvailable, signIn]);

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm
        onOAuth={onOAuth}
        onDemo={onDemo}
        loading={loading}
        error={error}
        oauthAvailable={oauthAvailable}
      />
    </>
  );
}
