import Link from 'next/link';
import { getAll, type ReviewFrontmatter } from '@/lib/content';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ReviewCard } from '@/components/ReviewCard';
import { Pagination } from '@/components/Pagination';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata = seoMeta({
  title: 'All AI Tool Reviews (2026) — 32 Tools Tested & Ranked',
  description:
    'Browse all 32 AI tool reviews on ToolPorto. Expert reviews, pricing breakdowns, and honest ratings across video generation, voice, image, avatars, subtitles, and face swap.',
  path: '/reviews',
});

const PER_PAGE = 12;

export default async function ReviewsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const allReviews = getAll<ReviewFrontmatter>('reviews').sort((a, b) => {
    const da = a.frontmatter.lastUpdated ?? '';
    const db = b.frontmatter.lastUpdated ?? '';
    return db.localeCompare(da);
  });

  const totalPages = Math.ceil(allReviews.length / PER_PAGE);
  const currentPage = Math.min(pageNum, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const visible = allReviews.slice(start, start + PER_PAGE);

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'All Reviews' }]} />

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            All AI Tool Reviews
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {allReviews.length} tools tested and reviewed. Sorted by latest
            updates.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((review) => (
            <ReviewCard
              key={review.frontmatter.slug}
              review={review.frontmatter}
            />
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/reviews"
        />
      </main>
      <Footer />
    </>
  );
}
