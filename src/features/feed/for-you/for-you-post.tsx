import type { PatternHighlight } from '@/lib/ravelry/types';
import { usePathname } from 'expo-router';

import { Post } from '@/features/feed/components/post';
import { designerProfileHref } from '@/features/profile/designer-profile-href';

export function ForYouPost({ item }: { item: PatternHighlight }) {
  const pathname = usePathname();
  const pattern = item.pattern;
  const author = pattern.pattern_author;
  const user = author?.users[0];
  const designer = author?.name || user?.username || pattern.name;

  return (
    <Post
      variant="pattern"
      authorName={designer}
      authorAvatar={user?.small_photo_url ?? user?.photo_url ?? null}
      authorHref={designerProfileHref(author, pathname)}
      patternId={pattern.id}
      patternName={pattern.name}
      photos={pattern.photos}
      notesHtml={pattern.notes_html}
      timelineDate={item.timeline_date}
      favoritesCount={pattern.favorites_count}
      projectsCount={pattern.projects_count}
      commentsCount={pattern.comments_count}
      packsCount={pattern.packs_count}
    />
  );
}
