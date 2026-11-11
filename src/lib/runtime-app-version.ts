/** Parse and return the `version` string from package.json source text. */
export function readPackageVersion(source: string): string {
  const version = JSON.parse(source).version;
  if (typeof version !== 'string') {
    throw new TypeError(
      'Cannot read runtime app version. package.json version must be a string.',
    );
  }

  return version;
}

/**
 * Whether a production/native build should require bumping package.json
 * version. When `parentVersion` is null (root commit / explicit skip), no bump
 * is required.
 */
export function needsRuntimeAppVersionBump(
  currentVersion: string,
  parentVersion: string | null,
): boolean {
  return parentVersion != null && currentVersion === parentVersion;
}

/** Bump the patch segment of package.json `version` and return updated source. */
export function incrementPackageVersionSource(source: string): {
  source: string;
  version: string;
} {
  const current = readPackageVersion(source);
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
  if (!match) {
    throw new Error(
      `Cannot increment runtime app version "${current}". Expected major.minor.patch.`,
    );
  }

  const version = `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
  const nextSource = source.replace(
    /("version"\s*:\s*")(\d+\.\d+\.\d+)(")/,
    `$1${version}$3`,
  );
  if (nextSource === source) {
    throw new Error('package.json version field was not updated.');
  }

  return { source: nextSource, version };
}
