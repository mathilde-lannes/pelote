import type { FriendActivity } from '@/lib/ravelry/types';

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function activityLabel(item: FriendActivity): string | null {
  switch (item.type) {
    case 'project_photo':
    case 'stash_photo':
    case 'handspun_photo':
      // Instagram-style photo posts: username alone in the header.
      return null;
    case 'favorite':
      return 'liked a post';
    case 'queued':
      return 'saved a pattern';
    case 'comment':
      return 'left a comment';
    default:
      return item.title ?? null;
  }
}

export function captionText(item: FriendActivity): string | null {
  const notes = item.project?.notes_html
    ? stripHtml(item.project.notes_html)
    : '';
  if (notes)
    return notes;

  const body = typeof item.body === 'string' ? item.body.trim() : '';
  if (body)
    return body;

  const title = typeof item.title === 'string' ? item.title.trim() : '';
  if (title && !/^new project photo$/i.test(title))
    return title;

  if (item.project?.name)
    return item.project.name;

  if (item.pattern_name)
    return item.pattern_name;

  return null;
}

export function likesLabel(count: number | null | undefined): string | null {
  if (typeof count !== 'number' || !Number.isFinite(count))
    return null;
  const n = Math.max(0, Math.floor(count));
  return n === 1 ? '1 like' : `${n} likes`;
}
