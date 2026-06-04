'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/toc';

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((i) => document.getElementById(i.slug))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 3) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="not-prose rounded-xl border bg-card p-4 mb-8 lg:hidden"
    >
      <div className="text-xs font-bold tracking-widest text-primary mb-3">
        ON THIS PAGE
      </div>
      <ol className="space-y-1.5 text-sm">
        {items.map((item) => (
          <li
            key={item.slug}
            className={item.depth === 3 ? 'pl-4' : ''}
          >
            <a
              href={`#${item.slug}`}
              className={`block py-1 transition-colors leading-snug ${
                active === item.slug
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function StickyToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((i) => document.getElementById(i.slug))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 3) return null;

  return (
    <aside className="hidden lg:block sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pl-6 border-l border-border/40">
      <div className="text-xs font-bold tracking-widest text-primary mb-3">
        ON THIS PAGE
      </div>
      <ol className="space-y-1.5 text-sm">
        {items.map((item) => (
          <li
            key={item.slug}
            className={item.depth === 3 ? 'pl-3' : ''}
          >
            <a
              href={`#${item.slug}`}
              className={`block py-1 transition-colors leading-snug ${
                active === item.slug
                  ? 'text-primary font-medium border-l-2 -ml-[1.5rem] pl-5 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
