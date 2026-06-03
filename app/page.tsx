import Link from 'next/link';
import { getAll, type ReviewFrontmatter } from '@/lib/content';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { SITE, CATEGORIES } from '@/lib/constants';
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
  const featuredTools = allReviews.slice(0, 9);

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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              AI Tools Reviews &amp; Comparisons
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Expert reviews and honest comparisons of the best AI tools for
              video generation, image creation, voice synthesis, and more.
            </p>
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
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Tools</h2>
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
