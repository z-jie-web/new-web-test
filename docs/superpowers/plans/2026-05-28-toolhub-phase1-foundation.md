# ToolHub Phase 1 - Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold Next.js 14 project with App Router, Tailwind, shadcn/ui, MDX pipeline, and migrate 30 existing tools from data.js to MDX.

**Architecture:** Next.js App Router with file-based MDX content. Dynamic routes for `/reviews/[slug]`, `/categories/[slug]`, `/tools/[slug]`, `/compare/[a]-vs-[b]`, `/blog/[slug]`. Content at `/content/` directory. Static generation with `generateStaticParams`.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, MDX (next-mdx-remote), Vercel

---

## File Structure (after Phase 1)

```
/Users/zhangjie/project/npm/new-web-test/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── llms.txt/
│   │   └── route.ts
│   ├── tools/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── reviews/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── compare/
│   │   └── [a]-vs-[b]/
│   │       └── page.tsx
│   ├── categories/
│   │   └── [slug]/
│   │       └── page.tsx
│   └── blog/
│       └── [slug]/
│           └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── ui/                         (shadcn components)
│   ├── ReviewCard.tsx
│   ├── ToolGrid.tsx
│   ├── Breadcrumbs.tsx
│   └── JsonLd.tsx
├── content/
│   ├── reviews/                    (30 MDX files)
│   ├── tools/                      (free tools, initially empty or few)
│   ├── blog/                       (initially empty)
│   └── categories/                 (5-6 MDX files)
├── lib/
│   ├── content.ts
│   ├── compare.ts
│   ├── seo.ts
│   └── constants.ts
├── scripts/
│   └── migrate-data.ts             (one-time data.js → MDX script)
├── public/
│   └── og-default.png
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── components.json                 (shadcn config)
```

---

### Task 1: Create Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

Run: `cd /Users/zhangjie/project/npm/new-web-test && npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-turbopack`

