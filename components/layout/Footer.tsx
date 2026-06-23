import Link from 'next/link';
import { SITE } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-border/20 mt-20">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.producthunt.com/products/toolporto-honest-ai-tool-reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#DA552F] hover:underline transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="shrink-0"
              >
                <path d="M13.604 8.4h-3.405V12h3.405c.995 0 1.801-.806 1.801-1.801 0-.995-.806-1.801-1.801-1.801v.001ZM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0Zm1.604 14.4h-3.405V18H7.801V6h5.804c2.319 0 4.2 1.88 4.2 4.199 0 2.321-1.881 4.201-4.201 4.201Z" />
              </svg>
              Featured on Product Hunt
            </a>
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
      </div>
    </footer>
  );
}
