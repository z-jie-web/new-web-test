import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { getAllAuthors } from '@/lib/authors';
import { JsonLd } from '@/components/JsonLd';
import { SITE } from '@/lib/constants';
import Link from 'next/link';

export const metadata = seoMeta({
  title: 'About ToolPorto — Our Team & Mission',
  description:
    'ToolPorto helps creators and developers discover the best online tools and AI products. Meet our team of hands-on reviewers.',
  path: '/about',
});

export default function AboutPage() {
  const authors = getAllAuthors();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About ToolPorto',
    description:
      'ToolPorto is a curated directory of AI tools and products, with hands-on reviews by a team of experienced testers.',
    url: `${SITE.url}/about`,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'About' }]} />
        <h1 className="text-3xl font-bold mb-6">About ToolPorto</h1>
        <div className="prose prose-invert max-w-none">
          <p>
            ToolPorto is a curated directory of the best online tools, AI
            products, and free utilities. We help creators, developers, and
            marketers find the right tools for their workflow — with honest
            reviews, side-by-side comparisons, and free online tools.
          </p>

          <p>
            We launched in June 2026 with a simple belief: most tool review
            sites just rewrite press releases. We sign up for every tool, run
            real tasks, and form opinions based on actual use. If a tool is
            mediocre, we say so.
          </p>

          <h2>How We Work</h2>
          <p>
            Every tool on ToolPorto goes through hands-on testing. We follow a
            consistent evaluation process — sign up, run real-world tasks,
            compare against alternatives, and verify pricing claims. Read our
            full methodology on the{' '}
            <Link href="/how-we-test" className="text-primary hover:underline">
              How We Test
            </Link>{' '}
            page.
          </p>

          <h2>Our Team</h2>
          <p>
            Every review and article is written by a real person with hands-on
            experience in that category. Each team member specializes in
            specific tool types so our evaluations are informed by deep
            domain knowledge, not surface-level impressions.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {authors.map((author) => (
            <div
              key={author.slug}
              className="rounded-lg border p-6 flex flex-col sm:flex-row gap-5 hover:border-primary/30 transition-colors"
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                {author.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <Link
                  href={`/author/${author.slug}`}
                  className="text-lg font-semibold text-primary hover:underline"
                >
                  {author.name}
                </Link>
                <p className="text-sm text-muted-foreground">{author.title}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {author.bio}
                </p>
                {author.social?.linkedin && (
                  <a
                    href={author.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm text-primary hover:underline"
                  >
                    LinkedIn →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="prose prose-invert max-w-none mt-8">
          <h2>Monetization</h2>
          <p>
            ToolPorto is supported by affiliate commissions and advertising.
            This allows us to keep the site free for everyone. We clearly
            disclose affiliate links in accordance with our{' '}
            <Link
              href="/disclaimer"
              className="text-primary hover:underline"
            >
              Disclaimer
            </Link>
            .
          </p>
          <p>
            We don't accept payment for rankings or review scores. Our
            recommendations come from testing, not from vendor relationships.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
