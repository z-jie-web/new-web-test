# ToolHub Platform Design Spec

**Date**: 2026-05-28
**Status**: Draft

---

## 1. Overview

ToolHub is a multi-category tools platform targeting overseas (English-speaking) users. It combines free online tools with a curated tools directory and review section. Revenue comes from affiliate commissions and display ads.

**Positioning**: Discover the best online tools and AI products. Every tool can be used for free.

## 2. Site Architecture

```
/                              Home: featured tools + trending comparisons + latest articles
/tools/[slug]                  Free online tool (functional, runs in browser)
/reviews/[slug]                Tool review/directory entry (informational)
/compare/[a]-vs-[b]            Comparison page (programmatic, covers long-tail)
/categories/[slug]             Category listing page
/blog/[slug]                   Blog article (keyword-driven topic selection)
/llms.txt                      AI search engine entry point
```

**Key distinction**:
- `/tools/` — interactive utility that users actually use (image compressor, JSON formatter, etc.)
- `/reviews/` — informational page helping users decide which tool to choose
- `/compare/` — programmatically generated comparison pages for every tool pair

## 3. Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- MDX for content (tools data, reviews, blog posts — file-based, no CMS)
- Vercel deployment
- Umami analytics (self-hosted, free, no page slowdown)

## 4. Data Model

All content stored as MDX files under `/content/`:

```
/content/
  /tools/           Free online tools (one per file)
  /reviews/         Tool directory entries (one per file)
  /blog/            Blog articles
  /categories/      Category definitions
```

**Review MDX frontmatter schema**:
```yaml
slug: "sora"
name: "Sora"
category: "ai-video"
description: "..."
tags: ["Text-to-Video", "Cinematic Output"]
url: "https://openai.com/sora"
affiliateUrl: ""        # affiliate link if available
pricing: "Paid"
pros: ["...", "..."]
cons: ["...", "..."]
bestFor: ["..."]
```

**Tool MDX frontmatter schema**:
```yaml
slug: "image-compressor"
name: "Image Compressor"
category: "image-tools"
description: "Compress images online for free, no upload required."
keywords: ["compress image", "image optimizer"]
type: "browser"          # browser | api-backed
```

## 5. Content Workflow (Keyword-Driven SOP)

Every new piece of content must follow this pipeline:

```
1. Keyword research → verify search volume > 200, KD < 30
2. If pass → select target keyword, determine title
3. Write content targeting that keyword
4. Publish and submit to GSC
5. Monitor ranking, iterate based on data
```

**Rule**: Never write content based on "I think users search this." Only write based on "data proves users already search this."

**Proactive mode**: Claude periodically identifies keyword opportunities, presents options to user, user picks direction, Claude executes.

## 6. Monetization

Three revenue lines:

| Line | Description | Activation |
|------|-------------|------------|
| Affiliate | Commission links on /reviews/ and /compare/ pages | Month 1 |
| Google Adsense | Ads on /tools/ pages | Month 2-3 (after 20-30 pages) |
| Sponsored Listing | Paid placement on category/home pages | After 10K+ monthly visits |

**Revenue milestones (estimated)**:
- Month 1-3: $0-5/month (affiliate clicks trickle in)
- Month 4-6: $20-100/month (Adsense + affiliate)
- Month 7-12: $200-1000/month (content scale + backlinks)
- Month 12+: $500-3000/month (50-100K monthly visits)

The key is not the absolute numbers but seeing the growth curve by month 3.

## 7. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Scaffold Next.js project with App Router
- Set up Tailwind + shadcn/ui
- Create MDX content pipeline
- Implement `/reviews/[slug]` and `/categories/[slug]` dynamic routes
- Migrate existing 30 tool data from data.js into MDX

### Phase 2: Core Pages (Week 3-4)
- Build homepage layout
- Implement `/compare/[a]-vs-[b]` programmatic comparison pages
- Add `/blog/[slug]` route
- Create `/llms.txt` endpoint
- SEO: Schema markup, sitemap generation, canonical URLs, OG images

### Phase 3: Free Tools (Week 5-8)
- Build first 10-15 free online tools
- Each tool targets specific low-KD keywords
- Add Google Adsense to tool pages

### Phase 4: Scale Content (Ongoing)
- Expand to more categories (AI image, AI writing, AI audio)
- Programmatic compare pages for all tool pairs
- Blog articles driven by keyword research
- Backlink outreach

### Phase 5: Monetization Optimization (After 5K monthly visits)
- A/B test affiliate link placement
- Optimize ad placement
- Pitch sponsored listings to tool vendors

## 8. Success Metrics

- Month 3: GSC impressions growing, first affiliate click
- Month 6: 5K+ monthly page views, AdSense approved
- Month 12: 20K+ monthly page views, $200+/month revenue
- Leading indicator: keyword ranking velocity (how many new keywords entering top 30 each week)
