import { getAll, type ReviewFrontmatter, type BlogFrontmatter } from '@/lib/content';
import { fileMtime } from '@/lib/article-meta';
import { SITE } from '@/lib/constants';

export const dynamic = 'force-static';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: Date;
  guid: string;
  category: string;
}

export async function GET() {
  const reviews = getAll<ReviewFrontmatter>('reviews');
  const blogs = getAll<BlogFrontmatter>('blog');

  const reviewItems: FeedItem[] = reviews.map((r) => {
    const mtime = fileMtime('reviews', r.frontmatter.slug) ?? new Date();
    return {
      title: `${r.frontmatter.name} Review (2026)`,
      link: `${SITE.url}/reviews/${r.frontmatter.slug}`,
      description: r.frontmatter.description,
      pubDate: mtime,
      guid: `${SITE.url}/reviews/${r.frontmatter.slug}`,
      category: 'Review',
    };
  });

  const blogItems: FeedItem[] = blogs.map((b) => {
    const mtime = fileMtime('blog', b.frontmatter.slug);
    const date = b.frontmatter.date
      ? new Date(b.frontmatter.date)
      : (mtime ?? new Date());
    return {
      title: b.frontmatter.title,
      link: `${SITE.url}/blog/${b.frontmatter.slug}`,
      description: b.frontmatter.description,
      pubDate: date,
      guid: `${SITE.url}/blog/${b.frontmatter.slug}`,
      category: b.frontmatter.category || 'Blog',
    };
  });

  const all = [...reviewItems, ...blogItems]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 50);

  const itemsXml = all
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <category>${escapeXml(item.category)}</category>
    </item>`
    )
    .join('');

  const lastBuildDate =
    all[0]?.pubDate.toUTCString() ?? new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${escapeXml(SITE.url)}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>${SITE.locale.replace('_', '-')}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
