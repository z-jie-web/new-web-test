import { getAll, type ReviewFrontmatter, type BlogFrontmatter } from '@/lib/content';
import { SITE } from '@/lib/constants';

export async function GET() {
  const reviews = getAll<ReviewFrontmatter>('reviews');
  const blog = getAll<BlogFrontmatter>('blog');

  const lines = [
    `# ${SITE.name}`,
    `> ${SITE.description}`,
    '',
    '## Pages',
    `- ${SITE.url}/: Homepage — featured tools, categories, and latest content`,
    `- ${SITE.url}/categories/[slug]: Browse tools by category`,
    `- ${SITE.url}/reviews/[slug]: Detailed tool reviews and comparisons`,
    `- ${SITE.url}/tools/[slug]: Free online tools`,
    `- ${SITE.url}/compare/[a]-vs-[b]: Side-by-side tool comparisons`,
    `- ${SITE.url}/blog/[slug]: Articles and guides`,
    '',
    '## Tools & Reviews',
  ];

  for (const r of reviews) {
    lines.push(
      `- [${r.frontmatter.name}](${SITE.url}/reviews/${r.frontmatter.slug}): ${r.frontmatter.description}`
    );
  }

  lines.push('', '## Blog Posts');
  for (const b of blog) {
    lines.push(
      `- [${b.frontmatter.title}](${SITE.url}/blog/${b.frontmatter.slug}): ${b.frontmatter.description}`
    );
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
