import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import type { ReviewFrontmatter } from '@/lib/content';

export function TldrBox({ review }: { review: ReviewFrontmatter }) {
  const topPros = (review.pros ?? []).slice(0, 3);
  const topCons = (review.cons ?? []).slice(0, 2);
  const bestFor = (review.bestFor ?? []).slice(0, 3);

  return (
    <aside className="not-prose mb-8 rounded-xl border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold tracking-widest text-primary">
          TL;DR
        </span>
        <Badge variant="outline">{review.pricing}</Badge>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 text-sm">
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
            What we liked
          </div>
          <ul className="space-y-1">
            {topPros.map((p) => (
              <li key={p} className="flex gap-2 leading-snug">
                <span className="text-green-500 shrink-0">+</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
            Watch out for
          </div>
          <ul className="space-y-1">
            {topCons.map((c) => (
              <li key={c} className="flex gap-2 leading-snug">
                <span className="text-red-500 shrink-0">−</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
            Best for
          </div>
          <ul className="space-y-1">
            {bestFor.map((u) => (
              <li key={u} className="leading-snug">
                {u}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button asChild>
          <a href={`/go/${review.slug}`} rel="sponsored noopener">
            Visit {review.name}
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="#pricing">Jump to pricing</Link>
        </Button>
      </div>
    </aside>
  );
}

export function MobileStickyCta({ review }: { review: ReviewFrontmatter }) {
  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-3">
      <Button asChild className="w-full" size="lg">
        <a href={`/go/${review.slug}`} rel="sponsored noopener">
          Visit {review.name}
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
