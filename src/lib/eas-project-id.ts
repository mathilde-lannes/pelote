const EAS_PROJECT_ID_PATTERN
  = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Parse a raw EAS project id; blank/undefined → undefined, invalid → throw. */
export function parseEasProjectId(
  raw: string | undefined,
): string | undefined {
  if (raw == null || raw.trim() === '')
    return undefined;

  const projectId = raw.trim();
  if (!EAS_PROJECT_ID_PATTERN.test(projectId)) {
    throw new Error(
      `Invalid EAS_PROJECT_ID "${projectId}". Expected an EAS project UUID.`,
    );
  }

  return projectId;
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
