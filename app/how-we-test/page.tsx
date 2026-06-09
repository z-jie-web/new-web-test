import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';

export const metadata = seoMeta({
  title: 'How We Test AI Tools — Our Review Methodology',
  description:
    'Every tool on ToolPorto is hands-on tested. Learn about our evaluation criteria, testing process, and commitment to honest reviews.',
  path: '/how-we-test',
});

export default function HowWeTestPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'How We Test AI Tools',
          description:
            'Our hands-on testing methodology for reviewing AI tools — evaluation criteria, testing process, and transparency commitment.',
        }}
      />
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'How We Test' }]} />
        <h1 className="text-3xl font-bold mb-6">How We Test AI Tools</h1>
        <div className="prose prose-invert max-w-none">
          <p>
            Every tool on ToolPorto goes through hands-on testing. We don't
            rewrite press releases. We sign up, run real tasks, and form
            opinions based on actual use — not marketing claims.
          </p>

          <h2>Our Testing Process</h2>
          <ol>
            <li>
              <strong>Sign up and onboard.</strong> We go through the same
              signup flow as a real user. If onboarding is confusing, we note
              it.
            </li>
            <li>
              <strong>Run real-world tasks.</strong> We test each tool against
              the use cases it claims to solve. For a video generator, that
              means generating actual video clips. For a voice tool, that means
              synthesizing speech with different voices and languages.
            </li>
            <li>
              <strong>Compare against alternatives.</strong> We test competing
              tools side-by-side on the same tasks so our comparisons are based
              on shared benchmarks, not isolated impressions.
            </li>
            <li>
              <strong>Check pricing honestly.</strong> We verify pricing pages,
              hidden fees, and free tier limitations. If a "free" tool requires
              a credit card, we mention it.
            </li>
            <li>
              <strong>Update regularly.</strong> Tools change fast. We re-test
              major tools every 6 months or when significant updates ship.
            </li>
          </ol>

          <h2>What We Evaluate</h2>
          <ul>
            <li><strong>Output quality</strong> — How good are the results?</li>
            <li><strong>Ease of use</strong> — Can a beginner get results in 5 minutes?</li>
            <li><strong>Feature depth</strong> — Does it do one thing well, or many things?</li>
            <li><strong>Pricing fairness</strong> — Is the value proportional to the cost?</li>
            <li><strong>Reliability</strong> — Does it crash? Are generations consistent?</li>
            <li><strong>Support and docs</strong> — Can you find help when stuck?</li>
          </ul>

          <h2>Why Trust Our Reviews</h2>
          <p>
            We are not a marketplace. We don't accept payment for rankings or
            review scores. Our recommendations come from testing, not from
            vendor relationships.
          </p>
          <p>
            Some links on this site are affiliate links — and we disclose this
            on every page. Affiliate commissions never influence our verdict.
            If a tool is mediocre, we say so regardless of whether it has an
            affiliate program.
          </p>
          <p>
            Our team has been building and evaluating software tools for years.
            We know what a good tool looks like because we've used hundreds of
            them.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
