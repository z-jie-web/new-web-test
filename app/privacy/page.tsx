import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { generateMetadata as seoMeta } from '@/lib/seo';

export const metadata = seoMeta({
  title: 'Privacy Policy',
  description: 'Privacy Policy for ToolHub — how we handle your data.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p><strong>Last updated:</strong> May 28, 2026</p>
          <h2>1. Information We Collect</h2>
          <p>
            ToolHub does not require user accounts or collect personal information.
            We use Umami analytics (self-hosted) to understand site usage. Umami
            is privacy-focused and does not use cookies or collect personal data.
          </p>
          <h2>2. Cookies</h2>
          <p>
            ToolHub does not set any cookies for tracking purposes. Third-party
            services (embedded tools, affiliate links) may set their own cookies
            — please refer to their respective privacy policies.
          </p>
          <h2>3. Third-Party Links</h2>
          <p>
            Our site contains links to external websites and tools. We are not
            responsible for the privacy practices of these third parties.
          </p>
          <h2>4. Contact</h2>
          <p>
            For questions about this policy, visit our{' '}
            <a href="/contact" className="text-primary hover:underline">
              Contact page
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
