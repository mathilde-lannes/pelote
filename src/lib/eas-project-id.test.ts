import {
  parseEasProjectId,
  requireEasProjectIdForUpdates,
} from '@/lib/eas-project-id';

const PROJECT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('parseEasProjectId', () => {
  it('treats missing and blank values as invalid', () => {
    expect(parseEasProjectId(undefined)).toBeUndefined();
    expect(parseEasProjectId('')).toBeUndefined();
    expect(parseEasProjectId('   ')).toBeUndefined();
  });

  it('accepts an EAS project UUID and trims surrounding space', () => {
    expect(parseEasProjectId(`  ${PROJECT_ID.toUpperCase()}  `)).toBe(
      PROJECT_ID.toUpperCase(),
    );
  });

  it('rejects a nonblank value that is not an EAS project UUID', () => {
    expect(() => parseEasProjectId('not-a-uuid')).toThrow(
      'Invalid EAS_PROJECT_ID "not-a-uuid"',
    );
    expect(() => parseEasProjectId(`${PROJECT_ID}-extra`)).toThrow(
      'Expected an EAS project UUID',
    );
  });
});

describe('requireEasProjectIdForUpdates', () => {
  it('fails update-enabled builds when the project id is missing', () => {
    expect(() =>
      requireEasProjectIdForUpdates(undefined, 'production'),
    ).toThrow('EAS_PROJECT_ID is missing or blank');
  });

  it('returns the validated id', () => {
    expect(requireEasProjectIdForUpdates(PROJECT_ID, 'preview')).toBe(
      PROJECT_ID,
    );
  });
});
