# ToolPorto Writer V2 Project Contract

This document is the single source of truth for how content files in this repo
map to rendered pages, schema output, and validator expectations.

It exists to stop prompt drift.

If a mode guide, validator, or checklist conflicts with this file, this file is
wrong only if the code is wrong. The render code and typed content model win.

## Status

Draft for V2 skill design.

## Truth Source Order

When conflicts appear, resolve them in this order:

1. Runtime render code in `app/**/page.tsx`
2. Typed content model in `lib/content.ts` and `lib/compare.ts`
3. Shared rendering helpers and components
4. Validators in `scripts/content/validators/*.sh`
5. Mode docs in `references/modes/*.md`
6. Examples and legacy V1 skill text

Do not define numeric thresholds, field names, or render behavior in more than
one layer unless one layer explicitly imports or wraps another.

## Phase 0 Precondition: Brand Alignment

Before V2 becomes canonical, run a brand alignment audit.

Current drift exists between:

- Site display name: `ToolPorto`
- Blog author: `ToolPorto Team`
- Skill copy: `ToolPorto`

The following must be aligned before finalizing validators:

- `lib/constants.ts`
- default blog `author` guidance
- schema publisher / author fallbacks
- disclosure copy
- skill examples and templates

Until Phase 0 is complete, validators should not enforce a single author brand
string beyond "must be one approved value from the migration allowlist."

## Canonical Content Model

### Review content

Source of truth:

- `content/reviews/*.mdx`
- type definition: [lib/content.ts](/Users/zhangjie/project/npm/new-web-test/lib/content.ts:7)
- page renderer: [app/reviews/[slug]/page.tsx](/Users/zhangjie/project/npm/new-web-test/app/reviews/[slug]/page.tsx:1)

Required frontmatter fields:

- `slug`
- `name`
- `category`
- `description`
- `tags`
- `url`
- `pricing`
- `pros`
- `cons`
- `bestFor`

Optional frontmatter fields:

- `affiliateUrl`
- `lastUpdated`

Notes:

- Review page SEO title is generated as `{name} Review (2026) — Is It Worth It?`
- Review schema rating is derived from `pros.length`
- Review offer price is derived from `pricing`
- Review related content scoring uses `tags`, `category`, and `pricing`
- The review page displays "Updated" using git/file mtime, not `frontmatter.lastUpdated`
- Review lists and homepage sorting use `frontmatter.lastUpdated`

### Compare content

Source of truth:

- `content/compare/*.mdx`
- type definition: [lib/compare.ts](/Users/zhangjie/project/npm/new-web-test/lib/compare.ts:1)
- page renderer: [app/compare/[...slugs]/page.tsx](/Users/zhangjie/project/npm/new-web-test/app/compare/[...slugs]/page.tsx:1)

Required frontmatter fields:

- `toolA`
- `toolB`
- `verdict`
- `winner`
- `lastUpdated`

Important:

- Compare pages are not standalone entities. They are hybrid pages assembled from:
  - compare MDX body + compare frontmatter
  - review A frontmatter
  - review B frontmatter
- Category, pricing, best-for, pros, cons, CTA URLs, and most structured data
  are derived from the two review pages, not the compare MDX file.
- Compare route slug is derived from review slugs, not compare frontmatter.

### Blog content

Source of truth:

- `content/blog/*.mdx`
- type definition: [lib/content.ts](/Users/zhangjie/project/npm/new-web-test/lib/content.ts:37)
- page renderer: [app/blog/[slug]/page.tsx](/Users/zhangjie/project/npm/new-web-test/app/blog/[slug]/page.tsx:1)

Required frontmatter fields:

- `slug`
- `title`
- `description`
- `date`

Optional frontmatter fields:

- `category`
- `author`
- `relatedReviews`

Notes:

- Blog schema author falls back to `SITE.name` if `author` is absent
- Blog datePublished uses `frontmatter.date`
- Blog dateModified uses git/file mtime
- Related review cards are auto-rendered from `relatedReviews`

### Category content

Source of truth:

- `content/categories/*.mdx`
- type definition: [lib/content.ts](/Users/zhangjie/project/npm/new-web-test/lib/content.ts:31)
- page renderer: `app/categories/[slug]/page.tsx`

Required frontmatter fields:

