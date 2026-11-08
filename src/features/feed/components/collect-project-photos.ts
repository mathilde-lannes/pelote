import type { RavelryPhoto } from '@/lib/ravelry/types';

function photoUrl(photo?: RavelryPhoto | null): string | null {
  if (!photo)
    return null;
  return (
    photo.medium2_url
    ?? photo.medium_url
    ?? photo.shelved_url
    ?? photo.square_url
    ?? photo.small_url
    ?? null
  );
}

export function collectProjectPhotos(
  firstPhoto?: RavelryPhoto | null,
  photos?: RavelryPhoto[] | null,
): RavelryPhoto[] {
  const ordered
    = (photos?.length ? photos : firstPhoto ? [firstPhoto] : []);
  const seen = new Set<string>();
  const out: RavelryPhoto[] = [];
  for (const photo of ordered) {
    const uri = photoUrl(photo);
    if (!uri || seen.has(uri))
      continue;
    seen.add(uri);
    out.push(photo);
  }
  // If photos[] lacked usable URLs but first_photo works, fall back.
  if (!out.length && firstPhoto) {
    const uri = photoUrl(firstPhoto);
    if (uri)
      out.push(firstPhoto);
  }
  return out;
}
