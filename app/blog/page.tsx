import Link from 'next/link';
import { getAll, type BlogFrontmatter, type ReviewFrontmatter } from '@/lib/content';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { CATEGORIES } from '@/lib/constants';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Badge } from '@/components/ui/badge';

export const metadata = seoMeta({
  title: 'Blog — AI Tools Guides, Comparisons & Insights',
  description:
    'In-depth guides, tool comparisons, and expert insights to help you find the best AI tools for video, voice, image, and more.',
  path: '/blog',
});

const WORDS_PER_MINUTE = 238;

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

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
          In-depth guides, tool comparisons, and expert insights to help you
          find the best AI tools for your workflow.
        </p>

        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">
              No articles yet. Check back soon for in-depth tool guides and
              comparisons.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const categoryName = post.frontmatter.category
                ? CATEGORIES.find((c) => c.slug === post.frontmatter.category)?.name
                : null;
              const readMin = post.content
                ? readingTime(post.content)
                : null;

              return (
                <Link
                  key={post.frontmatter.slug}
                  href={`/blog/${post.frontmatter.slug}`}
                  className="block rounded-lg border p-6 hover:border-primary/50 hover:bg-accent/50 transition-all group"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {categoryName && (
                      <Badge variant="secondary" className="text-xs">
                        {categoryName}
                      </Badge>
                    )}
                    {readMin && (
                      <span className="text-xs text-muted-foreground">
                        {readMin} min read
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {post.frontmatter.title}
                  </h2>
                  <p className="text-muted-foreground mt-2 line-clamp-2">
                    {post.frontmatter.description}
                  </p>
                  <time className="text-sm text-muted-foreground mt-3 block">
                    {new Date(post.frontmatter.date).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </time>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