When prompted, choose:
- Would you like to use `src/` directory? → No
- Would you like to customize the default import alias? → No (use @/*)

Wait for `npm install` to complete. If it asks to overwrite existing files, answer "no" to files we want to keep but "yes" to config files.

- [ ] **Step 2: Verify the project runs**

Run: `npm run dev`

Expected: Dev server starts on http://localhost:3000, showing the default Next.js page.

Stop the dev server (Ctrl+C).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: scaffold next.js 14 project with tailwind"
```

---

### Task 2: Install dependencies and configure shadcn/ui

**Files:**
- Create: `components.json`
- Modify: `app/globals.css`, `tailwind.config.ts`

- [ ] **Step 1: Initialize shadcn/ui**

Run:
```bash
cd /Users/zhangjie/project/npm/new-web-test
npx shadcn@latest init
```

When prompted:
- Style: → New York
- Base color: → Zinc
- CSS variables: → Yes

- [ ] **Step 2: Install required shadcn components**

Run: `npx shadcn@latest add button card badge separator breadcrumb input dialog`

- [ ] **Step 3: Install additional deps**

Run: `npm install next-mdx-remote gray-matter reading-time date-fns lucide-react`

Run: `npm install -D @types/node`

- [ ] **Step 4: Configure MDX support in next.config.mjs**

Read `next.config.mjs`, then replace with:

```mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 5: Verify MDX rendering works**

Create a test MDX file at `content/reviews/test.mdx`:
```yaml
---
slug: "test-tool"
name: "Test Tool"
category: "video-generation"
description: "A test tool for verification"
tags: ["Test"]
url: "https://example.com"
pricing: "Free"
pros: ["Fast"]
cons: ["Limited"]
bestFor: ["Testing"]
---
# Test Tool

This is a test review.
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add shadcn/ui, mdx deps, and test content"
```

---

### Task 3: Create content loading library

**Files:**
- Create: `lib/content.ts`
- Create: `lib/constants.ts`
- Create: `lib/compare.ts`
- Create: `lib/seo.ts`

- [ ] **Step 1: Create lib/constants.ts with site config and category definitions**

```typescript
export const SITE = {
  name: 'ToolHub',
  tagline: 'Discover the best online tools and AI products',
  description: 'Curated directory of the best online tools, AI products, and free utilities. Compare, review, and find the right tool for your workflow.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://toolhub.dev',
  locale: 'en_US',
};

export const CATEGORIES = [
  {
    slug: 'video-generation',
    name: 'AI Video Generation',
    description: 'AI-powered video creation tools for cinematic content, ads, and social media.',
  },
  {
    slug: 'ai-avatars',
    name: 'AI Avatars',
    description: 'Create professional AI avatar videos for training, marketing, and communication.',
  },
  {
    slug: 'ai-subtitles',
    name: 'AI Subtitles & Captions',
    description: 'Auto-generate subtitles, captions, and transcriptions for your videos.',
  },
  {
    slug: 'video-enhancer',
    name: 'Video Enhancers',
    description: 'Upscale, sharpen, and improve video quality with AI enhancement tools.',
  },
  {
    slug: 'face-swap',
    name: 'Face Swap Tools',
    description: 'AI face swap tools for creative video content.',
  },
] as const;
```

- [ ] **Step 2: Create lib/content.ts — MDX loading utilities**

```typescript
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
}

type ContentType = 'reviews' | 'tools' | 'blog' | 'categories';

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

export function getBySlug<T>(type: ContentType, slug: string): { frontmatter: T; content: string } | null {
  const filePath = path.join(getContentDir(type), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return { frontmatter: { ...data, slug } as T, content };
}

export function getAll<T>(type: ContentType): { frontmatter: T; content: string }[] {
  const slugs = getAllSlugs(type);
  return slugs
    .map((slug) => getBySlug<T>(type, slug))
    .filter((item): item is { frontmatter: T; content: string } => item !== null);
}

export function getByCategory<T extends { category: string }>(type: ContentType, category: string): { frontmatter: T; content: string }[] {
  return getAll<T>(type).filter((item) => item.frontmatter.category === category);
}
```

- [ ] **Step 3: Create lib/compare.ts — comparison page data generator**

```typescript
import { getAll, ReviewFrontmatter } from './content';

export interface ComparePair {
  a: ReviewFrontmatter;
  b: ReviewFrontmatter;
  slugA: string;
  slugB: string;
}

export function getAllComparePairs(): ComparePair[] {
  const reviews = getAll<ReviewFrontmatter>('reviews');
  const pairs: ComparePair[] = [];

  for (let i = 0; i < reviews.length; i++) {
    for (let j = i + 1; j < reviews.length; j++) {
      const a = reviews[i].frontmatter;
      const b = reviews[j].frontmatter;
      // Only compare tools in the same category
      if (a.category === b.category) {
        pairs.push({
          a,
          b,
          slugA: a.slug,
          slugB: b.slug,
        });
      }
    }
  }

  return pairs;
}

export function getAllCompareSlugs(): { a: string; b: string }[] {
  return getAllComparePairs().map((pair) => ({
    a: pair.slugA,
    b: pair.slugB,
  }));
}

export function getComparePair(slugA: string, slugB: string): ComparePair | null {
  return (
    getAllComparePairs().find(
      (p) =>
        (p.slugA === slugA && p.slugB === slugB) ||
        (p.slugA === slugB && p.slugB === slugA)
    ) || null
  );
}
```

- [ ] **Step 4: Create lib/seo.ts — SEO helpers**

```typescript
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
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add content loading library, compare logic, and SEO helpers"
```

---

### Task 4: Create shared layout components

**Files:**
- Create: `components/layout/Header.tsx`
- Create: `components/layout/Footer.tsx`
- Create: `components/Breadcrumbs.tsx`
- Create: `components/ReviewCard.tsx`
- Create: `components/JsonLd.tsx`

- [ ] **Step 1: Create Header component**

```tsx
// components/layout/Header.tsx
import Link from 'next/link';
import { SITE, CATEGORIES } from '@/lib/constants';

export function Header() {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm">
            TH
          </span>
          {SITE.name}
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/categories/video-generation" className="text-muted-foreground hover:text-foreground transition-colors">
            AI Video
          </Link>
          <Link href="/categories/ai-avatars" className="text-muted-foreground hover:text-foreground transition-colors">
            AI Avatars
          </Link>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create Footer component**

```tsx
// components/layout/Footer.tsx
import Link from 'next/link';
import { SITE } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-20">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Create Breadcrumbs component**

```tsx
// components/Breadcrumbs.tsx
import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <span>/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Create ReviewCard component**

```tsx
// components/ReviewCard.tsx
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import type { ReviewFrontmatter } from '@/lib/content';

export function ReviewCard({ review }: { review: ReviewFrontmatter }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">
            <Link href={`/reviews/${review.slug}`} className="hover:text-primary transition-colors">
              {review.name}
            </Link>
          </CardTitle>
          <Badge variant={review.pricing === 'Free' ? 'secondary' : 'outline'}>
            {review.pricing}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{review.description}</p>
        <div className="flex flex-wrap gap-1">
          {review.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>
        <div className="mt-auto pt-3 flex gap-2">
          <Button size="sm" variant="default" asChild>
            <Link href={`/reviews/${review.slug}`}>Read Review</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={review.url} target="_blank" rel="noopener noreferrer">
              Visit <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Create JsonLd component**

```tsx
// components/JsonLd.tsx
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add layout components, review card, breadcrumbs, and JSON-LD"
```

---

### Task 5: Create migration script for data.js → MDX

**Files:**
- Create: `scripts/migrate-data.ts`
- Create: 30 MDX files in `content/reviews/`
- Create: 5 MDX files in `content/categories/`

- [ ] **Step 1: Create migration script**

```typescript
// scripts/migrate-data.ts
import fs from 'fs';
import path from 'path';

// Manually embed the data from the original data.js file
const tools = [
  {
    id: 'sora',
    name: 'Sora',
    category: 'video-generation',
    description: "Sora is OpenAI's headline text-to-video model, built for cinematic motion, realistic scene continuity, and premium concept storytelling for brands, filmmakers, and creators exploring high-end AI video production workflows.",
    tags: ['Text-to-Video', 'Cinematic Output'],
    url: 'https://openai.com/sora',
  },
  {
    id: 'runway-gen-3',
    name: 'Runway Gen-3',
    category: 'video-generation',
    description: "Runway Gen-3 helps creators and marketing teams generate stylized videos, control motion, and accelerate commercial content production with a polished AI video workflow designed for fast experimentation and campaign-ready output.",
    tags: ['Creative Studio', 'Motion Control'],
    url: 'https://runwayml.com/',
  },
  {
    id: 'pika-2-0',
    name: 'Pika 2.0',
    category: 'video-generation',
    description: "Pika 2.0 focuses on fast, social-friendly AI video creation, making it attractive for creators, startups, and brands that want prompt-based clips, dynamic visuals, and lightweight production speed without heavy editing complexity.",
    tags: ['Short-Form Video', 'Fast Rendering'],
    url: 'https://pika.art/',
  },
  {
    id: 'luma-dream-machine',
    name: 'Luma Dream Machine',
    category: 'video-generation',
    description: "Luma Dream Machine is a fast-rising AI video generator known for fluid motion, vivid visuals, and fast concept iteration, making it useful for creative testing, storytelling, and rapid ad prototype generation.",
    tags: ['Prompt Video', 'Rapid Concepts'],
    url: 'https://lumalabs.ai/dream-machine',
  },
  {
    id: 'kling-ai',
    name: 'Kling AI',
    category: 'video-generation',
    description: "Kling AI has become a widely discussed AI video generator for realistic motion, prompt-based scene building, and visually ambitious outputs that appeal to creators, advertisers, and global audiences comparing next-wave video models.",
    tags: ['Realistic Motion', 'Trending Model'],
    url: 'https://klingai.com/',
  },
  {
    id: 'haiper',
    name: 'Haiper',
    category: 'video-generation',
    description: "Haiper offers accessible AI video generation focused on speed, stylized output, and approachable creative workflows, making it attractive for social media teams, indie creators, and marketers testing fast-moving visual campaigns.",
    tags: ['Fast Creation', 'Creator Friendly'],
    url: 'https://haiper.ai/',
  },
  {
    id: 'pixverse',
    name: 'PixVerse',
    category: 'video-generation',
    description: "PixVerse is a popular AI video generator for prompt-based animation, eye-catching short clips, and visually expressive content, helping creators produce trend-driven assets for social platforms and experimental branded storytelling.",
    tags: ['Animated Clips', 'Social Media'],
    url: 'https://pixverse.ai/',
  },
  {
    id: 'invideo-ai',
    name: 'InVideo AI',
    category: 'video-generation',
    description: "InVideo AI turns prompts into complete videos with scripts, visuals, and voice layers, making it especially useful for marketers, publishers, and business users who want fast production without advanced editing skills.",
    tags: ['Script to Video', 'Marketing'],
    url: 'https://invideo.io/ai/',
  },
  {
    id: 'synthesia',
    name: 'Synthesia',
    category: 'ai-avatars',
    description: "Synthesia is one of the best-known AI avatar video platforms for training, onboarding, explainers, and multilingual presentation content, helping companies scale professional communication without studio production costs.",
    tags: ['AI Avatars', 'Business Video'],
    url: 'https://www.synthesia.io/',
  },
  {
    id: 'heygen',
    name: 'HeyGen',
    category: 'ai-avatars',
    description: "HeyGen is widely used for AI avatar videos, face-driven localization, and multilingual spokesperson content, helping global brands, educators, and e-commerce teams produce scalable communication without traditional filming overhead.",
    tags: ['AI Avatars', 'Localization'],
    url: 'https://www.heygen.com/',
  },
  {
    id: 'deepbrain-ai',
    name: 'DeepBrain AI',
    category: 'ai-avatars',
    description: "DeepBrain AI specializes in avatar presenters, face-based business videos, and multilingual training content, making it a practical solution for enterprises that need professional AI video delivery across markets and internal communication workflows.",
    tags: ['Presenter Videos', 'Enterprise'],
    url: 'https://www.deepbrain.io/',
  },
  {
    id: 'hour-one',
    name: 'Hour One',
    category: 'ai-avatars',
    description: "Hour One focuses on virtual presenters and AI avatar content for corporate communication, learning, and sales enablement, giving teams a streamlined way to create human-facing videos at scale.",
    tags: ['Virtual Presenters', 'Training'],
    url: 'https://hourone.ai/',
  },
  {
    id: 'elai',
    name: 'Elai.io',
    category: 'ai-avatars',
    description: "Elai.io helps businesses create avatar-led videos for product explainers, internal education, and multilingual presentations, making it relevant for teams that need clear communication without recurring filming effort.",
    tags: ['Avatar Content', 'Explainers'],
    url: 'https://elai.io/',
  },
  {
    id: 'colossyan',
    name: 'Colossyan',
    category: 'ai-avatars',
    description: "Colossyan provides AI presenter video tools for workplace learning, internal communication, and educational content, helping organizations publish more training material with faster turnaround and lower production friction.",
    tags: ['Learning Content', 'Workplace Video'],
    url: 'https://www.colossyan.com/',
  },
  {
    id: 'd-id',
    name: 'D-ID',
    category: 'ai-avatars',
    description: "D-ID enables talking avatars and face-animated videos from still images, making it useful for personalized outreach, lightweight digital presenters, and experimental branded communication formats.",
    tags: ['Talking Avatar', 'Personalization'],
    url: 'https://www.d-id.com/',
  },
  {
    id: 'captions',
    name: 'Captions',
    category: 'ai-subtitles',
    description: "Captions combines automatic subtitles, creator-focused editing, dubbing, and talking-head enhancement features, making it especially relevant for short-form video teams that care about retention and fast publishing.",
    tags: ['Auto Captions', 'Short-Form'],
    url: 'https://www.captions.ai/',
  },
  {
    id: 'capcut-international',
    name: 'CapCut International',
    category: 'ai-subtitles',
    description: "CapCut International combines creator-friendly editing, auto captions, subtitle styling, and short-form publishing tools, making it one of the most searched AI-assisted video editors for global social media growth.",
    tags: ['Auto Captions', 'Social Editing'],
    url: 'https://www.capcut.com/',
  },
  {
    id: 'autosubtitle-io',
    name: 'AutoSubtitle.io',
    category: 'ai-subtitles',
    description: "AutoSubtitle.io helps creators generate subtitles quickly for marketing videos, tutorials, and international content, offering a lightweight workflow for improving accessibility, retention, and multilingual reach across platforms.",
    tags: ['Subtitle Generator', 'Accessibility'],
    url: 'https://autosubtitle.io/',
  },
  {
    id: 'veed',
    name: 'VEED',
    category: 'ai-subtitles',
    description: "VEED offers browser-based editing with subtitle generation, caption styling, and social publishing support, making it a practical choice for creators and small teams producing fast-moving content across global channels.",
    tags: ['Web Editor', 'Caption Workflow'],
    url: 'https://www.veed.io/',
  },
  {
    id: 'descript',
    name: 'Descript',
    category: 'ai-subtitles',
    description: "Descript blends transcript-based editing, subtitle workflows, screen recording, and voice tools into one creator-friendly platform, making it a strong fit for tutorials, podcasts, webinars, and repurposed video content.",
    tags: ['Transcript Editing', 'Content Repurposing'],
    url: 'https://www.descript.com/',
  },
  {
    id: 'subtitlebee',
    name: 'SubtitleBee',
    category: 'ai-subtitles',
    description: "SubtitleBee focuses on automatic subtitles, translation support, and social-ready caption styling, helping creators and brands improve accessibility while making short-form video content easier to consume globally.",
    tags: ['Subtitle Styling', 'Translation'],
    url: 'https://subtitlebee.com/',
  },
  {
    id: 'kapwing',
    name: 'Kapwing',
    category: 'ai-subtitles',
    description: "Kapwing includes AI subtitle tools, online editing, resizing, and content repurposing features, making it useful for distributed teams that need a collaborative browser workflow for social and marketing video assets.",
    tags: ['Online Editor', 'Team Workflow'],
    url: 'https://www.kapwing.com/',
  },
  {
    id: 'happy-scribe',
    name: 'Happy Scribe',
    category: 'ai-subtitles',
    description: "Happy Scribe is a trusted transcription and subtitling platform for creators, educators, and media teams who need reliable caption generation, translation support, and accessible video distribution across markets.",
    tags: ['Transcription', 'Translation'],
    url: 'https://www.happyscribe.com/',
  },
  {
    id: 'wisecut',
    name: 'Wisecut',
    category: 'ai-subtitles',
    description: "Wisecut streamlines subtitle creation, silence trimming, and talking-head editing, helping creators convert raw recordings into cleaner, more watchable social and educational videos with less manual post-production.",
    tags: ['Talking Head', 'Auto Editing'],
    url: 'https://www.wisecut.video/',
  },
  {
    id: 'topaz-video-ai',
    name: 'Topaz Video AI',
    category: 'video-enhancer',
    description: "Topaz Video AI is a premium enhancement tool for upscaling, denoising, sharpening, and frame interpolation, often chosen by editors who need cleaner footage, better resolution, and stronger final delivery quality.",
    tags: ['Upscaling', 'Denoise'],
    url: 'https://www.topazlabs.com/topaz-video-ai',
  },
  {
    id: 'remini-video',
    name: 'Remini Video',
    category: 'video-enhancer',
    description: "Remini Video focuses on restoring clarity, facial detail, and perceived sharpness in lower-quality clips, making it appealing for mobile creators, repurposed archives, and fast enhancement use cases tied to social publishing.",
    tags: ['Video Restore', 'Mobile Workflow'],
    url: 'https://remini.ai/',
  },
  {
    id: 'hitpaw-video-enhancer',
    name: 'HitPaw Video Enhancer',
    category: 'video-enhancer',
    description: "HitPaw Video Enhancer helps users upscale low-resolution clips, reduce blur, and improve visual sharpness, making it attractive for creators, ecommerce sellers, and editors refreshing imperfect footage quickly.",
    tags: ['Upscale', 'Sharpness'],
    url: 'https://www.hitpaw.com/video-enhancer.html',
  },
  {
    id: 'avclabs-video-enhancer-ai',
    name: 'AVCLabs Video Enhancer AI',
    category: 'video-enhancer',
    description: "AVCLabs Video Enhancer AI focuses on upscaling, face refinement, denoising, and color improvement, helping video editors and content teams upgrade source material for cleaner playback and more polished distribution.",
    tags: ['Face Refinement', 'Resolution Upgrade'],
    url: 'https://www.avclabs.com/video-enhancer-ai.html',
  },
  {
    id: 'vmake-ai-video-enhancer',
    name: 'Vmake AI Video Enhancer',
    category: 'video-enhancer',
    description: "Vmake AI Video Enhancer is designed for ecommerce and social media teams that need to sharpen product videos, improve clarity, and produce stronger-looking visual assets with lightweight enhancement workflows.",
    tags: ['Ecommerce Video', 'Product Content'],
    url: 'https://vmake.ai/video-enhancer',
  },
  {
    id: 'airbrush-video-enhancer',
    name: 'AirBrush Video Enhancer',
    category: 'video-enhancer',
    description: "AirBrush Video Enhancer offers easy visual cleanup, clarity improvement, and quick enhancement for social-ready clips, making it appealing to casual creators and fast-moving teams optimizing content for polished presentation.",
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
if (!fs.existsSync(CATEGORIES_DIR)) fs.mkdirSync(CATEGORIES_DIR, { recursive: true });

const categories = [
  { slug: 'video-generation', name: 'AI Video Generation', description: 'AI-powered video creation tools for cinematic content, ads, and social media.' },
  { slug: 'ai-avatars', name: 'AI Avatars', description: 'Create professional AI avatar videos for training, marketing, and communication.' },
  { slug: 'ai-subtitles', name: 'AI Subtitles & Captions', description: 'Auto-generate subtitles, captions, and transcriptions for your videos.' },
  { slug: 'video-enhancer', name: 'Video Enhancers', description: 'Upscale, sharpen, and improve video quality with AI enhancement tools.' },
  { slug: 'face-swap', name: 'Face Swap Tools', description: 'AI face swap tools for creative video content.' },
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
```

- [ ] **Step 2: Run migration script**

Run: `cd /Users/zhangjie/project/npm/new-web-test && npx tsx scripts/migrate-data.ts`

Expected: 30 review MDX files and 5 category MDX files created in `content/`.

- [ ] **Step 3: Verify migration**

Run: `ls content/reviews/ | wc -l`
Expected: 30

Run: `ls content/categories/ | wc -l`
Expected: 5

- [ ] **Step 4: Remove the old data.js and HTML files**

```bash
rm data.js
rm -rf tools/ categories/ use-cases/
rm *.html
```

Keep: `.gitignore`, `robots.txt`, `sitemap.xml` (we will regenerate sitemap later), `vercel.json`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: migrate 30 tools from data.js to MDX, create category files, remove old HTML"
```

---

### Task 6: Create review page route

**Files:**
- Create: `app/reviews/[slug]/page.tsx`

- [ ] **Step 1: Create the reviews dynamic route page**

```tsx
// app/reviews/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { getBySlug, getAll, getAllSlugs, ReviewFrontmatter } from '@/lib/content';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { SITE } from '@/lib/constants';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ReviewCard } from '@/components/ReviewCard';
import { JsonLd } from '@/components/JsonLd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, ThumbsUp, ThumbsDown, Target } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

export async function generateStaticParams() {
  return getAllSlugs('reviews').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getBySlug<ReviewFrontmatter>('reviews', slug);
  if (!item) return { title: 'Not Found' };

  return seoMeta({
    title: `${item.frontmatter.name} Review`,
    description: item.frontmatter.description,
    path: `/reviews/${slug}`,
    type: 'article',
  });
}

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getBySlug<ReviewFrontmatter>('reviews', slug);
  if (!item) notFound();

  const { frontmatter, content } = item;
  const categoryName = CATEGORIES.find((c) => c.slug === frontmatter.category)?.name || frontmatter.category;

  const relatedReviews = getAll<ReviewFrontmatter>('reviews')
    .filter((r) => r.frontmatter.category === frontmatter.category && r.frontmatter.slug !== slug)
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: frontmatter.name,
    applicationCategory: categoryName,
    description: frontmatter.description,
    url: frontmatter.url,
    offers: {
      '@type': 'Offer',
      price: frontmatter.pricing === 'Free' ? '0' : undefined,
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: categoryName, href: `/categories/${frontmatter.category}` },
            { label: frontmatter.name },
          ]}
        />

        <article>
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary">{categoryName}</Badge>
              <Badge variant={frontmatter.pricing === 'Free' ? 'secondary' : 'outline'}>
                {frontmatter.pricing}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              {frontmatter.name} Review
            </h1>
            <p className="text-lg text-muted-foreground">{frontmatter.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {frontmatter.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </header>

          <Separator className="my-8" />

          <div className="prose prose-zinc dark:prose-invert max-w-none mb-8">
            <MDXRemote source={content} />
          </div>

          {(frontmatter.pros.length > 0 || frontmatter.cons.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-5">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
                  <ThumbsUp className="h-5 w-5" /> Pros
                </h2>
                <ul className="space-y-2">
                  {frontmatter.pros.map((pro, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">+</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
                  <ThumbsDown className="h-5 w-5" /> Cons
                </h2>
                <ul className="space-y-2">
                  {frontmatter.cons.map((con, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">-</span> {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {frontmatter.bestFor.length > 0 && (
            <div className="rounded-lg border p-5 mb-8">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <Target className="h-5 w-5" /> Best For
              </h2>
              <ul className="space-y-2">
                {frontmatter.bestFor.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground">{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-8">
            <Button asChild size="lg">
              <a href={frontmatter.affiliateUrl || frontmatter.url} target="_blank" rel="noopener noreferrer">
                Visit {frontmatter.name} <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href={`/categories/${frontmatter.category}`}>
                More {categoryName} Tools
              </Link>
            </Button>
          </div>
        </article>

        {relatedReviews.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Related Tools</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedReviews.map((r) => (
                <ReviewCard key={r.frontmatter.slug} review={r.frontmatter} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify review page renders**

Run: `npm run dev`

Visit: http://localhost:3000/reviews/sora

Expected: Page renders with Sora's name, description, tags, breadcrumbs, and CTA buttons.

Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add reviews/[slug] dynamic route with full layout"
```

---

### Task 7: Create category page route

**Files:**
- Create: `app/categories/[slug]/page.tsx`

- [ ] **Step 1: Create category page**

```tsx
// app/categories/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getAll, getBySlug, getAllSlugs, ReviewFrontmatter, CategoryFrontmatter } from '@/lib/content';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ReviewCard } from '@/components/ReviewCard';
import { JsonLd } from '@/components/JsonLd';

export async function generateStaticParams() {
  return getAllSlugs('categories').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getBySlug<CategoryFrontmatter>('categories', slug);
  if (!item) return { title: 'Not Found' };

  return seoMeta({
    title: `Best ${item.frontmatter.name} Tools`,
    description: item.frontmatter.description,
    path: `/categories/${slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getBySlug<CategoryFrontmatter>('categories', slug);
  if (!category) notFound();

  const tools = getAll<ReviewFrontmatter>('reviews')
    .filter((r) => r.frontmatter.category === slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.frontmatter.name} Tools`,
    about: category.frontmatter.name,
    mainEntity: tools.map((t) => ({
      '@type': 'SoftwareApplication',
      name: t.frontmatter.name,
      applicationCategory: category.frontmatter.name,
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <Breadcrumbs items={[{ label: category.frontmatter.name }]} />

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Best {category.frontmatter.name} Tools
          </h1>
          <p className="text-lg text-muted-foreground">{category.frontmatter.description}</p>
          <p className="text-sm text-muted-foreground mt-2">{tools.length} tools listed</p>
        </header>

        {tools.length === 0 ? (
          <p className="text-muted-foreground">No tools in this category yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((t) => (
              <ReviewCard key={t.frontmatter.slug} review={t.frontmatter} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify category page works**

Run: `npm run dev`

Visit: http://localhost:3000/categories/video-generation

Expected: Page shows "Best AI Video Generation Tools" with 8 tool cards (Sora, Runway, etc.).

Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add categories/[slug] dynamic route"
```

---

### Task 8: Create homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Build homepage**

```tsx
// app/page.tsx
import Link from 'next/link';
import { getAll, ReviewFrontmatter } from '@/lib/content';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { SITE, CATEGORIES } from '@/lib/constants';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ReviewCard } from '@/components/ReviewCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight } from 'lucide-react';

export const metadata = seoMeta({
  title: 'Discover the Best Online Tools & AI Products',
  description: SITE.description,
  path: '/',
});

export default function HomePage() {
  const allReviews = getAll<ReviewFrontmatter>('reviews');
  const featuredTools = allReviews.slice(0, 9);

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="border-b border-border/40">
          <div className="container mx-auto max-w-4xl px-4 py-20 sm:py-28 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              Discover the Best{' '}
              <span className="text-primary">Online Tools</span>{' '}
              & AI Products
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {SITE.description}
            </p>
            <div className="flex max-w-md mx-auto gap-2">
              <Input placeholder="Search tools... (coming soon)" disabled className="flex-1" />
              <Button disabled>
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="container mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Browse by Category</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => {
              const count = allReviews.filter((r) => r.frontmatter.category === cat.slug).length;
              return (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="rounded-lg border p-6 hover:border-primary/50 hover:bg-accent/50 transition-all"
                >
                  <h3 className="font-semibold mb-1">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">{count} tools</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Tools */}
        <section className="container mx-auto max-w-6xl px-4 py-16 border-t border-border/40">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Tools</h2>
            <Button variant="ghost" asChild>
              <Link href="/categories/video-generation">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTools.map((review) => (
              <ReviewCard key={review.frontmatter.slug} review={review.frontmatter} />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto max-w-4xl px-4 py-16 border-t border-border/40 text-center">
          <h2 className="text-2xl font-bold mb-4">Want to list your tool?</h2>
          <p className="text-muted-foreground mb-4">
            Get your AI tool or product in front of thousands of creators and developers.
          </p>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </section>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify homepage renders**

Run: `npm run dev`

Visit: http://localhost:3000

Expected: Hero section, category links, featured tools grid, CTA section.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: build homepage with hero, categories, and featured tools"
```

---

### Task 9: Add compare, tools, blog, and llms.txt routes

**Files:**
- Create: `app/compare/[a]-vs-[b]/page.tsx`
- Create: `app/tools/[slug]/page.tsx`
- Create: `app/blog/[slug]/page.tsx`
- Create: `app/llms.txt/route.ts`

- [ ] **Step 1: Create compare page route**

```tsx
// app/compare/[a]-vs-[b]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getComparePair, getAllCompareSlugs } from '@/lib/compare';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Check } from 'lucide-react';

export async function generateStaticParams() {
  return getAllCompareSlugs().map(({ a, b }) => ({ a, b }));
}

export async function generateMetadata({ params }: { params: Promise<{ a: string; b: string }> }) {
  const { a, b } = await params;
  const pair = getComparePair(a, b);
  if (!pair) return { title: 'Not Found' };

  return seoMeta({
    title: `${pair.a.name} vs ${pair.b.name} — Which is Better?`,
    description: `Compare ${pair.a.name} and ${pair.b.name}. Features, pricing, pros and cons to help you choose the right tool.`,
    path: `/compare/${a}-vs-${b}`,
    type: 'article',
  });
}

export default async function ComparePage({ params }: { params: Promise<{ a: string; b: string }> }) {
  const { a, b } = await params;
  const pair = getComparePair(a, b);
  if (!pair) notFound();

  const { a: toolA, b: toolB } = pair;

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Compare' },
            { label: `${toolA.name} vs ${toolB.name}` },
          ]}
        />

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
          {toolA.name} vs {toolB.name}
        </h1>

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-2">{toolA.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">{toolA.description}</p>
            <span className="text-sm font-medium">{toolA.pricing}</span>
          </div>
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-2">{toolB.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">{toolB.description}</p>
            <span className="text-sm font-medium">{toolB.pricing}</span>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg">
            <a href={toolA.url} target="_blank" rel="noopener noreferrer">
              Try {toolA.name} <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={toolB.url} target="_blank" rel="noopener noreferrer">
              Try {toolB.name} <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Create tools route placeholder**

```tsx
// app/tools/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getBySlug, getAllSlugs, ToolFrontmatter } from '@/lib/content';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';

export async function generateStaticParams() {
  return getAllSlugs('tools').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getBySlug<ToolFrontmatter>('tools', slug);
  if (!item) return { title: 'Not Found' };

  return seoMeta({
    title: `Free Online ${item.frontmatter.name} — No Sign Up Required`,
    description: item.frontmatter.description,
    path: `/tools/${slug}`,
  });
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getBySlug<ToolFrontmatter>('tools', slug);
  if (!item) notFound();

  const { frontmatter, content } = item;

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: frontmatter.name,
        description: frontmatter.description,
        applicationCategory: frontmatter.category,
        browserRequirements: 'Requires JavaScript',
      }} />
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs items={[{ label: frontmatter.name }]} />
        <h1 className="text-3xl font-bold mb-4">{frontmatter.name}</h1>
        <p className="text-lg text-muted-foreground mb-8">{frontmatter.description}</p>
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <MDXRemote source={content} />
        </div>

        {/* Ad placeholder */}
        <div className="mt-12 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          Ads placeholder — Google AdSense will go here
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Create blog route**

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getBySlug, getAllSlugs, BlogFrontmatter } from '@/lib/content';
import { generateMetadata as seoMeta } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';

export async function generateStaticParams() {
  return getAllSlugs('blog').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getBySlug<BlogFrontmatter>('blog', slug);
  if (!item) return { title: 'Not Found' };

  return seoMeta({
    title: item.frontmatter.title,
    description: item.frontmatter.description,
    path: `/blog/${slug}`,
    type: 'article',
  });
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getBySlug<BlogFrontmatter>('blog', slug);
  if (!item) notFound();

  const { frontmatter, content } = item;

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: frontmatter.title,
        description: frontmatter.description,
        datePublished: frontmatter.date,
      }} />
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }, { label: frontmatter.title }]} />
        <article>
          <header className="mb-8">
            {frontmatter.date && (
              <time className="text-sm text-muted-foreground mb-2 block">
                {new Date(frontmatter.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{frontmatter.title}</h1>
            <p className="text-lg text-muted-foreground mt-2">{frontmatter.description}</p>
          </header>
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <MDXRemote source={content} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Create llms.txt route**

```tsx
// app/llms.txt/route.ts
import { getAll, ReviewFrontmatter, BlogFrontmatter } from '@/lib/content';
import { SITE } from '@/lib/constants';

export async function GET() {
  const reviews = getAll<ReviewFrontmatter>('reviews');
  const blog = getAll<BlogFrontmatter>('blog');

  const lines = [
    `# ${SITE.name}`,
    `> ${SITE.description}`,
    '',
    '## Pages',
    `- ${SITE.url}/: Homepage — featured tools, categories, and latest content`,
    `- ${SITE.url}/categories/[slug]: Browse tools by category`,
    `- ${SITE.url}/reviews/[slug]: Detailed tool reviews and comparisons`,
    `- ${SITE.url}/tools/[slug]: Free online tools`,
    `- ${SITE.url}/compare/[a]-vs-[b]: Side-by-side tool comparisons`,
    `- ${SITE.url}/blog/[slug]: Articles and guides`,
    '',
    '## Tools & Reviews',
  ];

  for (const r of reviews) {
    lines.push(`- [${r.frontmatter.name}](${SITE.url}/reviews/${r.frontmatter.slug}): ${r.frontmatter.description}`);
  }

  lines.push('', '## Blog Posts');
  for (const b of blog) {
    lines.push(`- [${b.frontmatter.title}](${SITE.url}/blog/${b.frontmatter.slug}): ${b.frontmatter.description}`);
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
```

- [ ] **Step 5: Verify all routes work**

Run: `npm run dev`

Test:
- http://localhost:3000/tools/image-compressor (if a test tool exists)
- http://localhost:3000/compare/sora-vs-runway-gen-3
- http://localhost:3000/llms.txt

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add compare, tools, blog routes and llms.txt endpoint"
```

---

### Task 10: SEO — sitemap, robots.txt, OG image

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Modify: `public/og-default.png` (or create a placeholder)

- [ ] **Step 1: Create dynamic sitemap**

```typescript
// app/sitemap.ts
import { getAllSlugs } from '@/lib/content';
import { getAllCompareSlugs } from '@/lib/compare';
import { SITE } from '@/lib/constants';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE.url;
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  const reviewPages = getAllSlugs('reviews').map((slug) => ({
    url: `${baseUrl}/reviews/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const categoryPages = getAllSlugs('categories').map((slug) => ({
    url: `${baseUrl}/categories/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const toolPages = getAllSlugs('tools').map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const blogPages = getAllSlugs('blog').map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const comparePages = getAllCompareSlugs().map(({ a, b }) => ({
    url: `${baseUrl}/compare/${a}-vs-${b}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...reviewPages, ...categoryPages, ...toolPages, ...blogPages, ...comparePages];
}
```

- [ ] **Step 2: Create robots.txt**

```typescript
// app/robots.ts
import { SITE } from '@/lib/constants';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/api/',
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Create a simple OG image placeholder**

Run: `mkdir -p public`

Create a 1200x630 PNG image for OG sharing. For now, use a text-based approach in `app/og/route.tsx` or create a simple placeholder.

For simplicity, create a static placeholder:

```tsx
// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ToolHub';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: 'linear-gradient(to bottom right, #0b0f19, #1a1f2e)',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          padding: 80,
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 900, marginBottom: 20, color: '#10b981' }}>
          ToolHub
        </div>
        <div style={{ fontSize: 32, color: '#94a3b8' }}>
          Discover the best online tools & AI products
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 4: Verify sitemap and robots**

Run: `npm run dev`

Visit: http://localhost:3000/sitemap.xml → Should show XML with all URLs
Visit: http://localhost:3000/robots.txt → Should show robots rules

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add dynamic sitemap, robots.txt, and OG image generation"
```

---

### Task 11: Root layout configuration

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update root layout with metadata**

Replace the current `app/layout.tsx` content:

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SITE } from '@/lib/constants';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: SITE.locale,
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update globals.css for dark theme**

Replace `app/globals.css` to include the dark theme from the original HTML:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 225 20% 8%;
    --foreground: 210 40% 98%;
    --card: 222 20% 11%;
    --card-foreground: 210 40% 98%;
    --popover: 222 20% 11%;
    --popover-foreground: 210 40% 98%;
    --primary: 160 84% 39%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217 20% 18%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217 20% 18%;
    --muted-foreground: 215 20% 65%;
    --accent: 217 20% 18%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62% 50%;
    --destructive-foreground: 210 40% 98%;
    --border: 217 20% 20%;
    --input: 217 20% 20%;
    --ring: 160 84% 39%;
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`

Expected: Build succeeds with all pages statically generated.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: configure root layout, metadata, and dark theme"
```

---

## Phase 1 Complete

After Task 11, you should have:
- Next.js 14 project with App Router
- shadcn/ui components
- MDX content pipeline with 30 reviews + 5 categories
- Dynamic routes: reviews, categories, compare, tools, blog
- Homepage, llms.txt, sitemap.xml, robots.txt
- Dark theme matching the original design
- OG image generation

**Next:** Phase 2 will add deeper content (blog articles, improved compare pages, search), Phase 3 will add free tools.
