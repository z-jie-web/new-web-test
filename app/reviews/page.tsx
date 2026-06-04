import Link from 'next/link';
import { getAll, type ReviewFrontmatter } from '@/lib/content';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { CATEGORIES } from '@/lib/constants';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ReviewCard } from '@/components/ReviewCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { fileMtime } from '@/lib/article-meta';

export const metadata = seoMeta({
  title: 'All AI Tool Reviews (2026) — 32 Tools Tested & Ranked',
  description:
    'Browse all 32 AI tool reviews on ToolPorto. Expert reviews, pricing breakdowns, and honest ratings across video generation, voice, image, avatars, subtitles, and face swap.',
  path: '/reviews',
});

export default function ReviewsIndexPage() {
  const allReviews = getAll<ReviewFrontmatter>('reviews').sort((a, b) => {
    const ma = fileMtime('reviews', a.frontmatter.slug);
    const mb = fileMtime('reviews', b.frontmatter.slug);
    return (mb?.getTime() ?? 0) - (ma?.getTime() ?? 0);
  });

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    reviews: allReviews.filter((r) => r.frontmatter.category === cat.slug),
  })).filter((g) => g.reviews.length > 0);

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'All Reviews' }]} />

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            All AI Tool Reviews
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {allReviews.length} tools tested and reviewed. Sorted by latest
            updates.
          </p>
        </header>

        {/* Category quick nav */}
        <nav className="flex flex-wrap gap-2 mb-10">
          {grouped.map((g) => (
            <a
              key={g.slug}
              href={`#${g.slug}`}
              className="inline-flex items-center gap-1 rounded-full border border-border/30 px-3 py-1 text-sm text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors"
            >
              {g.name}
              <span className="text-xs text-muted-foreground/60">
                ({g.reviews.length})
              </span>
            </a>
          ))}
        </nav>

        {grouped.map((group) => (
          <section key={group.slug} id={group.slug} className="mb-12">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-2xl font-bold">
                <Link
                  href={`/categories/${group.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {group.name}
                </Link>
              </h2>
              <Link
                href={`/categories/${group.slug}`}
                className="text-sm text-primary hover:underline"
              >
                View category →
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.reviews.map((review) => (
                <ReviewCard
                  key={review.frontmatter.slug}
                  review={review.frontmatter}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
