import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { generateMetadata as seoMeta } from '@/lib/seo';
import Link from 'next/link';

export const metadata = seoMeta({
  title: 'About ToolHub',
  description:
    'ToolHub helps creators and developers discover the best online tools and AI products.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'About' }]} />
        <h1 className="text-3xl font-bold mb-6">About ToolHub</h1>
        <div className="prose prose-invert max-w-none">
          <p>
            ToolHub is a curated directory of the best online tools, AI
            products, and free utilities. We help creators, developers, and
            marketers find the right tools for their workflow — with honest
            reviews, side-by-side comparisons, and free online tools you can
            use directly in your browser.
          </p>
          <h2>How We Work</h2>
          <p>
            Every tool on ToolHub is researched and reviewed. We focus on
            tools that solve real problems and have genuine user value. Our
            comparison pages help you choose between similar tools at a glance.
          </p>
          <h2>Monetization</h2>
          <p>
            ToolHub is supported by affiliate commissions and advertising.
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
        </div>
      </main>
      <Footer />
    </>
  );
}
