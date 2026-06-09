import { getAllSlugs } from '@/lib/content';
import { getAllCompareSlugsWithContent } from '@/lib/compare';
import { SITE } from '@/lib/constants';
import { fileMtime } from '@/lib/article-meta';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  const reviewPages = getAllSlugs('reviews').map((slug) => ({
    url: `${baseUrl}/reviews/${slug}`,
    lastModified: fileMtime('reviews', slug) ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryPages = getAllSlugs('categories').map((slug) => ({
    url: `${baseUrl}/categories/${slug}`,
    lastModified: fileMtime('categories', slug) ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const blogPages = getAllSlugs('blog').map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: fileMtime('blog', slug) ?? new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const comparePages = getAllCompareSlugsWithContent().map(({ a, b }) => ({
    url: `${baseUrl}/compare/${a}-vs-${b}`,
    lastModified: fileMtime('compare', `${a}-vs-${b}`) ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...reviewPages,
    ...categoryPages,
    ...blogPages,
    ...comparePages,
  ];
}
