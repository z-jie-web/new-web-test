import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import type { ReviewFrontmatter } from '@/lib/content';
import { ToolLogo } from '@/components/ToolLogo';

export function ReviewCard({ review }: { review: ReviewFrontmatter }) {
  return (
    <Card className="h-full flex flex-col hover:border-primary/50 hover:shadow-md transition-all">
      <CardHeader>
        <div className="flex items-start gap-3">
          <ToolLogo slug={review.slug} name={review.name} size={44} />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight truncate">
              <Link
                href={`/reviews/${review.slug}`}
                className="hover:text-primary transition-colors"
              >
                {review.name}
              </Link>
            </CardTitle>
            <div className="mt-1">
              <Badge
                variant={review.pricing === 'Free' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {review.pricing}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {review.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {review.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="mt-auto pt-3 flex gap-2">
          <Button size="sm" variant="default" asChild>
            <Link href={`/reviews/${review.slug}`}>Read Review</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={`/go/${review.slug}`} rel="sponsored noopener">
              Visit <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
