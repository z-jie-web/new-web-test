import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getComparePair, getAllCompareSlugsWithContent, getAllComparePairsWithContent } from '@/lib/compare';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { SITE } from '@/lib/constants';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Disclosure } from '@/components/Disclosure';
import { mdxComponents } from '@/components/MdxComponents';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { fileMtime } from '@/lib/article-meta';
import { TableOfContents } from '@/components/TableOfContents';
import { extractToc } from '@/lib/toc';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Check, X, HelpCircle } from 'lucide-react';

export async function generateStaticParams() {
  return getAllCompareSlugsWithContent().map(({ a, b }) => ({
    slugs: [`${a}-vs-${b}`],
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slugs: string[] }>;
}) {
  const { slugs } = await params;
  const slug = slugs[0];
  const [a, b] = slug.split('-vs-');
  if (!a || !b) return { title: 'Not Found' };

  const pair = getComparePair(a, b);
  if (!pair) return { title: 'Not Found' };

  const title = `${pair.a.name} vs ${pair.b.name} (2026): Which Should You Choose?`;

  return seoMeta({
    title,
    description: `Compare ${pair.a.name} and ${pair.b.name} head-to-head on features, pricing, quality, and use cases. Find out which tool is right for your workflow.`,
    path: `/compare/${slug}`,
    type: 'article',
    ogImage: `/api/og/compare?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`,
  });
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slugs: string[] }>;
}) {
  const { slugs } = await params;
  const slug = slugs[0];
  const [a, b] = slug.split('-vs-');
  if (!a || !b) notFound();

  const pair = getComparePair(a, b);
  if (!pair || !pair.compareContent) notFound();

  const { a: toolA, b: toolB, compareContent, compareData } = pair;

  const compareUrl = `${SITE.url}/compare/${toolA.slug}-vs-${toolB.slug}`;
  const compareSlug = `${toolA.slug}-vs-${toolB.slug}`;
  const mtime = fileMtime('compare', compareSlug);
  const isoMtime = (mtime ?? new Date()).toISOString();
  const description = compareData?.verdict || `Compare ${toolA.name} and ${toolB.name} — features, pricing, pros and cons.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${compareUrl}#article`,
        url: compareUrl,
        mainEntityOfPage: compareUrl,
        headline: `${toolA.name} vs ${toolB.name} (2026): Which Should You Choose?`,
        description,
        datePublished: isoMtime,
        dateModified: isoMtime,
        image: `${SITE.url}/api/og/compare?a=${encodeURIComponent(toolA.slug)}&b=${encodeURIComponent(toolB.slug)}`,
        author: {
          '@type': 'Organization',
          name: SITE.name,
          url: SITE.url,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE.name,
          url: SITE.url,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE.url}/compare` },
          { '@type': 'ListItem', position: 3, name: `${toolA.name} vs ${toolB.name}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: `${toolA.name} vs ${toolB.name}`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@type': 'SoftwareApplication',
              name: toolA.name,
              description: toolA.description,
              applicationCategory: toolA.category,
              url: toolA.url,
            },
          },
          {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@type': 'SoftwareApplication',
              name: toolB.name,
              description: toolB.description,
              applicationCategory: toolB.category,
              url: toolB.url,
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Compare', href: '/' },
            { label: `${toolA.name} vs ${toolB.name}` },
          ]}
        />

        {/* Header */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-2 mb-3">
          {toolA.name} vs {toolB.name}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          {compareData?.verdict ||
            `Compare ${toolA.name} and ${toolB.name} on features, pricing, and best use cases.`}
        </p>

        {/* Quick Comparison Table — all pages get this */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-3 pr-4 font-semibold" />
                <th className="text-left py-3 px-4 font-semibold text-base">
                  {toolA.name}
                </th>
                <th className="text-left py-3 pl-4 font-semibold text-base">
                  {toolB.name}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3 pr-4 font-medium text-muted-foreground">Pricing</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {toolA.pricing}
                  </span>
                </td>
                <td className="py-3 pl-4">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {toolB.pricing}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 pr-4 font-medium text-muted-foreground">Category</td>
                <td className="py-3 px-4 capitalize">{toolA.category.replace(/-/g, ' ')}</td>
                <td className="py-3 pl-4 capitalize">{toolB.category.replace(/-/g, ' ')}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 pr-4 font-medium text-muted-foreground">Best For</td>
                <td className="py-3 px-4">{toolA.bestFor[0]}</td>
                <td className="py-3 pl-4">{toolB.bestFor[0]}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-muted-foreground">Key Strength</td>
                <td className="py-3 px-4 text-green-600 dark:text-green-400">
                  {toolA.pros[0]}
                </td>
                <td className="py-3 pl-4 text-green-600 dark:text-green-400">
                  {toolB.pros[0]}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Rich MDX Content — when available */}
        {compareContent && (
          <>
            <TableOfContents items={extractToc(compareContent)} />
            <div className="prose prose-invert max-w-none mb-8">
              <MDXRemote
                source={compareContent}
                components={mdxComponents}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
              />
            </div>
          </>
        )}

        {/* Pros & Cons — always show */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {/* Tool A */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-1">{toolA.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">{toolA.description}</p>

            {toolA.pros.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 mb-2">
                  Pros
                </h3>
                <ul className="space-y-1.5">
                  {toolA.pros.map((pro, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {toolA.cons.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
                  Cons
                </h3>
                <ul className="space-y-1.5">
                  {toolA.cons.map((con, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Tool B */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-1">{toolB.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">{toolB.description}</p>

            {toolB.pros.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 mb-2">
                  Pros
                </h3>
                <ul className="space-y-1.5">
                  {toolB.pros.map((pro, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {toolB.cons.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
                  Cons
                </h3>
                <ul className="space-y-1.5">
                  {toolB.cons.map((con, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Best For Comparison */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <HelpCircle className="h-4 w-4" />
              Choose {toolA.name} if you:
            </h3>
            <ul className="space-y-1.5">
              {toolA.bestFor.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <HelpCircle className="h-4 w-4" />
              Choose {toolB.name} if you:
            </h3>
            <ul className="space-y-1.5">
              {toolB.bestFor.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Verdict — auto-generated or from MDX */}
        {!compareContent && (
          <div className="rounded-lg border-2 border-primary/30 bg-card p-6 mb-8">
            <h2 className="text-lg font-semibold mb-3">Bottom Line</h2>
            <p className="text-muted-foreground leading-relaxed">
              {toolA.name} and {toolB.name} serve different needs within the{' '}
              {toolA.category.replace(/-/g, ' ')} space.{' '}
              {toolA.pricing === 'Free' && toolB.pricing !== 'Free'
                ? `${toolA.name} is the budget-friendly option, while ${toolB.name} justifies its price with additional features. `
                : toolB.pricing === 'Free' && toolA.pricing !== 'Free'
                  ? `${toolB.name} is the budget-friendly option, while ${toolA.name} justifies its price with additional features. `
                  : ''}
              {toolA.bestFor[0]?.toLowerCase().includes('beginner') ||
              toolA.bestFor[0]?.toLowerCase().includes('casual')
                ? `${toolA.name} is better for beginners and casual users. `
                : ''}
              {toolB.bestFor[0]?.toLowerCase().includes('professional') ||
              toolB.bestFor[0]?.toLowerCase().includes('enterprise')
                ? `${toolB.name} is better suited for professional and enterprise workflows. `
                : ''}
              Try both — most offer free tiers or trials — and see which fits your specific workflow.
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          <Button asChild size="lg">
            <a href={`/go/${toolA.slug}`} rel="sponsored noopener">
              Try {toolA.name} <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={`/go/${toolB.slug}`} rel="sponsored noopener">
              Try {toolB.name} <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-8 text-sm">
          <Link href={`/reviews/${toolA.slug}`} className="text-primary hover:underline">
            Read full {toolA.name} review →
          </Link>
          <Link href={`/reviews/${toolB.slug}`} className="text-primary hover:underline">
            Read full {toolB.name} review →
          </Link>
        </div>

        <Separator className="my-8" />

        {/* Related comparisons — same category */}
        <RelatedComparisons current={pair} />
        <Disclosure />
      </main>
      <Footer />
    </>
  );
}

function RelatedComparisons({ current }: { current: ReturnType<typeof getComparePair> }) {
  if (!current) return null;

  const allPairs = getAllComparePairsWithContent();

  const related = allPairs
    .filter(
      (p) =>
        p.a.category === current.a.category &&
        !(
          (p.slugA === current.slugA && p.slugB === current.slugB) ||
          (p.slugA === current.slugB && p.slugB === current.slugA)
        )
    )
    .slice(0, 6);

  if (related.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">More {current.a.category.replace(/-/g, ' ')} Comparisons</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {related.map((p) => (
          <Link
            key={`${p.slugA}-vs-${p.slugB}`}
            href={`/compare/${p.slugA}-vs-${p.slugB}`}
            className="rounded-lg border px-4 py-3 text-sm hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <span className="font-medium">{p.a.name}</span>
            <span className="text-muted-foreground"> vs </span>
            <span className="font-medium">{p.b.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
