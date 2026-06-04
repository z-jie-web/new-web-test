import { ImageResponse } from 'next/og';
import { getBySlug, type ReviewFrontmatter } from '@/lib/content';

export const runtime = 'nodejs';
export const alt = 'ToolPorto Review';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const review = getBySlug<ReviewFrontmatter>('reviews', slug);
  const name = review?.frontmatter.name ?? slug;
  const description = review?.frontmatter.description ?? '';
  const pricing = review?.frontmatter.pricing ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0b0f19 0%, #1a1f2e 100%)',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: '#10b981',
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          TOOLPORTO REVIEW
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 900,
            marginTop: 30,
            lineHeight: 1.05,
            color: 'white',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#94a3b8',
            marginTop: 30,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 'auto',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          {pricing && (
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#10b981',
                border: '2px solid #10b981',
                padding: '8px 20px',
                borderRadius: 999,
              }}
            >
              {pricing}
            </div>
          )}
          <div style={{ fontSize: 28, color: '#64748b' }}>toolporto.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
