import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

import {
  incrementPackageVersionSource,
  needsRuntimeAppVersionBump,
  readPackageVersion,
} from '../src/lib/runtime-app-version';

/** True when HEAD has no parents (initial commit). Throws on Git errors. */
function isRootCommit(): boolean {
  const head = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  const roots = execFileSync('git', ['rev-list', '--max-parents=0', 'HEAD'], {
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .filter(Boolean);

  return roots.includes(head);
}

/** Read package.json `version` from a Git tree-ish (e.g. HEAD, HEAD^). */
function readVersionFromGit(treeIsh: string): string {
  const packageJson = execFileSync(
    'git',
    ['show', `${treeIsh}:package.json`],
    { encoding: 'utf8' },
  );

  return readPackageVersion(packageJson);
}

/**
 * Read package.json `version` from HEAD^. Returns null only for a true root
 * commit. Any other missing parent or Git failure throws.
 */
function readParentVersionFromGit(): string | null {
  try {
    execFileSync('git', ['rev-parse', '--verify', '--quiet', 'HEAD^'], {
      stdio: 'ignore',
    });
  }
  catch {
    if (isRootCommit())
      return null;

    throw new Error(
      'Unable to resolve HEAD^ for the runtime version check. Ensure Git history includes the parent commit.',
    );
  }

  return readVersionFromGit('HEAD^');
}

/**
 * Fail when the working-tree version differs from HEAD so uncommitted bumps
 * cannot satisfy the production build gate.
 */
function assertWorkingTreeVersionMatchesHead(
  workingTreeVersion: string,
): void {
  const headVersion = readVersionFromGit('HEAD');
  if (workingTreeVersion !== headVersion) {
    process.stderr.write(
      `package.json version is ${workingTreeVersion}, but HEAD has ${headVersion}. Commit the version bump before building.\n`,
    );
    process.exit(1);
  }
}

/** Exit 1 when the app version still matches the parent; otherwise print it. */
function runCheck(currentVersion: string, parentVersion: string | null): never {
  if (needsRuntimeAppVersionBump(currentVersion, parentVersion)) {
    process.stderr.write(
      `Native production builds use runtimeVersion policy "appVersion". package.json version is still ${currentVersion}, the same as the parent commit. Increment the app version (and commit it) before building or publishing an update that includes native changes. That committed package.json version remains the single runtime version source for later updates. eas.json autoIncrement only changes the iOS build number or Android version code.\n`,
    );
    process.exit(1);
  }

  process.stdout.write(`${currentVersion}\n`);
  process.exit(0);
}

const command = process.argv[2];
const parentArg = process.argv[3] ?? '';
const file = 'package.json';
const source = fs.readFileSync(file, 'utf8');
const currentVersion = readPackageVersion(source);

if (command === 'check') {
  runCheck(currentVersion, parentArg === '' ? null : parentArg);
}

if (command === 'check-git') {
  assertWorkingTreeVersionMatchesHead(currentVersion);
  runCheck(currentVersion, readParentVersionFromGit());
}

if (command !== 'bump') {
  process.stderr.write(
    'Usage: increment-runtime-app-version.ts <bump|check|check-git> [parent-version]\n',
  );
  process.exit(1);
}

const parentVersion = parentArg === '' ? null : parentArg;
if (!needsRuntimeAppVersionBump(currentVersion, parentVersion)) {
  process.stdout.write(`${currentVersion}\n`);
  process.exit(0);
}

const next = incrementPackageVersionSource(source);
fs.writeFileSync(file, next.source);
process.stdout.write(`${next.version}\n`);
