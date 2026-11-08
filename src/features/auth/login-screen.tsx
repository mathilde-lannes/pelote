import { useRouter } from 'expo-router';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';

import { FocusAwareStatusBar } from '@/components/ui';
import { fetchCurrentUser } from '@/lib/ravelry/api';
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

  const finishLogin = React.useCallback(async () => {
    try {
      const user = await fetchCurrentUser();
      setAuthUser(user);
      router.replace('/');
    }
    catch (e) {
      console.error(e);
      setError('Signed in, but could not load your Ravelry profile.');
    }
  }, [router]);

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
      await signIn(tokens);
      await finishLogin();
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
        loading={loading}
        error={error}
        oauthAvailable={oauthAvailable}
      />
    </>
  );
}
