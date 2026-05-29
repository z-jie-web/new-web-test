import Link from 'next/link';
import { SITE } from '@/lib/constants';

export function Header() {
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
          <Link
            href="/categories/video-generation"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            AI Video
          </Link>
          <Link
            href="/categories/ai-avatars"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            AI Avatars
          </Link>
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}
