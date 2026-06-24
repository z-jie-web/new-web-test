import Link from 'next/link';
import { SITE } from '@/lib/constants';

const FEATURED_ON = [
  {
    name: 'Product Hunt',
    url: 'https://www.producthunt.com/products/toolporto-honest-ai-tool-reviews',
    color: '#DA552F',
  },
  // Add more as they get approved:
  // { name: 'Future Tools', url: 'https://www.futuretools.io/tools/toolporto', color: '#...' },
  // { name: 'Toolify', url: 'https://toolify.ai/tool/toolporto', color: '#...' },
];

export function Footer() {
  return (
    <footer className="border-t border-border/20 mt-20">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Featured on */}
        {FEATURED_ON.length > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4 text-xs text-muted-foreground">
            <span>As featured on</span>
            {FEATURED_ON.map((site) => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline transition-colors"
                style={{ color: site.color }}
              >
                {site.name}
              </a>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/disclaimer"
              className="hover:text-foreground transition-colors"
            >
              Disclaimer
            </Link>
            <Link
              href="/about"
              className="hover:text-foreground transition-colors"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
