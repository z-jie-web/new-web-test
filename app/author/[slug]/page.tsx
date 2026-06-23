import { notFound } from "next/navigation";
import { getAuthor, getAllAuthors } from "@/lib/authors";
import { getAll, type BlogFrontmatter, type ReviewFrontmatter } from "@/lib/content";
import { getAllCompareSlugsWithContent, getAllComparePairsWithContent } from "@/lib/compare";
import { generateMetadata as seoMeta } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ReviewCard } from "@/components/ReviewCard";
import { JsonLd } from "@/components/JsonLd";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/constants";
import Link from "next/link";

export async function generateStaticParams() {
  return getAllAuthors().map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) return { title: "Not Found" };

  return seoMeta({
    title: `${author.name} — AI Tools Reviewer at ${SITE.name}`,
    description: `${author.name} is ${author.title.toLowerCase()}. ${author.bio}`.slice(0, 158),
    path: `/author/${slug}`,
  });
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();

  // Find all blog posts by this author
  const allBlogs = getAll<BlogFrontmatter>("blog");
  const authorBlogs = allBlogs.filter((b) => {
    const authorField = b.frontmatter.author || "";
    return (
      authorField === author.name ||
      authorField === author.slug ||
      authorField === slug
    );
  });

  // Find all reviews by this author (via category→author mapping or explicit author field)
  const allReviews = getAll<ReviewFrontmatter>("reviews");
  const authorReviews = allReviews.filter((r) => {
    const reviewAuthor = (r.frontmatter as any).author || "";
    if (reviewAuthor === author.name || reviewAuthor === author.slug) return true;
    // Also match by category if author's expertise covers that category
    return author.expertise.some(
      (e) => e.toLowerCase().includes(r.frontmatter.category.replace(/-/g, " "))
    );
  });

  const authorUrl = `${SITE.url}/author/${author.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.title,
    description: author.bio,
    url: authorUrl,
    ...(author.social?.linkedin ? { sameAs: [author.social.linkedin] } : {}),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs items={[{ label: author.name }]} />

        {/* Author header */}
        <section className="mb-10">
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              {author.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{author.name}</h1>
              <p className="text-muted-foreground mt-1">{author.title}</p>
              <p className="text-sm text-muted-foreground mt-3 max-w-xl">
                {author.bio}
              </p>
              {author.social?.linkedin && (
                <a
                  href={author.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-primary hover:underline"
                >
                  LinkedIn →
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {author.expertise.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </section>

        {/* Articles by this author */}
        {authorBlogs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">
              Articles by {author.name} ({authorBlogs.length})
            </h2>
            <div className="space-y-3">
              {authorBlogs
                .sort(
                  (a, b) =>
                    (b.frontmatter.date || "").localeCompare(
                      a.frontmatter.date || ""
                    )
                )
                .map((blog) => (
                  <Link
                    key={blog.frontmatter.slug}
                    href={`/blog/${blog.frontmatter.slug}`}
                    className="block rounded-lg border p-4 hover:border-primary/50 hover:bg-accent/30 transition-all"
                  >
                    <div className="text-sm text-muted-foreground mb-1">
                      {blog.frontmatter.date &&
                        new Date(blog.frontmatter.date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                    </div>
                    <h3 className="font-semibold">{blog.frontmatter.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {blog.frontmatter.description}
                    </p>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {/* Tools reviewed by this author */}
        {authorReviews.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">
              Tools Reviewed by {author.name} ({authorReviews.length})
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {authorReviews.map((review) => (
                <ReviewCard
                  key={review.frontmatter.slug}
                  review={review.frontmatter}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
