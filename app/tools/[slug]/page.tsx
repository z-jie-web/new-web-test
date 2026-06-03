import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import {
  getBySlug,
  getAllSlugs,
  type ToolFrontmatter,
} from '@/lib/content';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';

export async function generateStaticParams() {
  return getAllSlugs('tools').map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getBySlug<ToolFrontmatter>('tools', slug);
  if (!item) return { title: 'Not Found' };

  return seoMeta({
    title: `Free Online ${item.frontmatter.name} — No Sign Up Required`,
    description: item.frontmatter.description,
    path: `/tools/${slug}`,
  });
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getBySlug<ToolFrontmatter>('tools', slug);
  if (!item) notFound();

  const { frontmatter, content } = item;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: frontmatter.name,
          description: frontmatter.description,
          applicationCategory: frontmatter.category,
          browserRequirements: 'Requires JavaScript',
        }}
      />
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs items={[{ label: frontmatter.name }]} />
        <h1 className="text-3xl font-bold mb-4">{frontmatter.name}</h1>
        <p className="text-lg text-muted-foreground mb-8">
          {frontmatter.description}
        </p>
        <div className="prose prose-invert max-w-none">
          <MDXRemote source={content} />
        </div>

        <div className="mt-12 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          Ads placeholder — Google AdSense will go here
        </div>
      </main>
      <Footer />
    </>
  );
}
