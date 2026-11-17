import {
  activityLinkFromPayload,
  activityTargetPath,
  matchPatternFromTitle,
  parseActivityTargetUri,
  patternHintFromTitle,
} from './activity-target';

describe('parseActivityTargetUri', () => {
  it('reads a pattern id', () => {
    expect(parseActivityTargetUri('/patterns/42.json').patternId).toBe(42);
    expect(activityTargetPath('https://api.ravelry.com/patterns/42.json')).toBe(
      'patterns/42.json',
    );
  });

  it('reads a project owner and id', () => {
    expect(parseActivityTargetUri('/projects/janesmith/mittens.json')).toEqual({
      patternId: null,
      patternName: null,
      projectId: null,
      projectUsername: null,
      projectName: null,
    });
    expect(parseActivityTargetUri('/projects/janesmith/15.json')).toMatchObject({
      projectId: 15,
      projectUsername: 'janesmith',
    });
  });
});

describe('activityLinkFromPayload', () => {
  it('reads a pattern show payload', () => {
    expect(activityLinkFromPayload({
      pattern: { id: 9, name: 'Neo Hat' },
    })).toMatchObject({ patternId: 9, patternName: 'Neo Hat' });
  });

  it('reads a project show payload', () => {
    expect(activityLinkFromPayload({
      project: {
        id: 3,
        name: 'my hat',
        pattern_id: 9,
        pattern_name: 'Neo Hat',
        user: { username: 'jane' },
      },
    })).toMatchObject({
      patternId: 9,
      patternName: 'Neo Hat',
      projectId: 3,
      projectUsername: 'jane',
    });
  });

  it('reads a favorite of a pattern', () => {
    expect(activityLinkFromPayload({
      bookmark: {
        type: 'pattern',
        favorited_id: 9,
        favorited: { id: 9, name: 'Neo Hat' },
      },
    })).toMatchObject({ patternId: 9, patternName: 'Neo Hat' });
  });
});

describe('pattern title matching', () => {
  it('splits a pattern-by-designer title', () => {
    expect(patternHintFromTitle('Dreaming of Spring Shawl by Leela Frankcombe')).toEqual({
      name: 'Dreaming of Spring Shawl',
      designer: 'Leela Frankcombe',
    });
  });

  it('picks the pattern with the matching designer', () => {
    expect(matchPatternFromTitle(
      [
        { id: 1, name: 'Dreaming of Spring Shawl', designerName: 'Someone Else' },
        { id: 2, name: 'Dreaming of Spring Shawl', designerName: 'Leela Frankcombe' },
      ],
      'Dreaming of Spring Shawl by Leela Frankcombe',
    )).toEqual({ id: 2, name: 'Dreaming of Spring Shawl' });
  });

  it('does not guess when several patterns share the name', () => {
    expect(matchPatternFromTitle(
      [
        { id: 1, name: 'Hat' },
        { id: 2, name: 'Hat' },
      ],
      'Hat',
    )).toBeNull();
  });
});
