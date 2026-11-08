import type { RavelryPhoto } from '@/lib/ravelry/types';

import { collectProjectPhotos } from './collect-project-photos';

function photo(id: number, url: string): RavelryPhoto {
  return { id, medium_url: url };
}

describe('collectProjectPhotos', () => {
  it('uses photos array order when present', () => {
    const first = photo(1, 'https://example.com/first.jpg');
    const photos = [
      photo(2, 'https://example.com/a.jpg'),
      photo(3, 'https://example.com/b.jpg'),
    ];
    expect(collectProjectPhotos(first, photos).map(p => p.id)).toEqual([2, 3]);
  });

  it('falls back to first_photo when photos is empty', () => {
    const first = photo(1, 'https://example.com/first.jpg');
    expect(collectProjectPhotos(first, []).map(p => p.id)).toEqual([1]);
    expect(collectProjectPhotos(first, undefined).map(p => p.id)).toEqual([1]);
  });

  it('dedupes by image URL', () => {
    const shared = 'https://example.com/same.jpg';
    const photos = [
      photo(1, shared),
      photo(2, shared),
      photo(3, 'https://example.com/other.jpg'),
    ];
    expect(collectProjectPhotos(null, photos).map(p => p.id)).toEqual([1, 3]);
  });
});
