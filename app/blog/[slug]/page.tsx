import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import {
  getBySlug,
  getAllSlugs,
  type BlogFrontmatter,
} from '@/lib/content';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';

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
          </header>
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <MDXRemote source={content} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
