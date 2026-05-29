export const SITE = {
  name: 'ToolHub',
  tagline: 'Discover the best online tools and AI products',
  description:
    'Curated directory of the best online tools, AI products, and free utilities. Compare, review, and find the right tool for your workflow.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://toolporto.com',
  locale: 'en_US',
};

export const CATEGORIES = [
  {
    slug: 'video-generation',
    name: 'AI Video Generation',
    description:
      'AI-powered video creation tools for cinematic content, ads, and social media.',
  },
  {
    slug: 'ai-avatars',
    name: 'AI Avatars',
    description:
      'Create professional AI avatar videos for training, marketing, and communication.',
  },
  {
    slug: 'ai-subtitles',
    name: 'AI Subtitles & Captions',
    description:
      'Auto-generate subtitles, captions, and transcriptions for your videos.',
  },
  {
    slug: 'face-swap',
    name: 'Face Swap Tools',
    description: 'AI face swap tools for creative video content.',
  },
] as const;
