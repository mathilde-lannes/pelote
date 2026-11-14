import type { FeedMode } from '@/features/feed/feed-mode';
import * as React from 'react';

import { ForYouScreen } from '@/features/feed/for-you/for-you-screen';
import { FriendsActivityScreen } from '@/features/feed/friends-activity/friends-activity-screen';

export default function Feed() {
  const [mode, setMode] = React.useState<FeedMode>('for-you');

  if (mode === 'friends') {
    return (
      <FriendsActivityScreen feedMode={mode} onFeedModeChange={setMode} />
    );
  }

  return (
    <ForYouScreen feedMode={mode} onFeedModeChange={setMode} />
  );
}
