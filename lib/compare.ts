import { getAll, ReviewFrontmatter, getBySlug, ContentType } from './content';

export interface CompareFrontmatter {
  toolA: string;
  toolB: string;
  verdict: string;
  winner: string;
  lastUpdated: string;
}

export interface ComparePair {
  a: ReviewFrontmatter;
  b: ReviewFrontmatter;
  slugA: string;
  slugB: string;
  compareContent?: string;
  compareData?: CompareFrontmatter;
}

export function getAllComparePairs(): ComparePair[] {
  const reviews = getAll<ReviewFrontmatter>('reviews');
  const pairs: ComparePair[] = [];

  for (let i = 0; i < reviews.length; i++) {
    for (let j = i + 1; j < reviews.length; j++) {
      const a = reviews[i].frontmatter;
      const b = reviews[j].frontmatter;
      if (a.category === b.category) {
        // Check for rich compare content
        const compareResult = getCompareContent(a.slug, b.slug);
        pairs.push({
          a,
          b,
          slugA: a.slug,
          slugB: b.slug,
          compareContent: compareResult?.content,
          compareData: compareResult?.frontmatter,
        });
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

export function getCompareContent(
  slugA: string,
  slugB: string
): { frontmatter: CompareFrontmatter; content: string } | null {
  const result = getBySlug<CompareFrontmatter>('compare' as ContentType, `${slugA}-vs-${slugB}`);
  if (result) return result;
  return getBySlug<CompareFrontmatter>('compare' as ContentType, `${slugB}-vs-${slugA}`);
}

export function getComparisonsForTool(
  slug: string
): ComparePair[] {
  return getAllComparePairs().filter(
    (p) => p.slugA === slug || p.slugB === slug
  );
}
