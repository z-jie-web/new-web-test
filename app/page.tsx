import Link from 'next/link';
import { getAll, type ReviewFrontmatter } from '@/lib/content';
import { getAllComparePairs } from '@/lib/compare';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { SITE, CATEGORIES } from '@/lib/constants';
import { fileMtime } from '@/lib/article-meta';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ReviewCard } from '@/components/ReviewCard';
import { SearchBar } from '@/components/SearchBar';
import { JsonLd } from '@/components/JsonLd';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const metadata = seoMeta({
  title: 'AI Tools Reviews & Comparisons — Best AI Software in 2026',
  description:
    'Expert reviews, pricing breakdowns, and honest comparisons of the best AI tools for video generation, image creation, voice synthesis, face swap, and more. Find the right AI tool for your workflow.',
  path: '/',
});

export default function HomePage() {
  const allReviews = getAll<ReviewFrontmatter>('reviews');
  const sortedByLatest = [...allReviews].sort((a, b) => {
    const ma = fileMtime('reviews', a.frontmatter.slug);
    const mb = fileMtime('reviews', b.frontmatter.slug);
    return (mb?.getTime() ?? 0) - (ma?.getTime() ?? 0);
  });
  const featuredTools = sortedByLatest.slice(0, 9);

  const sortByReviewMtime = (pairs: ReturnType<typeof getAllComparePairs>) =>
    [...pairs].sort((a, b) => {
      const getMaxMtime = (pair: (typeof pairs)[number]) => {
        const ma = fileMtime('reviews', pair.a.slug);
        const mb = fileMtime('reviews', pair.b.slug);
        return Math.max(ma?.getTime() ?? 0, mb?.getTime() ?? 0);
      };
      return getMaxMtime(b) - getMaxMtime(a);
    });

  const latestCompares = sortByReviewMtime(
    getAllComparePairs().filter((p) => Boolean(p.compareContent))
  ).slice(0, 6);
  const fallbackCompares = sortByReviewMtime(getAllComparePairs()).slice(0, 6);
  const compareCards = latestCompares.length > 0 ? latestCompares : fallbackCompares;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Header />
      <main>
        {/* Hero */}
        <section className="border-b border-border/20">
          <div className="container mx-auto max-w-4xl px-4 py-20 sm:py-28 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Updated weekly · {allReviews.length}+ tools tested
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              Find the right AI tool<br className="hidden sm:block" />
              <span className="text-primary"> in 30 seconds.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Hands-on reviews and head-to-head comparisons of the best AI tools
              for video, voice, image, avatars, subtitles, and face swap.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Button size="lg" asChild>
                <Link href="/categories/video-generation">
                  Browse All Tools <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/compare">Compare Side-by-Side</Link>
              </Button>
            </div>
            <SearchBar tools={allReviews.map((r) => r.frontmatter)} />
          </div>
        </section>

        {/* Categories */}
        <section className="container mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => {
              const count = allReviews.filter(
                (r) => r.frontmatter.category === cat.slug
              ).length;
              return (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="rounded-lg border p-6 hover:border-primary/50 hover:bg-accent/50 transition-all"
                >
                  <h3 className="font-semibold mb-1">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {count} tools
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Tools */}
        <section className="container mx-auto max-w-6xl px-4 py-16 border-t border-border/20">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div>
              <div className="text-xs font-bold tracking-widest text-primary mb-1">
                ⭐ TRENDING THIS WEEK
              </div>
              <h2 className="text-2xl font-bold">Featured AI Tools</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/categories/video-generation">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTools.map((review) => (
              <ReviewCard
                key={review.frontmatter.slug}
                review={review.frontmatter}
              />
            ))}
          </div>
        </section>

        {/* Latest Comparisons */}
        <section className="container mx-auto max-w-6xl px-4 py-16 border-t border-border/20">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div>
              <div className="text-xs font-bold tracking-widest text-primary mb-1">
                🥊 HEAD-TO-HEAD
              </div>
              <h2 className="text-2xl font-bold">Latest Comparisons</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/compare">
                Browse all comparisons <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {compareCards.map((pair) => (
              <Link
                key={`${pair.slugA}-${pair.slugB}`}
                href={`/compare/${pair.slugA}-vs-${pair.slugB}`}
                className="group rounded-lg border p-5 hover:border-primary/50 hover:bg-accent/30 hover:shadow-md transition-all"
              >
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {pair.a.category.replace(/-/g, ' ')}
                </div>
                <div className="text-lg font-semibold mb-2">
                  {pair.a.name}{' '}
                  <span className="text-muted-foreground font-normal">vs</span>{' '}
                  {pair.b.name}
                </div>
                {pair.compareData?.verdict ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {pair.compareData.verdict}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    Side-by-side comparison on features, pricing, and best use cases.
                  </p>
                )}
                <div className="mt-3 text-xs text-primary group-hover:underline">
                  Read comparison →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto max-w-4xl px-4 py-16 border-t border-border/20 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Want to list your tool?
          </h2>
          <p className="text-muted-foreground mb-4">
            Get your AI tool or product in front of thousands of creators and
            developers.
          </p>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </section>
      </main>
      <Footer />
    </>
  );
}
