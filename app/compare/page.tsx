import Link from 'next/link';
import { getAllComparePairs } from '@/lib/compare';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { CATEGORIES } from '@/lib/constants';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Pagination } from '@/components/Pagination';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Badge } from '@/components/ui/badge';

export const metadata = seoMeta({
  title: 'All AI Tool Comparisons (2026) — Side-by-Side Reviews',
  description:
    'Browse every head-to-head AI tool comparison on ToolPorto. Find which tool wins for your specific use case across video, voice, image, and avatar categories.',
  path: '/compare',
});

const PER_PAGE = 12;

export default async function CompareIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const allPairs = getAllComparePairs().sort((a, b) => {
    const da = a.a.lastUpdated ?? '';
    const db = a.b.lastUpdated ?? '';
    const maxA = da > db ? da : db;
    const dc = b.a.lastUpdated ?? '';
    const dd = b.b.lastUpdated ?? '';
    const maxB = dc > dd ? dc : dd;
    return maxB.localeCompare(maxA);
  });

  const totalPages = Math.ceil(allPairs.length / PER_PAGE);
  const currentPage = Math.min(pageNum, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const visible = allPairs.slice(start, start + PER_PAGE);

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
            {allPairs.length} head-to-head comparisons. Find which tool wins for
            your specific workflow.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 gap-3">
          {visible.map((pair) => {
            const catName =
              CATEGORIES.find((c) => c.slug === pair.a.category)?.name ?? '';
            return (
              <Link
                key={`${pair.slugA}-${pair.slugB}`}
                href={`/compare/${pair.slugA}-vs-${pair.slugB}`}
                className="block rounded-lg border px-4 py-3 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {catName}
                  </Badge>
                </div>
                <div className="font-medium">
                  {pair.a.name}{' '}
                  <span className="text-muted-foreground font-normal">vs</span>{' '}
                  {pair.b.name}
                </div>
                {pair.compareData?.verdict && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {pair.compareData.verdict}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/compare"
        />
      </main>
      <Footer />
    </>
  );
}
