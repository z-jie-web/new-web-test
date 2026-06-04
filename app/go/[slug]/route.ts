import { redirect } from 'next/navigation';
import { getBySlug, type ReviewFrontmatter } from '@/lib/content';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const fs = await import('fs');
  const path = await import('path');
  const dir = path.join(process.cwd(), 'content', 'reviews');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => ({ slug: f.replace('.mdx', '') }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const review = getBySlug<ReviewFrontmatter>('reviews', slug);

  if (!review) {
    redirect('/');
  }

  const target = review.frontmatter.affiliateUrl || review.frontmatter.url;

  if (!target) {
    redirect(`/reviews/${slug}`);
  }

  return Response.redirect(target, 302);
}
