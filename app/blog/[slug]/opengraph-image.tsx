import { ImageResponse } from 'next/og';
import { getBySlug, type BlogFrontmatter } from '@/lib/content';

export const runtime = 'nodejs';
export const alt = 'ToolPorto Blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBySlug<BlogFrontmatter>('blog', slug);
  const title = post?.frontmatter.title ?? slug;
  const description = post?.frontmatter.description ?? '';
  const category = post?.frontmatter.category ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0b0f19 0%, #1e293b 100%)',
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
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: '#3b82f6',
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            TOOLPORTO BLOG
          </div>
          {category && (
            <div
              style={{
                fontSize: 22,
                color: '#94a3b8',
                background: '#1e293b',
                padding: '4px 14px',
                borderRadius: 999,
                textTransform: 'uppercase',
              }}
            >
              {category}
            </div>
          )}
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            marginTop: 40,
            lineHeight: 1.1,
            color: 'white',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 30,
            color: '#94a3b8',
            marginTop: 30,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#64748b',
            marginTop: 'auto',
          }}
        >
          toolporto.com
        </div>
      </div>
    ),
    { ...size }
  );
}
