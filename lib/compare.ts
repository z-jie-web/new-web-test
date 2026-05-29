import { getAll, ReviewFrontmatter } from './content';

export interface ComparePair {
  a: ReviewFrontmatter;
  b: ReviewFrontmatter;
  slugA: string;
  slugB: string;
}

export function getAllComparePairs(): ComparePair[] {
  const reviews = getAll<ReviewFrontmatter>('reviews');
  const pairs: ComparePair[] = [];

  for (let i = 0; i < reviews.length; i++) {
    for (let j = i + 1; j < reviews.length; j++) {
      const a = reviews[i].frontmatter;
      const b = reviews[j].frontmatter;
      if (a.category === b.category) {
        pairs.push({ a, b, slugA: a.slug, slugB: b.slug });
      }
    }
  }

  return pairs;
}

export function getAllCompareSlugs(): { a: string; b: string }[] {
  return getAllComparePairs().map((pair) => ({
    a: pair.slugA,
    b: pair.slugB,
  }));
}

export function getComparePair(
  slugA: string,
  slugB: string
): ComparePair | null {
  return (
    getAllComparePairs().find(
      (p) =>
        (p.slugA === slugA && p.slugB === slugB) ||
        (p.slugA === slugB && p.slugB === slugA)
    ) || null
  );
}
