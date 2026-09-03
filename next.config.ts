import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Ghost compare 页止损:V1 自动路由时代的 URL 在 V2 无对应文件,301 到最近页面
  async redirects() {
    return [
      {
        source: '/compare/google-gemini-vs-notebooklm',
        destination: '/reviews/google-gemini',
        permanent: true,
      },
      {
        source: '/compare/invideo-ai-vs-veo-3-1',
        destination: '/reviews/invideo-ai',
        permanent: true,
      },
      {
        source: '/compare/google-gemini-omni-vs-kling-ai',
        destination: '/reviews/google-gemini-omni',
        permanent: true,
      },
      {
        source: '/compare/copy-ai-vs-quillbot',
        destination: '/reviews/copy-ai',
        permanent: true,
      },
      {
        source: '/compare/fathom-vs-veed',
        destination: '/reviews/fathom',
        permanent: true,
      },
      {
        source: '/compare/microsoft-mai-voice-2-vs-speechify',
        destination: '/reviews/speechify',
        permanent: true,
      },
      {
        source: '/compare/pika-2-0-vs-veo-3-1',
        destination: '/reviews/pika-2-0',
        permanent: true,
      },
      {
        source: '/compare/ideogram-vs-stable-diffusion',
        destination: '/reviews/ideogram',
        permanent: true,
      },
      {
        source: '/compare/cliploft-vs-tavus',
        destination: '/reviews/tavus',
        permanent: true,
      },
      {
        source: '/imagine',
        destination: '/reviews',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
