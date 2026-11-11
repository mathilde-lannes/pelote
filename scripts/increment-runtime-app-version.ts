import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

import {
  incrementPackageVersionSource,
  needsRuntimeAppVersionBump,
  readPackageVersion,
} from '../src/lib/runtime-app-version';

function readParentVersionFromGit(): string | null {
  try {
    execFileSync('git', ['rev-parse', '--verify', '--quiet', 'HEAD^'], {
      stdio: 'ignore',
    });
  }
  catch {
    return null;
  }

  const parentPackageJson = execFileSync(
    'git',
    ['show', 'HEAD^:package.json'],
    { encoding: 'utf8' },
  );

  return readPackageVersion(parentPackageJson);
}

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
