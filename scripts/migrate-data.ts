import fs from 'fs';
import path from 'path';

const tools = [
  {
    id: 'sora',
    name: 'Sora',
    category: 'video-generation',
    description:
      "Sora is OpenAI's headline text-to-video model, built for cinematic motion, realistic scene continuity, and premium concept storytelling for brands, filmmakers, and creators exploring high-end AI video production workflows.",
    tags: ['Text-to-Video', 'Cinematic Output'],
    url: 'https://openai.com/sora',
  },
  {
    id: 'runway-gen-3',
    name: 'Runway Gen-3',
    category: 'video-generation',
    description:
      'Runway Gen-3 helps creators and marketing teams generate stylized videos, control motion, and accelerate commercial content production with a polished AI video workflow designed for fast experimentation and campaign-ready output.',
    tags: ['Creative Studio', 'Motion Control'],
    url: 'https://runwayml.com/',
  },
  {
    id: 'pika-2-0',
    name: 'Pika 2.0',
    category: 'video-generation',
    description:
      'Pika 2.0 focuses on fast, social-friendly AI video creation, making it attractive for creators, startups, and brands that want prompt-based clips, dynamic visuals, and lightweight production speed without heavy editing complexity.',
    tags: ['Short-Form Video', 'Fast Rendering'],
    url: 'https://pika.art/',
  },
  {
    id: 'luma-dream-machine',
    name: 'Luma Dream Machine',
    category: 'video-generation',
    description:
      'Luma Dream Machine is a fast-rising AI video generator known for fluid motion, vivid visuals, and fast concept iteration, making it useful for creative testing, storytelling, and rapid ad prototype generation.',
    tags: ['Prompt Video', 'Rapid Concepts'],
    url: 'https://lumalabs.ai/dream-machine',
  },
  {
    id: 'kling-ai',
    name: 'Kling AI',
    category: 'video-generation',
    description:
      'Kling AI has become a widely discussed AI video generator for realistic motion, prompt-based scene building, and visually ambitious outputs that appeal to creators, advertisers, and global audiences comparing next-wave video models.',
    tags: ['Realistic Motion', 'Trending Model'],
    url: 'https://klingai.com/',
  },
  {
    id: 'haiper',
    name: 'Haiper',
    category: 'video-generation',
    description:
      'Haiper offers accessible AI video generation focused on speed, stylized output, and approachable creative workflows, making it attractive for social media teams, indie creators, and marketers testing fast-moving visual campaigns.',
    tags: ['Fast Creation', 'Creator Friendly'],
    url: 'https://haiper.ai/',
  },
  {
    id: 'pixverse',
    name: 'PixVerse',
    category: 'video-generation',
    description:
      'PixVerse is a popular AI video generator for prompt-based animation, eye-catching short clips, and visually expressive content, helping creators produce trend-driven assets for social platforms and experimental branded storytelling.',
    tags: ['Animated Clips', 'Social Media'],
    url: 'https://pixverse.ai/',
  },
  {
    id: 'invideo-ai',
    name: 'InVideo AI',
    category: 'video-generation',
    description:
      'InVideo AI turns prompts into complete videos with scripts, visuals, and voice layers, making it especially useful for marketers, publishers, and business users who want fast production without advanced editing skills.',
    tags: ['Script to Video', 'Marketing'],
    url: 'https://invideo.io/ai/',
  },
  {
    id: 'synthesia',
    name: 'Synthesia',
    category: 'ai-avatars',
    description:
      'Synthesia is one of the best-known AI avatar video platforms for training, onboarding, explainers, and multilingual presentation content, helping companies scale professional communication without studio production costs.',
    tags: ['AI Avatars', 'Business Video'],
    url: 'https://www.synthesia.io/',
  },
  {
    id: 'heygen',
    name: 'HeyGen',
    category: 'ai-avatars',
    description:
      'HeyGen is widely used for AI avatar videos, face-driven localization, and multilingual spokesperson content, helping global brands, educators, and e-commerce teams produce scalable communication without traditional filming overhead.',
    tags: ['AI Avatars', 'Localization'],
    url: 'https://www.heygen.com/',
  },
  {
    id: 'deepbrain-ai',
    name: 'DeepBrain AI',
    category: 'ai-avatars',
    description:
      'DeepBrain AI specializes in avatar presenters, face-based business videos, and multilingual training content, making it a practical solution for enterprises that need professional AI video delivery across markets and internal communication workflows.',
    tags: ['Presenter Videos', 'Enterprise'],
    url: 'https://www.deepbrain.io/',
  },
  {
    id: 'hour-one',
    name: 'Hour One',
    category: 'ai-avatars',
    description:
      'Hour One focuses on virtual presenters and AI avatar content for corporate communication, learning, and sales enablement, giving teams a streamlined way to create human-facing videos at scale.',
    tags: ['Virtual Presenters', 'Training'],
    url: 'https://hourone.ai/',
  },
  {
    id: 'elai',
    name: 'Elai.io',
    category: 'ai-avatars',
    description:
      'Elai.io helps businesses create avatar-led videos for product explainers, internal education, and multilingual presentations, making it relevant for teams that need clear communication without recurring filming effort.',
    tags: ['Avatar Content', 'Explainers'],
    url: 'https://elai.io/',
  },
  {
    id: 'colossyan',
    name: 'Colossyan',
    category: 'ai-avatars',
    description:
      'Colossyan provides AI presenter video tools for workplace learning, internal communication, and educational content, helping organizations publish more training material with faster turnaround and lower production friction.',
    tags: ['Learning Content', 'Workplace Video'],
    url: 'https://www.colossyan.com/',
  },
  {
    id: 'd-id',
    name: 'D-ID',
    category: 'ai-avatars',
    description:
      'D-ID enables talking avatars and face-animated videos from still images, making it useful for personalized outreach, lightweight digital presenters, and experimental branded communication formats.',
    tags: ['Talking Avatar', 'Personalization'],
    url: 'https://www.d-id.com/',
  },
  {
    id: 'captions',
    name: 'Captions',
    category: 'ai-subtitles',
    description:
      'Captions combines automatic subtitles, creator-focused editing, dubbing, and talking-head enhancement features, making it especially relevant for short-form video teams that care about retention and fast publishing.',
    tags: ['Auto Captions', 'Short-Form'],
    url: 'https://www.captions.ai/',
  },
  {
    id: 'capcut-international',
    name: 'CapCut International',
    category: 'ai-subtitles',
    description:
      'CapCut International combines creator-friendly editing, auto captions, subtitle styling, and short-form publishing tools, making it one of the most searched AI-assisted video editors for global social media growth.',
    tags: ['Auto Captions', 'Social Editing'],
    url: 'https://www.capcut.com/',
  },
  {
    id: 'autosubtitle-io',
    name: 'AutoSubtitle.io',
    category: 'ai-subtitles',
    description:
      'AutoSubtitle.io helps creators generate subtitles quickly for marketing videos, tutorials, and international content, offering a lightweight workflow for improving accessibility, retention, and multilingual reach across platforms.',
    tags: ['Subtitle Generator', 'Accessibility'],
    url: 'https://autosubtitle.io/',
  },
  {
    id: 'veed',
    name: 'VEED',
    category: 'ai-subtitles',
    description:
      'VEED offers browser-based editing with subtitle generation, caption styling, and social publishing support, making it a practical choice for creators and small teams producing fast-moving content across global channels.',
    tags: ['Web Editor', 'Caption Workflow'],
    url: 'https://www.veed.io/',
  },
  {
    id: 'descript',
    name: 'Descript',
    category: 'ai-subtitles',
    description:
      'Descript blends transcript-based editing, subtitle workflows, screen recording, and voice tools into one creator-friendly platform, making it a strong fit for tutorials, podcasts, webinars, and repurposed video content.',
    tags: ['Transcript Editing', 'Content Repurposing'],
    url: 'https://www.descript.com/',
  },
  {
    id: 'subtitlebee',
    name: 'SubtitleBee',
    category: 'ai-subtitles',
    description:
      'SubtitleBee focuses on automatic subtitles, translation support, and social-ready caption styling, helping creators and brands improve accessibility while making short-form video content easier to consume globally.',
    tags: ['Subtitle Styling', 'Translation'],
    url: 'https://subtitlebee.com/',
  },
  {
    id: 'kapwing',
    name: 'Kapwing',
    category: 'ai-subtitles',
    description:
      'Kapwing includes AI subtitle tools, online editing, resizing, and content repurposing features, making it useful for distributed teams that need a collaborative browser workflow for social and marketing video assets.',
    tags: ['Online Editor', 'Team Workflow'],
    url: 'https://www.kapwing.com/',
  },
  {
    id: 'happy-scribe',
    name: 'Happy Scribe',
    category: 'ai-subtitles',
    description:
      'Happy Scribe is a trusted transcription and subtitling platform for creators, educators, and media teams who need reliable caption generation, translation support, and accessible video distribution across markets.',
    tags: ['Transcription', 'Translation'],
    url: 'https://www.happyscribe.com/',
  },
  {
    id: 'wisecut',
    name: 'Wisecut',
    category: 'ai-subtitles',
    description:
      'Wisecut streamlines subtitle creation, silence trimming, and talking-head editing, helping creators convert raw recordings into cleaner, more watchable social and educational videos with less manual post-production.',
    tags: ['Talking Head', 'Auto Editing'],
    url: 'https://www.wisecut.video/',
  },
  {
    id: 'topaz-video-ai',
    name: 'Topaz Video AI',
    category: 'video-enhancer',
    description:
      'Topaz Video AI is a premium enhancement tool for upscaling, denoising, sharpening, and frame interpolation, often chosen by editors who need cleaner footage, better resolution, and stronger final delivery quality.',
    tags: ['Upscaling', 'Denoise'],
    url: 'https://www.topazlabs.com/topaz-video-ai',
  },
  {
    id: 'remini-video',
    name: 'Remini Video',
    category: 'video-enhancer',
    description:
      'Remini Video focuses on restoring clarity, facial detail, and perceived sharpness in lower-quality clips, making it appealing for mobile creators, repurposed archives, and fast enhancement use cases tied to social publishing.',
    tags: ['Video Restore', 'Mobile Workflow'],
    url: 'https://remini.ai/',
  },
  {
    id: 'hitpaw-video-enhancer',
    name: 'HitPaw Video Enhancer',
    category: 'video-enhancer',
    description:
      'HitPaw Video Enhancer helps users upscale low-resolution clips, reduce blur, and improve visual sharpness, making it attractive for creators, ecommerce sellers, and editors refreshing imperfect footage quickly.',
    tags: ['Upscale', 'Sharpness'],
    url: 'https://www.hitpaw.com/video-enhancer.html',
  },
  {
    id: 'avclabs-video-enhancer-ai',
    name: 'AVCLabs Video Enhancer AI',
    category: 'video-enhancer',
    description:
      'AVCLabs Video Enhancer AI focuses on upscaling, face refinement, denoising, and color improvement, helping video editors and content teams upgrade source material for cleaner playback and more polished distribution.',
    tags: ['Face Refinement', 'Resolution Upgrade'],
    url: 'https://www.avclabs.com/video-enhancer-ai.html',
  },
  {
    id: 'vmake-ai-video-enhancer',
    name: 'Vmake AI Video Enhancer',
    category: 'video-enhancer',
    description:
      'Vmake AI Video Enhancer is designed for ecommerce and social media teams that need to sharpen product videos, improve clarity, and produce stronger-looking visual assets with lightweight enhancement workflows.',
    tags: ['Ecommerce Video', 'Product Content'],
    url: 'https://vmake.ai/video-enhancer',
  },
  {
    id: 'airbrush-video-enhancer',
    name: 'AirBrush Video Enhancer',
    category: 'video-enhancer',
    description:
      'AirBrush Video Enhancer offers easy visual cleanup, clarity improvement, and quick enhancement for social-ready clips, making it appealing to casual creators and fast-moving teams optimizing content for polished presentation.',
    tags: ['Quick Cleanup', 'Social Ready'],
    url: 'https://airbrush.com/video-enhancer',
  },
];

