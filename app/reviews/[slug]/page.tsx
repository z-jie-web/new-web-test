import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import {
  getBySlug,
  getAll,
  getAllSlugs,
  getCategories,
  type ReviewFrontmatter,
} from '@/lib/content';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { SITE } from '@/lib/constants';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ReviewCard } from '@/components/ReviewCard';
import { Disclosure } from '@/components/Disclosure';
import { ShareButtons } from '@/components/ShareButtons';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { mdxComponents } from '@/components/MdxComponents';
import { TldrBox, MobileStickyCta } from '@/components/TldrBox';
import { TableOfContents } from '@/components/TableOfContents';
import { ToolLogo } from '@/components/ToolLogo';
import { extractToc } from '@/lib/toc';
import { readingTime, fileMtime, formatDate } from '@/lib/article-meta';
import { JsonLd } from '@/components/JsonLd';
import { AuthorByline } from '@/components/AuthorByline';
import { getAuthor, CATEGORY_AUTHOR_MAP } from '@/lib/authors';
import { getComparisonsForTool } from '@/lib/compare';
import { getLogoPath } from '@/lib/logos';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, ThumbsUp, ThumbsDown, Target } from 'lucide-react';

export async function generateStaticParams() {
  return getAllSlugs('reviews').map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getBySlug<ReviewFrontmatter>('reviews', slug);
  if (!item) return { title: 'Not Found' };

  const title = `${item.frontmatter.name} Review (2026) — Is It Worth It?`;
  const description = `${item.frontmatter.name} review for 2026: ${item.frontmatter.description}`.slice(
    0,
    158
  );

  return seoMeta({
    title,
    description,
    path: `/reviews/${slug}`,
    type: 'article',
    ogImage: `/reviews/${slug}/opengraph-image`,
  });
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getBySlug<ReviewFrontmatter>('reviews', slug);
  if (!item) notFound();

  const { frontmatter, content } = item;
  const categoryName =
    getCategories().find((c) => c.frontmatter.slug === frontmatter.category)?.frontmatter.name ||
    frontmatter.category;

  const allReviews = getAll<ReviewFrontmatter>('reviews');
  const currentTags = new Set((frontmatter.tags || []).map((t) => t.toLowerCase()));

  const scoredReviews = allReviews
    .filter((r) => r.frontmatter.slug !== slug)
    .map((r) => {
      const tagOverlap = (r.frontmatter.tags || []).reduce(
        (acc, t) => acc + (currentTags.has(t.toLowerCase()) ? 1 : 0),
        0
      );
      const sameCategory = r.frontmatter.category === frontmatter.category ? 1 : 0;
      const samePricing = r.frontmatter.pricing === frontmatter.pricing ? 0.5 : 0;
      const score = tagOverlap * 3 + sameCategory * 2 + samePricing;
      return { ...r, _score: score };
    })
    .sort((a, b) => b._score - a._score);

  const relatedReviews = scoredReviews.slice(0, 3);

  const mtime = fileMtime('reviews', frontmatter.slug);
  const isoMtime = (mtime ?? new Date()).toISOString();
  const reviewUrl = `${SITE.url}/reviews/${frontmatter.slug}`;
  const reviewOgImageUrl = `${SITE.url}/reviews/${frontmatter.slug}/opengraph-image`;
  const logoPath = getLogoPath(frontmatter.slug);
  const logoUrl = logoPath ? `${SITE.url}${logoPath}` : null;
  const ratingValue = frontmatter.pros.length >= 3 ? 4.6 : 4.3;
  const logoCaption = `${frontmatter.name} ${categoryName} tool logo`;

  // Resolve author from category mapping
  const resolvedAuthor = getAuthor(CATEGORY_AUTHOR_MAP[frontmatter.category] || '');
  const authorName = resolvedAuthor?.name || SITE.name;
  const authorUrl = resolvedAuthor
    ? `${SITE.url}/author/${resolvedAuthor.slug}`
    : SITE.url;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Review',
        '@id': `${reviewUrl}#review`,
        url: reviewUrl,
        name: `${frontmatter.name} Review`,
        headline: `${frontmatter.name} Review (2026)`,
        datePublished: isoMtime,
        dateModified: isoMtime,
        author: resolvedAuthor
          ? {
              '@type': 'Person',
              name: resolvedAuthor.name,
              url: authorUrl,
              jobTitle: resolvedAuthor.title,
            }
          : {
              '@type': 'Organization',
              name: SITE.name,
              url: SITE.url,
            },
        publisher: {
          '@type': 'Organization',
          name: SITE.name,
          url: SITE.url,
        },
        reviewBody: frontmatter.description,
        image: logoUrl ? [reviewOgImageUrl, logoUrl] : [reviewOgImageUrl],
        reviewRating: {
          '@type': 'Rating',
          ratingValue,
          bestRating: 5,
          worstRating: 1,
        },
        itemReviewed: { '@id': `${reviewUrl}#tool` },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${reviewUrl}#tool`,
        name: frontmatter.name,
        applicationCategory: categoryName,
        description: frontmatter.description,
        url: frontmatter.url,
        operatingSystem: 'Web',
        image: logoUrl ?? reviewOgImageUrl,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue,
          reviewCount: 1,
          bestRating: 5,
          worstRating: 1,
        },
        offers: {
          '@type': 'Offer',
          price: frontmatter.pricing === 'Free' ? 0 : undefined,
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE.url,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: categoryName,
            item: `${SITE.url}/categories/${frontmatter.category}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: frontmatter.name,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is ${frontmatter.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: frontmatter.description,
            },
          },
          {
            '@type': 'Question',
            name: `Is ${frontmatter.name} free?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${frontmatter.name} offers ${frontmatter.pricing.toLowerCase()} pricing. ${frontmatter.pricing === 'Free' ? 'It is completely free to use.' : frontmatter.pricing === 'Freemium' ? 'It has a free tier with paid upgrades.' : 'It is a paid tool.'}`,
            },
          },
          ...(frontmatter.pros.length > 0
            ? [
                {
                  '@type': 'Question',
                  name: `What are the best features of ${frontmatter.name}?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Key strengths include: ${frontmatter.pros.join('. ')}.`,
                  },
                },
              ]
            : []),
        ],
      },
      ...(logoUrl
        ? [
            {
              '@type': 'ImageObject',
              '@id': `${reviewUrl}#logo`,
              contentUrl: logoUrl,
              url: logoUrl,
              name: `${frontmatter.name} logo`,
              caption: logoCaption,
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8 pb-24 md:pb-8">
        <Breadcrumbs
          items={[
            {
              label: categoryName,
              href: `/categories/${frontmatter.category}`,
            },
            { label: frontmatter.name },
          ]}
        />

        <article>
          <header className="mb-8">
            <div className="mb-5 flex items-center gap-4">
              <ToolLogo
                slug={frontmatter.slug}
                name={frontmatter.name}
                size={64}
                className="rounded-xl border border-border/30 bg-card/70 p-2"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                  Tool Profile
                </div>
                <div className="text-sm text-muted-foreground">
                  Brand mark for {frontmatter.name}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary">{categoryName}</Badge>
              <Badge
                variant={
                  frontmatter.pricing === 'Free' ? 'secondary' : 'outline'
                }
              >
                {frontmatter.pricing}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              {frontmatter.name} Review
            </h1>
            <p className="text-lg text-muted-foreground">
              {frontmatter.description}
            </p>
            {resolvedAuthor && (
              <AuthorByline
                author={resolvedAuthor}
                date={formatDate(fileMtime('reviews', frontmatter.slug))}
                readingTime={readingTime(content)}
              />
            )}
            {!resolvedAuthor && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                <span>Updated {formatDate(fileMtime('reviews', frontmatter.slug))}</span>
                <span>·</span>
                <span>{readingTime(content)} min read</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {frontmatter.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </header>

          <Separator className="my-8" />

          <TldrBox review={frontmatter} />

          <TableOfContents items={extractToc(content)} />

          <div className="prose prose-invert max-w-none mb-8">
            <MDXRemote source={content} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </div>

          {(frontmatter.pros.length > 0 || frontmatter.cons.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-5">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
                  <ThumbsUp className="h-5 w-5" /> Pros
                </h2>
                <ul className="space-y-2">
                  {frontmatter.pros.map((pro, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-green-500 mt-0.5">+</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
                  <ThumbsDown className="h-5 w-5" /> Cons
                </h2>
                <ul className="space-y-2">
                  {frontmatter.cons.map((con, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-red-500 mt-0.5">-</span> {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {frontmatter.bestFor.length > 0 && (
            <div className="rounded-lg border p-5 mb-8">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Target className="h-5 w-5" /> Best For
              </h2>
              <ul className="space-y-2">
                {frontmatter.bestFor.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-8">
            <Button asChild size="lg">
              <a
                href={`/go/${frontmatter.slug}`}
                rel="sponsored noopener"
              >
                Visit {frontmatter.name}{' '}
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href={`/categories/${frontmatter.category}`}>
                More {categoryName} Tools
              </Link>
            </Button>
          </div>
        </article>

        {relatedReviews.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Related Tools</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedReviews.map((r) => (
                <ReviewCard
                  key={r.frontmatter.slug}
                  review={r.frontmatter}
                />
              ))}
            </div>
          </section>
        )}

        <ShareButtons title={`${frontmatter.name} Review`} />
        <NewsletterSignup compact />
        <CompareWith currentSlug={frontmatter.slug} currentName={frontmatter.name} />
        <Disclosure />
      </main>
      <MobileStickyCta review={frontmatter} />
      <Footer />
    </>
  );
}

function CompareWith({
  currentSlug,
  currentName,
}: {
  currentSlug: string;
  currentName: string;
}) {
  const pairs = getComparisonsForTool(currentSlug).slice(0, 6);
  if (pairs.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Compare {currentName} With</h2>
      <ul className="grid sm:grid-cols-2 gap-3">
        {pairs.map((pair) => {
          const other = pair.slugA === currentSlug ? pair.b : pair.a;
          return (
            <li key={`${pair.slugA}-${pair.slugB}`}>
              <Link
                href={`/compare/${pair.slugA}-vs-${pair.slugB}`}
                className="block rounded-lg border px-4 py-3 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <span className="font-medium">{currentName}</span>
                <span className="text-muted-foreground"> vs </span>
                <span className="font-medium">{other.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
