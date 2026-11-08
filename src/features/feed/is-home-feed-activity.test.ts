import type { FriendActivity } from '@/lib/ravelry/types';

import { isHomeFeedActivity } from './is-home-feed-activity';

const photo = {
  id: 1,
  medium_url: 'https://example.com/photo.jpg',
};

function activity(partial: Partial<FriendActivity>): FriendActivity {
  return {
    id: 'x',
    type: 'project_photo',
    created_at: new Date().toISOString(),
    person: { id: 1, username: 'tester' },
    ...partial,
  };
}

describe('isHomeFeedActivity', () => {
  it('includes project photos with media', () => {
    expect(
      isHomeFeedActivity(activity({ type: 'project_photo', photo })),
    ).toBe(true);
  });

  it('includes stash photos with media', () => {
    expect(
      isHomeFeedActivity(activity({ type: 'stash_photo', photo })),
    ).toBe(true);
  });

  it('includes queued patterns even without a photo', () => {
    expect(
      isHomeFeedActivity(activity({ type: 'queued', photo: null })),
    ).toBe(true);
  });

  it('excludes favourites even when a photo thumbnail is present', () => {
    expect(
      isHomeFeedActivity(activity({ type: 'favorite', photo })),
    ).toBe(false);
  });

  it('excludes comment, forum, handspun, and unknown types', () => {
    expect(isHomeFeedActivity(activity({ type: 'comment', photo }))).toBe(false);
    expect(isHomeFeedActivity(activity({ type: 'forum', photo }))).toBe(false);
    expect(
      isHomeFeedActivity(activity({ type: 'handspun_photo', photo })),
    ).toBe(false);
    expect(isHomeFeedActivity(activity({ type: 'unknown', photo }))).toBe(false);
  });

  it('excludes photo-forward types without a usable URL', () => {
    expect(
      isHomeFeedActivity(activity({ type: 'project_photo', photo: null })),
    ).toBe(false);
    expect(
      isHomeFeedActivity(activity({ type: 'stash_photo', photo: null })),
    ).toBe(false);
  });
});
