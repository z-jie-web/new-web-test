import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { generateMetadata as seoMeta } from '@/lib/seo';

export const metadata = seoMeta({
  title: 'Contact Us',
  description:
    'Get in touch with ToolHub — list your tool, report issues, or ask questions.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'Contact' }]} />
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <div className="prose prose-zinc dark:prose-invert max-w-none mb-8">
          <p>
            Have a tool you would like listed on ToolHub? Found incorrect
            information? Want to advertise with us? Reach out and we will get
            back to you.
          </p>
        </div>
        <div className="space-y-6 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[120px]"
              placeholder="Tell us about your tool or question..."
            />
          </div>
          <Button>Send Message</Button>
          <p className="text-xs text-muted-foreground">
            This form is a placeholder. Contact functionality will be wired up
            in a future update.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
