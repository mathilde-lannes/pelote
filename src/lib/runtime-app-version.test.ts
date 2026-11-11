import {
  incrementPackageVersionSource,
  needsRuntimeAppVersionBump,
} from '@/lib/runtime-app-version';

describe('needsRuntimeAppVersionBump', () => {
  it('requires a bump when this commit still has the parent app version', () => {
    expect(needsRuntimeAppVersionBump('0.1.0', '0.1.0')).toBe(true);
  });

  it('skips a bump when the app version already changed', () => {
    expect(needsRuntimeAppVersionBump('0.2.0', '0.1.0')).toBe(false);
  });

  it('skips a bump when there is no parent commit', () => {
    expect(needsRuntimeAppVersionBump('0.1.0', null)).toBe(false);
  });
});

describe('incrementPackageVersionSource', () => {
  it('bumps the patch version and leaves the rest of the file in place', () => {
    const source = `{
  "name": "pelote",
  "version": "0.1.0",
  "dependencies": {
    "expo": "~54.0.32"
  }
}
`;

    expect(incrementPackageVersionSource(source)).toEqual({
      version: '0.1.1',
      source: source.replace('"version": "0.1.0"', '"version": "0.1.1"'),
    });
  });

  it('rejects a version that is not major.minor.patch', () => {
    expect(() =>
      incrementPackageVersionSource('{"version":"1.0.0-beta.1"}\n'),
    ).toThrow('Expected major.minor.patch');
  });
});
