import type { Meta, StoryObj } from '@storybook/react-native';
import type { FriendActivity, RavelryPhoto } from '@/lib/ravelry/types';

import { View } from '@/components/ui';

import { ActivityCard } from './activity-card';

const photo: RavelryPhoto = {
  id: 101,
  medium2_url:
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80',
  medium_url:
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=640&q=80',
};

const person = {
  id: 1,
  username: 'knitwit',
  small_photo_url: 'https://i.pravatar.cc/64?u=knitwit',
  photo_url: 'https://i.pravatar.cc/128?u=knitwit',
};

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function projectPhoto(
  overrides: Partial<FriendActivity> = {},
): FriendActivity {
  return {
    id: 'activity-1',
    type: 'project_photo',
    created_at: hoursAgo(5),
    title: 'New project photo',
    person,
    photo,
    project: {
      id: 42,
      name: 'Fog Harbor pullover',
      pattern_name: 'Fog Harbor',
      favorites_count: 128,
      notes_html:
        '<p>Finished the sleeves this weekend. Softest merino yet.</p>',
      first_photo: photo,
    },
    ...overrides,
  };
}

const meta = {
  title: 'Feed/Post',
  component: ActivityCard,
  decorators: [
    Story => (
      <View className="flex-1 justify-center bg-black">
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ActivityCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Instagram-style photo post — username only in the header. */
export const PhotoPost: Story = {
  args: {
    item: projectPhoto(),
  },
};

export const LongCaption: Story = {
  args: {
    item: projectPhoto({
      project: {
        id: 42,
        name: 'Fog Harbor pullover',
        pattern_name: 'Fog Harbor',
        favorites_count: 12,
        notes_html:
          '<p>Blocked it yesterday and the drape is unreal. Used three skeins of fingering-weight merino, size 3 needles, and modified the sleeves to be a little shorter. Would knit again in a heartbeat.</p>',
        first_photo: photo,
      },
    }),
  },
};

export const NoPhoto: Story = {
  args: {
    item: projectPhoto({
      photo: null,
      project: {
        id: 42,
        name: 'Fog Harbor pullover',
        pattern_name: 'Fog Harbor',
        favorites_count: 3,
        notes_html: null,
        first_photo: null,
      },
      pattern_name: 'Fog Harbor',
    }),
  },
};

export const QueuedPattern: Story = {
  args: {
    item: {
      id: 'activity-2',
      type: 'queued',
      created_at: hoursAgo(26),
      person,
      pattern_name: 'Cottage Cardigan',
      title: 'Added to queue',
      photo: null,
      project: null,
    },
  },
};

export const LikedPost: Story = {
  args: {
    item: {
      id: 'activity-3',
      type: 'favorite',
      created_at: hoursAgo(2),
      person: {
        ...person,
        username: 'woolgatherer',
        small_photo_url: 'https://i.pravatar.cc/64?u=woolgatherer',
      },
      photo,
      project: {
        id: 99,
        name: 'Weekend socks',
        pattern_name: 'Vanilla socks',
        favorites_count: 45,
        first_photo: photo,
      },
    },
  },
};
