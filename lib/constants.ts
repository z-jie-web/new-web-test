export const SITE = {
  name: 'ToolPorto',
  tagline: 'Discover the best online tools and AI products',
  description:
    'Curated directory of the best online tools, AI products, and free utilities. Compare, review, and find the right tool for your workflow.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://toolporto.com',
  locale: 'en_US',
};

export const CATEGORIES = [
  {
    slug: 'video-generation',
    name: 'AI Video',
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
    name: 'AI Subtitles',
    description:
      'Auto-generate subtitles, captions, and transcriptions for your videos.',
  },
  {
    slug: 'face-swap',
    name: 'AI Face Swap',
    description: 'AI face swap tools for creative video content.',
  },
  {
    slug: 'ai-image',
    name: 'AI Image',
    description:
      'AI-powered image and art creation tools — Midjourney, DALL-E, Stable Diffusion, and more.',
  },
  {
    slug: 'ai-voice',
    name: 'AI Voice',
    description:
      'AI voice generation, text-to-speech, voice cloning, and audio creation tools.',
  },
] as const;
