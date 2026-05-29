import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getComparePair, getAllCompareSlugs } from '@/lib/compare';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { SITE } from '@/lib/constants';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, ThumbsUp, ThumbsDown, Target } from 'lucide-react';

export async function generateStaticParams() {
  return getAllCompareSlugs().map(({ a, b }) => ({
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

  return seoMeta({
    title: `${pair.a.name} vs ${pair.b.name} — Which is Better?`,
    description: `Compare ${pair.a.name} and ${pair.b.name}. Features, pricing, pros and cons to help you choose the right tool.`,
    path: `/compare/${slug}`,
    type: 'article',
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
  if (!pair) notFound();

  const { a: toolA, b: toolB } = pair;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${toolA.name} vs ${toolB.name}`,
    description: `Compare ${toolA.name} and ${toolB.name} — features, pricing, pros and cons.`,
    mainEntity: {
      '@type': 'ItemList',
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
            offers: {
              '@type': 'Offer',
              price: toolA.pricing === 'Free' ? '0' : undefined,
              priceCurrency: 'USD',
            },
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
            offers: {
              '@type': 'Offer',
              price: toolB.pricing === 'Free' ? '0' : undefined,
              priceCurrency: 'USD',
            },
          },
        },
      ],
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Compare' },
            { label: `${toolA.name} vs ${toolB.name}` },
          ]}
        />

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
          {toolA.name} vs {toolB.name}
        </h1>

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-2">{toolA.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {toolA.description}
            </p>
            <span className="text-sm font-medium">{toolA.pricing}</span>
          </div>
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-2">{toolB.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {toolB.description}
            </p>
            <span className="text-sm font-medium">{toolB.pricing}</span>
          </div>
        </div>

        {(toolA.pros.length > 0 ||
          toolA.cons.length > 0 ||
          toolB.pros.length > 0 ||
          toolB.cons.length > 0) && (
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              {toolA.pros.length > 0 && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400 mb-3">
                    <ThumbsUp className="h-4 w-4" /> {toolA.name} Pros
                  </h3>
                  <ul className="space-y-1.5">
                    {toolA.pros.map((pro, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-green-500 mt-0.5 shrink-0">+</span>{' '}
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {toolA.cons.length > 0 && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400 mb-3">
                    <ThumbsDown className="h-4 w-4" /> {toolA.name} Cons
                  </h3>
                  <ul className="space-y-1.5">
                    {toolA.cons.map((con, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-red-500 mt-0.5 shrink-0">-</span>{' '}
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {toolA.bestFor.length > 0 && (
                <div className="rounded-lg border p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Target className="h-4 w-4" /> {toolA.name} Best For
                  </h3>
                  <ul className="space-y-1.5">
                    {toolA.bestFor.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {toolB.pros.length > 0 && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400 mb-3">
                    <ThumbsUp className="h-4 w-4" /> {toolB.name} Pros
                  </h3>
                  <ul className="space-y-1.5">
                    {toolB.pros.map((pro, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-green-500 mt-0.5 shrink-0">+</span>{' '}
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {toolB.cons.length > 0 && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400 mb-3">
                    <ThumbsDown className="h-4 w-4" /> {toolB.name} Cons
                  </h3>
                  <ul className="space-y-1.5">
                    {toolB.cons.map((con, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-red-500 mt-0.5 shrink-0">-</span>{' '}
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {toolB.bestFor.length > 0 && (
                <div className="rounded-lg border p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Target className="h-4 w-4" /> {toolB.name} Best For
                  </h3>
                  <ul className="space-y-1.5">
                    {toolB.bestFor.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <Separator className="my-8" />

        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg">
            <a href={toolA.url} target="_blank" rel="noopener noreferrer">
              Try {toolA.name} <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={toolB.url} target="_blank" rel="noopener noreferrer">
              Try {toolB.name} <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