- `slug`
- `name`
- `description`

## Render Contract

The skill must distinguish between:

- content that belongs in MDX
- data that belongs in frontmatter
- UI that is auto-rendered by page components

### Review auto-rendered surfaces

These are rendered automatically from frontmatter and page helpers:

- `review_page_title`
  - source: `frontmatter.name`
  - renderer: [app/reviews/[slug]/page.tsx](/Users/zhangjie/project/npm/new-web-test/app/reviews/[slug]/page.tsx:269)
- `review_meta_badges`
  - source: `frontmatter.category`, `frontmatter.pricing`, `frontmatter.tags`
  - renderer: [app/reviews/[slug]/page.tsx](/Users/zhangjie/project/npm/new-web-test/app/reviews/[slug]/page.tsx:259)
- `review_tldr`
  - source: `frontmatter.pros`, `frontmatter.cons`, `frontmatter.bestFor`
  - renderer: [components/TldrBox.tsx](/Users/zhangjie/project/npm/new-web-test/components/TldrBox.tsx:1)
- `review_pros_cons_cards`
  - source: `frontmatter.pros`, `frontmatter.cons`
  - renderer: [app/reviews/[slug]/page.tsx](/Users/zhangjie/project/npm/new-web-test/app/reviews/[slug]/page.tsx:301)
- `review_best_for_card`
  - source: `frontmatter.bestFor`
  - renderer: [app/reviews/[slug]/page.tsx](/Users/zhangjie/project/npm/new-web-test/app/reviews/[slug]/page.tsx:336)
- `review_primary_cta`
  - source: `frontmatter.slug`
  - renderer: [components/TldrBox.tsx](/Users/zhangjie/project/npm/new-web-test/components/TldrBox.tsx:43)
- `review_mobile_sticky_cta`
  - source: `frontmatter.slug`
  - renderer: [components/TldrBox.tsx](/Users/zhangjie/project/npm/new-web-test/components/TldrBox.tsx:55)

MDX must not duplicate:

- manual TL;DR box built from the same pros/cons/bestFor data
- manual "Pros" or "Cons" summary block that mirrors frontmatter exactly
- manual CTA placeholders intended for the same footer action

### Compare auto-rendered surfaces

These are rendered automatically from the two linked reviews:

- `compare_page_title`
  - source: review A name + review B name
  - renderer: [app/compare/[...slugs]/page.tsx](/Users/zhangjie/project/npm/new-web-test/app/compare/[...slugs]/page.tsx:148)
- `compare_page_subtitle`
  - source: `compareData.verdict` or fallback text
  - renderer: [app/compare/[...slugs]/page.tsx](/Users/zhangjie/project/npm/new-web-test/app/compare/[...slugs]/page.tsx:151)
- `compare_quick_table`
  - source: review A + review B frontmatter
  - renderer: [app/compare/[...slugs]/page.tsx](/Users/zhangjie/project/npm/new-web-test/app/compare/[...slugs]/page.tsx:156)
- `compare_pros_cons_blocks`
  - source: review A + review B `pros` and `cons`
  - renderer: [app/compare/[...slugs]/page.tsx](/Users/zhangjie/project/npm/new-web-test/app/compare/[...slugs]/page.tsx:221)
- `compare_bottom_line_fallback`
  - source: review frontmatter heuristics
  - renderer: [app/compare/[...slugs]/page.tsx](/Users/zhangjie/project/npm/new-web-test/app/compare/[...slugs]/page.tsx:332)
- `compare_cta_buttons`
  - source: review slugs
  - renderer: [app/compare/[...slugs]/page.tsx](/Users/zhangjie/project/npm/new-web-test/app/compare/[...slugs]/page.tsx:357)
- `compare_review_links`
  - source: review slugs
  - renderer: [app/compare/[...slugs]/page.tsx](/Users/zhangjie/project/npm/new-web-test/app/compare/[...slugs]/page.tsx:371)

MDX must not duplicate:

- a second "At a Glance" summary table that repeats the auto-rendered table
- hand-written CTA buttons that compete with the built-in buttons
- repeated pros/cons sections that only restate review frontmatter

### Blog auto-rendered surfaces

These are rendered automatically from frontmatter:

- `blog_title`
- `blog_description`
- `blog_date`
- `blog_category_badge`
- `blog_related_review_cards`

