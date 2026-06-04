'use client';

import { useMemo, useState } from 'react';
import { ReviewCard } from '@/components/ReviewCard';
import type { ReviewFrontmatter } from '@/lib/content';

type Sort = 'name-asc' | 'name-desc' | 'pricing';
type PriceFilter = 'all' | 'Free' | 'Freemium' | 'Paid';

const PRICING_ORDER: Record<string, number> = {
  Free: 0,
  Freemium: 1,
  Paid: 2,
};

export function ReviewGrid({ reviews }: { reviews: ReviewFrontmatter[] }) {
  const [sort, setSort] = useState<Sort>('name-asc');
  const [price, setPrice] = useState<PriceFilter>('all');

  const visible = useMemo(() => {
    let list = reviews;
    if (price !== 'all') list = list.filter((r) => r.pricing === price);
    const sorted = [...list].sort((a, b) => {
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      if (sort === 'name-desc') return b.name.localeCompare(a.name);
      const pa = PRICING_ORDER[a.pricing] ?? 9;
      const pb = PRICING_ORDER[b.pricing] ?? 9;
      return pa - pb || a.name.localeCompare(b.name);
    });
    return sorted;
  }, [reviews, sort, price]);

  const chip = (active: boolean) =>
    `text-xs px-3 py-1.5 rounded-full border transition-colors ${
      active
        ? 'bg-primary text-primary-foreground border-primary'
        : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
    }`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-border/40">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mr-1">
            Pricing
          </span>
          {(['all', 'Free', 'Freemium', 'Paid'] as PriceFilter[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrice(p)}
              className={chip(price === p)}
            >
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Sort
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="text-sm bg-background border border-border rounded-md px-2 py-1.5 hover:border-primary/40 focus:outline-none focus:border-primary"
          >
            <option value="name-asc">A → Z</option>
            <option value="name-desc">Z → A</option>
            <option value="pricing">Free first</option>
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center">
          No tools match these filters.
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-3">
            Showing {visible.length} of {reviews.length}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((r) => (
              <ReviewCard key={r.slug} review={r} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
