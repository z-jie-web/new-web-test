'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE, CATEGORIES } from '@/lib/constants';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm">
            TH
          </span>
          {SITE.name}
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {CATEGORIES.map((cat) => {
            const href = `/categories/${cat.slug}`;
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={cat.slug}
                href={href}
                className={`transition-colors ${
                  isActive
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
          <Link
            href="/blog"
            className={`transition-colors ${
              pathname.startsWith('/blog')
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}
