'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { ReviewFrontmatter } from '@/lib/content';

export function SearchBar({ tools }: { tools: ReviewFrontmatter[] }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = query
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.tags.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
      )
    : [];

  return (
    <div ref={ref} className="relative flex max-w-md mx-auto gap-2">
      <Input
        placeholder="Search tools..."
        className="flex-1"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && filtered.length > 0) {
            router.push(`/reviews/${filtered[0].slug}`);
            setOpen(false);
            setQuery('');
          }
        }}
      />
      <button
        onClick={() => {
          if (filtered.length > 0) {
            router.push(`/reviews/${filtered[0].slug}`);
            setOpen(false);
            setQuery('');
          }
        }}
        className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Search className="h-4 w-4 mr-2" /> Search
      </button>
      {open && query && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-md border bg-popover shadow-lg">
          {filtered.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">
              No tools found for &quot;{query}&quot;
            </p>
          ) : (
            filtered.slice(0, 8).map((t) => (
              <button
                key={t.slug}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
                onClick={() => {
                  router.push(`/reviews/${t.slug}`);
                  setOpen(false);
                  setQuery('');
                }}
              >
                <span className="font-medium">{t.name}</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  {t.tags.slice(0, 2).join(', ')}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
