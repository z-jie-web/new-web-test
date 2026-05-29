import Link from 'next/link';
import { getAll, type BlogFrontmatter } from '@/lib/content';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { SITE } from '@/lib/constants';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata = seoMeta({
  title: 'Blog — Tools, Guides & SEO Insights',
  description:
    'Expert guides, tool comparisons, and insights to help you choose the best online tools.',
  path: '/blog',
});

export default function BlogIndexPage() {
  const posts = getAll<BlogFrontmatter>('blog');

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'Blog' }]} />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Blog
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Expert guides, tool comparisons, and insights to help you choose the
          best online tools for your workflow.
        </p>

        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">
              No articles yet. Check back soon for in-depth tool guides and SEO
              insights.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.frontmatter.slug}
                href={`/blog/${post.frontmatter.slug}`}
                className="block rounded-lg border p-6 hover:border-primary/50 transition-all"
              >
                <time className="text-sm text-muted-foreground">
                  {post.frontmatter.date}
                </time>
                <h2 className="text-xl font-semibold mt-1">
                  {post.frontmatter.title}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {post.frontmatter.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
