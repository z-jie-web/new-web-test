import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import {
  getBySlug,
  getAllSlugs,
  type BlogFrontmatter,
  type ReviewFrontmatter,
  getBySlug as getReview,
} from '@/lib/content';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ReviewCard } from '@/components/ReviewCard';
import { JsonLd } from '@/components/JsonLd';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export async function generateStaticParams() {
  return getAllSlugs('blog').map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getBySlug<BlogFrontmatter>('blog', slug);
  if (!item) return { title: 'Not Found' };

  return seoMeta({
    title: item.frontmatter.title,
    description: item.frontmatter.description,
    path: `/blog/${slug}`,
    type: 'article',
  });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getBySlug<BlogFrontmatter>('blog', slug);
  if (!item) notFound();

  const { frontmatter, content } = item;

  const relatedReviews = (frontmatter.relatedReviews || [])
    .map((slug) => getReview<ReviewFrontmatter>('reviews', slug))
    .filter((r): r is { frontmatter: ReviewFrontmatter; content: string } => r !== null);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: frontmatter.title,
          description: frontmatter.description,
          datePublished: frontmatter.date,
        }}
      />
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Blog', href: '/blog' },
            { label: frontmatter.title },
          ]}
        />
        <article>
          <header className="mb-8">
            {frontmatter.date && (
              <time className="text-sm text-muted-foreground mb-2 block">
                {new Date(frontmatter.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {frontmatter.title}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              {frontmatter.description}
            </p>
            {frontmatter.category && (
              <div className="flex flex-wrap gap-2 mt-3">
                <Link href={`/categories/${frontmatter.category}`}>
                  <Badge variant="secondary">{frontmatter.category}</Badge>
                </Link>
              </div>
            )}
          </header>
          <div className="prose prose-invert max-w-none">
            <MDXRemote source={content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </div>
        </article>

        {relatedReviews.length > 0 && (
          <>
            <Separator className="my-10" />
            <section>
              <h2 className="text-2xl font-bold mb-4">
                Tools Mentioned in This Article
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedReviews.map((r) => (
                  <ReviewCard
                    key={r.frontmatter.slug}
                    review={r.frontmatter}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
