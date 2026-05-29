import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import {
  getAll,
  getBySlug,
  getAllSlugs,
  type ReviewFrontmatter,
  type CategoryFrontmatter,
} from '@/lib/content';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ReviewCard } from '@/components/ReviewCard';
import { JsonLd } from '@/components/JsonLd';

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
    title: `Best ${item.frontmatter.name} Tools`,
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

  const { frontmatter, content } = category;

  const tools = getAll<ReviewFrontmatter>('reviews').filter(
    (r) => r.frontmatter.category === slug
  );

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
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <Breadcrumbs items={[{ label: frontmatter.name }]} />

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Best {frontmatter.name} Tools
          </h1>
          <p className="text-lg text-muted-foreground">
            {frontmatter.description}
          </p>
        </header>

        {content.trim() && (
          <div className="prose prose-zinc dark:prose-invert max-w-none mb-8">
            <MDXRemote source={content} />
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-6">
          {tools.length} tools listed
        </p>

        {tools.length === 0 ? (
          <p className="text-muted-foreground">No tools in this category yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((t) => (
              <ReviewCard key={t.frontmatter.slug} review={t.frontmatter} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
