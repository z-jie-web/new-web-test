import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

export interface ReviewFrontmatter {
  slug: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  url: string;
  affiliateUrl?: string;
  pricing: 'Free' | 'Freemium' | 'Paid';
  pros: string[];
  cons: string[];
  bestFor: string[];
}

export interface ToolFrontmatter {
  slug: string;
  name: string;
  category: string;
  description: string;
  keywords: string[];
  type: 'browser' | 'api-backed';
}

export interface CategoryFrontmatter {
  slug: string;
  name: string;
  description: string;
}

export interface BlogFrontmatter {
  slug: string;
  title: string;
  description: string;
  date: string;
  category?: string;
  author?: string;
  relatedReviews?: string[];
}

export type ContentType = 'reviews' | 'tools' | 'blog' | 'categories' | 'compare';

function getContentDir(type: ContentType): string {
  return path.join(CONTENT_ROOT, type);
}

export function getAllSlugs(type: ContentType): string[] {
  const dir = getContentDir(type);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace('.mdx', ''));
}

export function getBySlug<T>(
  type: ContentType,
  slug: string
): { frontmatter: T; content: string } | null {
  const filePath = path.join(getContentDir(type), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return { frontmatter: { ...data, slug } as T, content };
}

export function getAll<T>(
  type: ContentType
): { frontmatter: T; content: string }[] {
  const slugs = getAllSlugs(type);
  return slugs
    .map((slug) => getBySlug<T>(type, slug))
    .filter(
      (item): item is { frontmatter: T; content: string } => item !== null
    );
}

export function getByCategory<T extends { category: string }>(
  type: ContentType,
  category: string
): { frontmatter: T; content: string }[] {
  return getAll<T>(type).filter(
    (item) => item.frontmatter.category === category
  );
}
