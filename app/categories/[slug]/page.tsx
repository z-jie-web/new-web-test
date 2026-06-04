import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getAll,
  getBySlug,
  getAllSlugs,
  type ReviewFrontmatter,
  type CategoryFrontmatter,
  type BlogFrontmatter,
} from '@/lib/content';
import { getAllComparePairs } from '@/lib/compare';
import { CATEGORIES } from '@/lib/constants';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ReviewGrid } from '@/components/ReviewGrid';
import { JsonLd } from '@/components/JsonLd';
import { ArrowRight } from 'lucide-react';

export async function generateStaticParams() {
  return getAllSlugs('categories').map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getBySlug<CategoryFrontmatter>('categories', slug);
  if (!item) return { title: 'Not Found' };

  return seoMeta({
    title: `Best ${item.frontmatter.name} Tools in 2026 — Compare & Choose`,
    description: item.frontmatter.description,
    path: `/categories/${slug}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getBySlug<CategoryFrontmatter>('categories', slug);
  if (!category) notFound();

  const { frontmatter } = category;

  const tools = getAll<ReviewFrontmatter>('reviews').filter(
    (r) => r.frontmatter.category === slug
  );

  const relatedPosts = getAll<BlogFrontmatter>('blog').filter(
    (b) => b.frontmatter.category === slug
  );

  const relatedCompares = getAllComparePairs().filter(
    (p) =>
      p.a.category === slug ||
      p.b.category === slug
  );

  const otherCategories = CATEGORIES.filter((c) => c.slug !== slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${frontmatter.name} Tools`,
    about: frontmatter.name,
    mainEntity: tools.map((t) => ({
      '@type': 'SoftwareApplication',
      name: t.frontmatter.name,
      applicationCategory: frontmatter.name,
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs items={[{ label: frontmatter.name }]} />

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Best {frontmatter.name} Tools
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {frontmatter.description}
          </p>
        </header>

        <p className="text-sm text-muted-foreground mb-6">
          {tools.length} tools compared
        </p>

        {tools.length === 0 ? (
          <p className="text-muted-foreground">
            No tools in this category yet.
          </p>
        ) : (
          <ReviewGrid reviews={tools.map((t) => t.frontmatter)} />
        )}

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-8 border-t border-border/20">
            <h2 className="text-lg font-semibold mb-4">
              {frontmatter.name} Guides & Articles
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedPosts.map((post) => (
                <Link
                  key={post.frontmatter.slug}
                  href={`/blog/${post.frontmatter.slug}`}
                  className="rounded-lg border p-4 hover:border-primary/50 hover:bg-accent/50 transition-all"
                >
                  <h3 className="font-medium mb-1">
                    {post.frontmatter.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.frontmatter.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Comparisons */}
        {relatedCompares.length > 0 && (
          <section className="mt-8 pt-8 border-t border-border/20">
            <h2 className="text-lg font-semibold mb-4">
              {frontmatter.name} Comparisons
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedCompares.slice(0, 6).map((pair) => (
                <Link
                  key={`${pair.slugA}-vs-${pair.slugB}`}
                  href={`/compare/${pair.slugA}-vs-${pair.slugB}`}
                  className="rounded-lg border p-4 hover:border-primary/50 hover:bg-accent/50 transition-all"
                >
                  <h3 className="font-medium mb-1">
                    {pair.a.name} vs {pair.b.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {pair.compareData?.verdict ??
                      `Side-by-side comparison of ${pair.a.name} and ${pair.b.name}.`}
                  </p>
                </Link>
              ))}
            </div>
            {relatedCompares.length > 6 && (
              <p className="mt-3 text-sm text-muted-foreground">
                +{relatedCompares.length - 6} more comparisons available
              </p>
            )}
          </section>
        )}

        {/* Cross-category navigation */}
        <footer className="mt-16 pt-8 border-t border-border/20">
          <h2 className="text-lg font-semibold mb-4">Other Categories</h2>
          <div className="flex flex-wrap gap-2">
            {otherCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-border/30 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors"
              >
                {c.name}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </footer>
      </main>
      <Footer />
    </>
  );
}