const REVIEWS_DIR = path.join(__dirname, '../content/reviews');
if (!fs.existsSync(REVIEWS_DIR)) fs.mkdirSync(REVIEWS_DIR, { recursive: true });

for (const tool of tools) {
  const content = `---
slug: "${tool.id}"
name: "${tool.name}"
category: "${tool.category}"
description: "${tool.description.replace(/"/g, '\\"')}"
tags: [${tool.tags.map((t) => `"${t}"`).join(', ')}]
url: "${tool.url}"
pricing: "Paid"
pros: []
cons: []
bestFor: []
lastUpdated: "${new Date().toISOString()}"
---

# ${tool.name} Review

${tool.description}

## Key Features

${tool.tags.map((t) => `- **${t}**`).join('\n')}

## Our Take

Coming soon — detailed review and analysis.

## Pricing

Visit the official website for current pricing.

[Visit ${tool.name}](${tool.url})
`;

  fs.writeFileSync(path.join(REVIEWS_DIR, `${tool.id}.mdx`), content);
  console.log(`Created: ${tool.id}.mdx`);
}

// Create category MDX files
const CATEGORIES_DIR = path.join(__dirname, '../content/categories');
if (!fs.existsSync(CATEGORIES_DIR))
  fs.mkdirSync(CATEGORIES_DIR, { recursive: true });

const categories = [
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
];

for (const cat of categories) {
  const content = `---
slug: "${cat.slug}"
name: "${cat.name}"
description: "${cat.description}"
---

# ${cat.name}

${cat.description}

Browse all tools in this category below.
`;

  fs.writeFileSync(path.join(CATEGORIES_DIR, `${cat.slug}.mdx`), content);
  console.log(`Created category: ${cat.slug}.mdx`);
}

console.log('\nMigration complete!');
