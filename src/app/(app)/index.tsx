import * as React from 'react';

import { ForYouScreen } from '@/features/feed/for-you/for-you-screen';
import { FriendsActivityScreen } from '@/features/feed/friends-activity/friends-activity-screen';

export default function Feed() {
  const [mode, setMode] = React.useState<'for-you' | 'friends'>('for-you');

  if (mode === 'friends') {
    return (
      <FriendsActivityScreen onSwitchFeed={() => setMode('for-you')} />
    );
  }

  return (
    <ForYouScreen onSwitchFeed={() => setMode('friends')} />
  );
}
