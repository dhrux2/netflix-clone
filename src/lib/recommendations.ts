import { catalog } from '../data/catalog';
import type { Library } from '../types';

export function recommendations(library: Library) {
  const weights = new Map<string, number>();
  for (const title of catalog) {
    const weight =
      (library.likes.includes(title.id) ? 3 : 0) +
      (library.list.includes(title.id) ? 2 : 0) +
      (library.progress[title.id]?.seconds > 30 ? 1 : 0);
    for (const genre of title.genres) weights.set(genre, (weights.get(genre) || 0) + weight);
  }
  if (![...weights.values()].some(Boolean)) return [];
  return catalog
    .filter((title) => !library.likes.includes(title.id) && !library.list.includes(title.id))
    .map((title) => ({
      title,
      score: title.genres.reduce((score, genre) => score + (weights.get(genre) || 0), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.title)
    .slice(0, 8);
}
