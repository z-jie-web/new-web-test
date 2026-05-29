import { SITE } from './constants';

export function generateMetadata({
  title,
  description,
  path,
  ogImage,
  type = 'website',
}: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  type?: 'website' | 'article';
}) {
  const url = `${SITE.url}${path}`;
  return {
    title: `${title} | ${SITE.name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      title: `${title} | ${SITE.name}`,
      description,
      url,
      siteName: SITE.name,
      images: ogImage ? [{ url: ogImage }] : [],
      locale: SITE.locale,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${title} | ${SITE.name}`,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}
