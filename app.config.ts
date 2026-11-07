import type { ConfigContext, ExpoConfig } from '@expo/config';

import type { AppIconBadgeConfig } from 'app-icon-badge/types';

import 'tsx/cjs';
import 'dotenv/config';

// adding lint exception as we need to import tsx/cjs before env.ts is imported
// eslint-disable-next-line perfectionist/sort-imports
import Env from './env';

// Replace with your Expo account + EAS project id before first EAS build.
const EXPO_ACCOUNT_OWNER = process.env.EXPO_ACCOUNT_OWNER ?? 'pelote';
const EAS_PROJECT_ID
  = process.env.EAS_PROJECT_ID ?? '00000000-0000-4000-8000-000000000000';

const appIconBadgeConfig: AppIconBadgeConfig = {
  enabled: Env.EXPO_PUBLIC_APP_ENV !== 'production',
  badges: [
    {
      text: Env.EXPO_PUBLIC_APP_ENV,
      type: 'banner',
      color: 'white',
    },
    {
      text: Env.EXPO_PUBLIC_VERSION.toString(),
      type: 'ribbon',
      color: 'white',
    },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: Env.EXPO_PUBLIC_NAME,
  description: 'Pelote — Instagram-style Ravelry companion feed',
  owner: EXPO_ACCOUNT_OWNER,
  scheme: Env.EXPO_PUBLIC_SCHEME,
  slug: 'pelote',
  version: Env.EXPO_PUBLIC_VERSION.toString(),
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: Env.EXPO_PUBLIC_BUNDLE_ID,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  experiments: {
    typedRoutes: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#000000',
    },
    package: Env.EXPO_PUBLIC_PACKAGE,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    [
      'expo-splash-screen',
      {
        backgroundColor: '#000000',
        image: './assets/splash-icon.png',
        imageWidth: 150,
      },
    ],
    [
      'expo-font',
      {
        ios: {
          fonts: [
            'node_modules/@expo-google-fonts/source-sans-3/400Regular/SourceSans3_400Regular.ttf',
            'node_modules/@expo-google-fonts/source-sans-3/500Medium/SourceSans3_500Medium.ttf',
            'node_modules/@expo-google-fonts/source-sans-3/600SemiBold/SourceSans3_600SemiBold.ttf',
            'node_modules/@expo-google-fonts/source-sans-3/700Bold/SourceSans3_700Bold.ttf',
          ],
        },
        android: {
          fonts: [
            {
              fontFamily: 'SourceSans3',
              fontDefinitions: [
                {
                  path: 'node_modules/@expo-google-fonts/source-sans-3/400Regular/SourceSans3_400Regular.ttf',
                  weight: 400,
                },
                {
                  path: 'node_modules/@expo-google-fonts/source-sans-3/500Medium/SourceSans3_500Medium.ttf',
                  weight: 500,
                },
                {
                  path: 'node_modules/@expo-google-fonts/source-sans-3/600SemiBold/SourceSans3_600SemiBold.ttf',
                  weight: 600,
                },
                {
                  path: 'node_modules/@expo-google-fonts/source-sans-3/700Bold/SourceSans3_700Bold.ttf',
                  weight: 700,
                },
              ],
            },
          ],
        },
      },
    ],
    'expo-localization',
    'expo-router',
    'expo-secure-store',
    'expo-web-browser',
    ['app-icon-badge', appIconBadgeConfig],
    ['react-native-edge-to-edge'],
  ],
  extra: {
    eas: {
      projectId: EAS_PROJECT_ID,
    },
    // From local .env or EAS Secrets — baked into the binary at native/EAS build time.
    ravelryClientSecret: process.env.RAVELRY_CLIENT_SECRET ?? '',
    ravelryOAuth: {
      hasClientId: Boolean(Env.EXPO_PUBLIC_RAVELRY_CLIENT_ID),
      demoMode: Env.EXPO_PUBLIC_ENABLE_DEMO_MODE,
    },
  },
});
