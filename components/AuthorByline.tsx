import Link from "next/link";
import type { AuthorProfile } from "@/lib/authors";

export function AuthorByline({
  author,
  date,
  readingTime,
}: {
  author: AuthorProfile;
  date?: string;
  readingTime?: string | number;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-y border-border/30 my-4">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
        {author.name
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </div>
      <div className="text-sm">
        <div className="font-medium">
          <Link
            href={`/author/${author.slug}`}
            className="text-primary hover:underline"
          >
            {author.name}
          </Link>
        </div>
        <div className="text-muted-foreground text-xs flex flex-wrap gap-x-2 gap-y-0.5">
          <span>{author.title}</span>
          {date && (
            <>
              <span>·</span>
              <time>
                {new Date(date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </>
          )}
          {readingTime && (
            <>
              <span>·</span>
              <span>{readingTime} min read</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
