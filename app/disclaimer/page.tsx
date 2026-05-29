import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { generateMetadata as seoMeta } from '@/lib/seo';

export const metadata = seoMeta({
  title: 'Disclaimer',
  description: 'Affiliate disclosure and content disclaimer for ToolHub.',
  path: '/disclaimer',
});

export default function DisclaimerPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'Disclaimer' }]} />
        <h1 className="text-3xl font-bold mb-6">Disclaimer</h1>
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <h2>Affiliate Disclosure</h2>
          <p>
            Some links on ToolHub are affiliate links. This means we may earn a
            commission at no additional cost to you if you click through and
            make a purchase or sign up for a service. We only recommend tools
            we believe provide genuine value.
          </p>
          <h2>Content Accuracy</h2>
          <p>
            We strive to keep all tool information accurate and up-to-date.
            However, pricing, features, and availability change frequently.
            Always verify details on the official website before making decisions.
          </p>
          <h2>No Endorsement</h2>
          <p>
            Listing a tool on ToolHub does not constitute an endorsement. Our
            reviews represent our opinions based on available information at the
            time of writing.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
