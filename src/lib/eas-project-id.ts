import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse as parseDotenv } from 'dotenv';

const EAS_PROJECT_ID_PATTERN
  = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Docs / secret placeholders like `<uuid-from-expo.dev>` — treat as unset. */
function isPlaceholderProjectId(value: string): boolean {
  return /^<.*>$/.test(value) || /uuid-from-expo/i.test(value);
}

/** Parse a raw EAS project id; blank/placeholder → undefined, invalid → throw. */
export function parseEasProjectId(
  raw: string | undefined,
): string | undefined {
  if (raw == null || raw.trim() === '')
    return undefined;

  const projectId = raw.trim();
  if (isPlaceholderProjectId(projectId))
    return undefined;

  if (!EAS_PROJECT_ID_PATTERN.test(projectId)) {
    throw new Error(
      `Invalid EAS_PROJECT_ID "${projectId}". Expected an EAS project UUID.`
      + ' If .env already has a valid id, unset the shell/CI variable — dotenv does not override existing env.',
    );
  }

  return projectId;
}

function readEasProjectIdFromDotenvFile(): string | undefined {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath))
    return undefined;
  try {
    const parsed = parseDotenv(readFileSync(envPath));
    return parseEasProjectId(parsed.EAS_PROJECT_ID);
  }
  catch {
    return undefined;
  }
}

/**
 * Prefer `process.env.EAS_PROJECT_ID`, but if it’s missing or a docs placeholder,
 * fall back to the value in `.env` (dotenv skips overrides when the var is already set).
 */
export function resolveEasProjectId(
  raw: string | undefined = process.env.EAS_PROJECT_ID,
): string | undefined {
  const fromEnv = parseEasProjectId(raw);
  if (fromEnv != null)
    return fromEnv;
  return readEasProjectIdFromDotenvFile();
}

/** Require a parsed EAS project id when updates are enabled for `appEnv`. */
export function requireEasProjectIdForUpdates(
  projectId: string | undefined,
  appEnv: string,
): string {
  if (projectId == null) {
    throw new Error(
      `EAS_PROJECT_ID is missing or blank. Set it to your Expo project UUID before building or publishing ${appEnv} updates.`,
    );
  }

  return projectId;
}
