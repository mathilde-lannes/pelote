import fs from 'node:fs';

import {
  incrementPackageVersionSource,
  needsRuntimeAppVersionBump,
} from '../src/lib/runtime-app-version';

const command = process.argv[2];
const parentArg = process.argv[3] ?? '';
const parentVersion = parentArg === '' ? null : parentArg;
const file = 'package.json';
const source = fs.readFileSync(file, 'utf8');
const currentVersion = JSON.parse(source).version as string;
const needsBump = needsRuntimeAppVersionBump(currentVersion, parentVersion);

if (command === 'check') {
  if (needsBump) {
    process.stderr.write(
      `Native production builds use runtimeVersion policy "appVersion". package.json version is still ${currentVersion}, the same as the parent commit. Increment the app version before building or publishing an update that includes native changes. eas.json autoIncrement only changes the iOS build number or Android version code.\n`,
    );
    process.exit(1);
  }

  process.stdout.write(`${currentVersion}\n`);
  process.exit(0);
}

if (command !== 'bump') {
  process.stderr.write('Usage: increment-runtime-app-version.ts <bump|check> [parent-version]\n');
  process.exit(1);
}

if (!needsBump) {
  process.stdout.write(`${currentVersion}\n`);
  process.exit(0);
}

const next = incrementPackageVersionSource(source);
fs.writeFileSync(file, next.source);
process.stdout.write(`${next.version}\n`);
