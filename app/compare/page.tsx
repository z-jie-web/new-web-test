import Link from 'next/link';
import { getAllComparePairs } from '@/lib/compare';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { CATEGORIES } from '@/lib/constants';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata = seoMeta({
  title: 'All AI Tool Comparisons (2026) — Side-by-Side Reviews',
  description:
    'Browse every head-to-head AI tool comparison on ToolPorto. Find which tool wins for your specific use case across video, voice, image, and avatar categories.',
  path: '/compare',
});

export default function CompareIndexPage() {
  const allPairs = getAllComparePairs();

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    pairs: allPairs
      .filter((p) => p.a.category === cat.slug)
      .sort((a, b) => {
        const da = a.a.lastUpdated ?? '';
        const db = a.b.lastUpdated ?? '';
        const maxA = da > db ? da : db;
        const dc = b.a.lastUpdated ?? '';
        const dd = b.b.lastUpdated ?? '';
        const maxB = dc > dd ? dc : dd;
        return maxB.localeCompare(maxA);
      }),
  })).filter((group) => group.pairs.length > 0);

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Compare', href: '/compare' },
          ]}
        />

        <header className="mb-10 mt-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            All AI Tool Comparisons
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {allPairs.length} head-to-head comparisons across {grouped.length}{' '}
            categories. Find which tool wins for your specific workflow.
          </p>
        </header>

        {grouped.map((group) => (
          <section key={group.slug} className="mb-12">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-2xl font-bold">
                {group.name}{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  ({group.pairs.length})
                </span>
              </h2>
              <Link
                href={`/categories/${group.slug}`}
                className="text-sm text-primary hover:underline"
              >
                View category →
              </Link>
            </div>

            <ul className="grid sm:grid-cols-2 gap-3">
              {group.pairs.map((pair) => (
                <li key={`${pair.slugA}-${pair.slugB}`}>
                  <Link
                    href={`/compare/${pair.slugA}-vs-${pair.slugB}`}
                    className="block rounded-lg border px-4 py-3 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <div className="font-medium">
                      {pair.a.name}{' '}
                      <span className="text-muted-foreground font-normal">
                        vs
                      </span>{' '}
                      {pair.b.name}
                    </div>
                    {pair.compareData?.verdict && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {pair.compareData.verdict}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
