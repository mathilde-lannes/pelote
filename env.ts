import z from 'zod';

import packageJSON from './package.json';

const envSchema = z.object({
  EXPO_PUBLIC_APP_ENV: z.enum(['development', 'preview', 'production']),
  EXPO_PUBLIC_NAME: z.string(),
  EXPO_PUBLIC_SCHEME: z.string(),
  EXPO_PUBLIC_BUNDLE_ID: z.string(),
  EXPO_PUBLIC_PACKAGE: z.string(),
  EXPO_PUBLIC_VERSION: z.string(),
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_RAVELRY_CLIENT_ID: z.string().optional(),
  EXPO_PUBLIC_RAVELRY_REDIRECT_PATH: z.string(),
  EXPO_PUBLIC_ASSOCIATED_DOMAIN: z.string().url().optional(),

  // Build-time only — injected into app.config `extra` (local .env or EAS Secrets).
  // Requires a native rebuild (`pnpm ios` / EAS) to appear in Constants.expoConfig.
  RAVELRY_CLIENT_SECRET: z.string().optional(),
});

const EXPO_PUBLIC_APP_ENV = (process.env.EXPO_PUBLIC_APP_ENV
  ?? 'development') as z.infer<typeof envSchema>['EXPO_PUBLIC_APP_ENV'];

const BUNDLE_IDS = {
  development: 'com.pelote.development',
  preview: 'com.pelote.preview',
  production: 'com.pelote',
} as const;

const PACKAGES = {
  development: 'com.pelote.development',
  preview: 'com.pelote.preview',
  production: 'com.pelote',
} as const;

const SCHEMES = {
  development: 'pelote',
  preview: 'pelote.preview',
  production: 'pelote',
} as const;

const NAME = 'Pelote';

const STRICT_ENV_VALIDATION = process.env.STRICT_ENV_VALIDATION === '1';

const clientId = process.env.EXPO_PUBLIC_RAVELRY_CLIENT_ID ?? '';

const _env: z.infer<typeof envSchema> = {
  EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_NAME: NAME,
  EXPO_PUBLIC_SCHEME: SCHEMES[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_BUNDLE_ID: BUNDLE_IDS[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_PACKAGE: PACKAGES[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_VERSION: packageJSON.version,
  EXPO_PUBLIC_API_URL:
    process.env.EXPO_PUBLIC_API_URL ?? 'https://api.ravelry.com/',
  EXPO_PUBLIC_RAVELRY_CLIENT_ID: clientId || undefined,
  EXPO_PUBLIC_RAVELRY_REDIRECT_PATH:
    process.env.EXPO_PUBLIC_RAVELRY_REDIRECT_PATH ?? 'oauth',
  EXPO_PUBLIC_ASSOCIATED_DOMAIN: process.env.EXPO_PUBLIC_ASSOCIATED_DOMAIN,
  RAVELRY_CLIENT_SECRET: process.env.RAVELRY_CLIENT_SECRET,
};

function getValidatedEnv(env: z.infer<typeof envSchema>) {
  const parsed = envSchema.safeParse(env);

  if (parsed.success === false) {
    const errorMessage
      = `❌ Invalid environment variables:${
        JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
      }\n❌ Missing variables in .env file for APP_ENV=${EXPO_PUBLIC_APP_ENV}`
      + `\n💡 Tip: If you recently updated the .env file, try restarting with -c flag to clear the cache.`;

    if (STRICT_ENV_VALIDATION) {
      console.error(errorMessage);
      throw new Error('Invalid environment variables');
    }
  }
  else {
    console.log('✅ Environment variables validated successfully');
  }

  return parsed.success ? parsed.data : env;
}

const Env = STRICT_ENV_VALIDATION ? getValidatedEnv(_env) : _env;

export default Env;
