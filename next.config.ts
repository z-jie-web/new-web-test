import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  redirects: async () => [
    // Fix 7 ghost compare URLs (GSC 404 errors)
    { source: '/compare/play-ht-vs-speechify', destination: '/compare/murf-ai-vs-play-ht', permanent: true },
    { source: '/compare/microsoft-mai-voice-2-vs-speechify', destination: '/compare/elevenlabs-vs-speechify', permanent: true },
    { source: '/compare/murf-ai-vs-speechify', destination: '/compare/murf-ai-vs-play-ht', permanent: true },
    { source: '/compare/fish-audio-vs-play-ht', destination: '/compare/elevenlabs-vs-fish-audio', permanent: true },
    { source: '/compare/pika-2-0-vs-veo-3-1', destination: '/compare/invideo-ai-vs-pika-2-0', permanent: true },
    { source: '/compare/ideogram-vs-stable-diffusion', destination: '/compare/dall-e-3-vs-stable-diffusion', permanent: true },
    { source: '/compare/cliploft-vs-tavus', destination: '/compare/invideo-ai-vs-runway-gen-3', permanent: true },
  ],
};

export default nextConfig;
