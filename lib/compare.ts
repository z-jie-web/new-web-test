import { getAll, getAllSlugs, ReviewFrontmatter, getBySlug, ContentType } from './content';

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
  const indexBySlug = new Map(reviews.map((r, i) => [r.frontmatter.slug, i]));

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

  // Cross-category compares that have a dedicated MDX file (e.g. models that
  // live in different categories but are commonly compared). The compare file
  // is the source of truth; slug order still follows the review array order so
  // canonical URLs stay consistent with sitemap generation.
  const seen = new Set(pairs.map((p) => `${p.slugA}-vs-${p.slugB}`));
  for (const fileSlug of getAllSlugs('compare')) {
    const idx = fileSlug.indexOf('-vs-');
    if (idx < 0) continue;
    const ix = indexBySlug.get(fileSlug.slice(0, idx));
    const iy = indexBySlug.get(fileSlug.slice(idx + 4));
    if (ix === undefined || iy === undefined) continue;
    if (reviews[ix].frontmatter.category === reviews[iy].frontmatter.category) continue;
    const [first, second] = ix < iy ? [ix, iy] : [iy, ix];
    const a = reviews[first].frontmatter;
    const b = reviews[second].frontmatter;
    const key = `${a.slug}-vs-${b.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
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

  return pairs;
}

export function getAllCompareSlugs(): { a: string; b: string }[] {
  return getAllComparePairs().map((pair) => ({
    a: pair.slugA,
    b: pair.slugB,
  }));
}

/** Only pairs that have a dedicated MDX content file. Use for sitemap + static generation. */
export function getAllComparePairsWithContent(): ComparePair[] {
  return getAllComparePairs().filter((p) => p.compareContent != null);
}

export function getAllCompareSlugsWithContent(): { a: string; b: string }[] {
  return getAllComparePairsWithContent().map((pair) => ({
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