MDX should focus on narrative content. It should not try to recreate:

- the article hero metadata row
- related review card grids

## Asset Contract

### Logos

Canonical path:

- `public/logos/<slug>.png`
- `public/logos/<slug>.svg`

Resolution logic:

- [lib/logos.ts](/Users/zhangjie/project/npm/new-web-test/lib/logos.ts:1)
- [components/ToolLogo.tsx](/Users/zhangjie/project/npm/new-web-test/components/ToolLogo.tsx:1)

Rules:

- Tool logos are canonicalized by review slug
- `ToolLogo` tries `svg`, then `png`, then initials fallback
- Compare/review validators must treat `public/logos` as the canonical tool-logo location

### Inline article images

Rendered by:

- [components/MdxComponents.tsx](/Users/zhangjie/project/npm/new-web-test/components/MdxComponents.tsx:1)

Current behavior:

- `/logos/...` images get logo-style rendering
- all other images render through the generic MDX image renderer

V2 contract recommendation:

- allow article images under `public/images/<article-id>/...`
- allow diagrams under `public/images/<article-id>/...`
- validators must not assume every valid image lives under `/logos/`

## Link Contract

### Internal links

Expected internal targets:

- `/reviews/<slug>`
- `/compare/<slug-a>-vs-<slug-b>`
- `/blog/<slug>`
- `/categories/<slug>`

### External links

Current runtime behavior for MDX links:

- external MDX links open in a new tab with `noopener noreferrer`
- source: [components/MdxComponents.tsx](/Users/zhangjie/project/npm/new-web-test/components/MdxComponents.tsx:75)

This means any rule that says "external links open in same tab" is not aligned
with the current code and must not be treated as a validator rule until the code
changes.

### CTA links

Current CTA pattern:

- review and compare primary CTAs route through `/go/<slug>`
- compare CTAs use built-in buttons
- review CTAs are auto-rendered in `TldrBox`

The skill should not require hand-written CTA placeholders for review or compare
pages under the current runtime.

## Date Contract

### Review

- `frontmatter.lastUpdated`
  - used for list sorting and freshness logic
- git/file mtime
  - used for visible "Updated" display and schema dates

### Compare

- `frontmatter.lastUpdated`
  - present in content model and should be validator-checked
- git/file mtime
  - currently used for schema publish/modify timestamps

### Blog

- `frontmatter.date`
  - used for datePublished display and schema
- git/file mtime
  - used for dateModified

Validator implication:

- `validate-publish.sh` should check date presence and format
- it should not assume every page type uses the same field for user-facing date

## Schema Contract

The skill must treat these frontmatter relationships as code-level facts:

- review `ratingValue` is derived from `pros.length`
- review `Offer.price` is derived from `pricing`
- compare schema is assembled from review A + review B, not from a full compare
  frontmatter schema model
- blog schema author falls back to `SITE.name`

Therefore:

- schema validators belong in `publish`, not `draft`
- review frontmatter quality is more important than compare ornamentation

## Validator Design Implications

### Draft validator owns

- required sections
- placeholder removal
- pricing specificity
- FAQ count
- minimum word count
- heading integrity

### Enhance validator owns

- internal links
- external links and third-party source count
- image presence across `/logos/` and `/images/`
- image alt quality
- AI pattern scoring
- render-contract duplication conflicts

### Publish validator owns

- date field validation by type
- schema-ready frontmatter checks
- build success
- backlink operations
- final delivery readiness

## Golden Sample Policy

V2 is not valid until at least one file in each content type passes the new
validators:

- review sample
- compare sample
- blog sample

Suggested initial golden set:

- [content/reviews/elevenlabs.mdx](/Users/zhangjie/project/npm/new-web-test/content/reviews/elevenlabs.mdx:1)
- [content/compare/elevenlabs-vs-play-ht.mdx](/Users/zhangjie/project/npm/new-web-test/content/compare/elevenlabs-vs-play-ht.mdx:1)
- [content/blog/best-ai-voice-generators.mdx](/Users/zhangjie/project/npm/new-web-test/content/blog/best-ai-voice-generators.mdx:1)

If a validator rejects the golden set, either:

- the validator is wrong
- or the migration has not yet updated the sample

Do not treat V2 as canonical until this is resolved.

