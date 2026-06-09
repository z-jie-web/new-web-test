# Article Templates

## Template Index

1. [Review](#1-review) — 单工具深度测评
2. [Compare](#2-compare) — 两工具对比
3. [Best-of](#3-best-of) — 品类最佳推荐
4. [Alternative](#4-alternative) — 替代品推荐
5. [Use Case](#5-use-case) — 场景工具栈
6. [What Is / How-to](#6-what-is--how-to) — 概念科普

## Common Rules (All Types)

- **内链规则**：每篇文章至少 2 条内链。Review 链到相关 Compare，Compare 链回两个工具的 Review。
- **外链规则（强制）**：每篇文章至少 3 条高质量外链。必须包含：① 工具官方网址 ② 官方定价页或文档 ③ 至少 1 条非工具官网的第三方权威源（Product Hunt / Hacker News / 行业报告 / 社区讨论）。链接文字必须有上下文描述，禁止裸 URL。Review 外链放在 Pricing 和 Our Take 段，Compare 外链散布在对比章节中，Blog 外链在工具名称和数据出处处。
- **CTA 规则**：不手动标记。等 affiliate 接入后由组件统一注入。当前零 CTA 代码。（HTML 注释 `<!-- -->` 在 MDX v3 中会编译失败，切勿使用）
- **CTA 规则**：不手动标记。等 affiliate 接入后由组件统一注入。当前零 CTA 代码。（HTML 注释 `<!-- -->` 在 MDX v3 中会编译失败，切勿使用）
- **EEAT 标注**：文末统一加 `> We test AI tools hands-on. [Learn how we evaluate →](/how-we-test)` + `Last updated: YYYY-MM-DD`。
- **Disclosure**：文末加 `Disclosure: Some links may contain affiliate partnerships at no extra cost to you.`

---

## 1. Review

**Frontmatter**:
```yaml
slug: "tool-slug"
name: "Tool Name"
category: "category-slug"
description: "SEO meta description — 110-160 chars, include main keyword"
tags: ["Tag1", "Tag2", "Tag3"]
url: "https://tool-website.com"
pricing: "Freemium" | "Paid" | "Free"
pros: ["Pro 1", "Pro 2", "Pro 3", "Pro 4"]
cons: ["Con 1", "Con 2", "Con 3"]
bestFor: ["User type 1", "User type 2", "User type 3", "User type 4"]
lastUpdated: "YYYY-MM-DD"
```

**Required Sections** (in order):
```
[Logo]                                                    ← 视觉
## TL;DR (Key Takeaways — 3-5 bullets)                     ← 决策速览

{Opening paragraph — 1-2 sentences, include keyword}      ← SEO 首段

## Key Features
- **Feature 1** — what it does
- **Feature 2** — what it does
- **Feature 3** — what it does

## Our Take
{Opinionated review — 2-3 paragraphs with specific details, not generic praise}

## What {ToolName} Actually Does
{In-depth feature breakdown — 3-5 paragraphs}

## Pricing Breakdown
{Detailed pricing table with plan names, prices, key features}
## Who Should Use {ToolName}
- Strong fit if you: {bullet list}
- Not the best if you: {bullet list}

## vs {Competitor 1} and {Competitor 2}
{Brief comparison paragraph + link to compare pages}

## FAQ
**Question 1?** Answer.
**Question 2?** Answer.
**Question 3?** Answer.
**Question 4?** Answer.

[Visit {ToolName}](https://tool-website.com)

> We test AI tools hands-on. [Learn how we evaluate →](/how-we-test)
Last updated: YYYY-MM-DD
Disclosure: Some links may contain affiliate partnerships.
```

**Word count**: ≥800 words (not counting tables)
**Visual requirements**: Logo image embedded + Pros/Cons displayed as Markdown lists (no React components — use plain markdown only). At minimum 1 image inside article body.
**External links (≥3)**:
- [{ToolName} Official Site]({url}) — linked in "Visit {ToolName}" button
- [{ToolName} Pricing]({url}/pricing) — linked in Pricing Breakdown section
- 1 third-party source (Product Hunt / Hacker News / Reddit discussion) — linked in Our Take section

---

## 2. Compare

**Frontmatter**:
```yaml
toolA: "tool-a-slug"
toolB: "tool-b-slug"
verdict: "1-2 sentence verdict sentence. For X, choose A. For Y, choose B."
winner: "depends" | "tool-a" | "tool-b"
lastUpdated: "YYYY-MM-DD"
```

**Required Sections** (in order):
```
[Logo A]  VS  [Logo B]                                    ← 视觉

## At a Glance
|  | {Tool A} | {Tool B} |
|--|----------|----------|
| **Best for** | X | Y |
| **Price** | $X | $Y |
| **Key strength** | X | Y |

## {Comparison Angle 1}                                   ← 对比章节
{2-3 paragraphs}
**Winner: {Tool}** for {reason}.

## {Comparison Angle 2}
{2-3 paragraphs}
**Winner: {Tool}** for {reason}.

## Pricing
|  | {Tool A} | {Tool B} |
|--|----------|----------|
| **Free** | X | Y |
| **Entry** | $X | $Y |
| **Best value** | $X | $Y |

{1 paragraph pricing context}
## Who Should Choose {Tool A}
- User type / scenario
- User type / scenario

## Who Should Choose {Tool B}
- User type / scenario
- User type / scenario

## FAQ
**Q1?** A.
**Q2?** A.
**Q3?** A.
**Q4?** A.

> We test AI tools hands-on. [Learn how we evaluate →](/how-we-test)
Last updated: YYYY-MM-DD
Disclosure: Some links may contain affiliate partnerships.
```

**Word count**: ≥600 words (not counting tables)
**Visual requirements**: Dual logos embedded as Markdown images + "Winner: {Tool}" as bold text (no React components — `<WinnerBadge>` doesn't exist yet). At minimum 2 logo images.
**Pricing table**: Must use actual tool names (never "Other Tool")
**Internal links**: Link back to both tool review pages in body text
**External links (≥3)**:
- [{Tool A} Official Site]({urlA}) — linked in comparison body text
- [{Tool B} Official Site]({urlB}) — linked in comparison body text
- 1 third-party comparison/benchmark source — linked in verdict section

---

## 3. Best-of

**Frontmatter**:
```yaml
slug: "best-ai-voice-generators"
title: "Best AI Voice Generators in 2026 — Actually Tested"
description: "SEO meta description — include year + main keyword"
date: "YYYY-MM-DD"
category: "ai-voice"
author: "ToolHub Team"
relatedReviews:
  - "elevenlabs"
  - "play-ht"
  - "murf-ai"
```

**Required Sections** (in order):
```
[Hero Image]                                               ← 视觉

## The 30-Second Verdict
{Quick decision table — who each tool is best for}

| Tool | Best For | Free Tier | Starting Price | Why Skip It |
|------|----------|-----------|---------------|-------------|
| A    | X        | Yes       | $X            | Y           |

## {Tool 1}: For {Specific Use Case}
{3-5 paragraphs — what it does best, what it's bad at, who should use it}
[Read full {Tool 1} review →](/reviews/tool-1)

## {Tool 2}: For {Specific Use Case}
{...same pattern for each tool}

## How to Choose
{Decision framework — flowchart or if-then logic}

## FAQ
**Q1?** A.
**Q2?** A.
**Q3?** A.

> We test AI tools hands-on. [Learn how we evaluate →](/how-we-test)
Last updated: YYYY-MM-DD
Disclosure: Some links may contain affiliate partnerships.
```

**Word count**: ≥1000 words
**Visual requirements**: Hero image + each tool logo as Markdown image. Star ratings (★★★★☆ 8/10) as text — no `<ScoreCard>` component, that's not implemented yet.
**External links (≥3)**:
- Official sites of top 3 tools mentioned — linked on first tool name mention in body
- 1 industry stats source (Statista / Gartner / market report) — linked in intro

---

## 4. Alternative

**Frontmatter**:
```yaml
slug: "midjourney-alternatives"
title: "X Best Midjourney Alternatives in 2026"
description: "SEO meta description"
date: "YYYY-MM-DD"
category: "ai-image"
author: "ToolHub Team"
relatedReviews:
  - "..."
```

**Required Sections** (in order):
```
## Why Look for {Tool} Alternatives?
{1-2 paragraphs — pain points, pricing, feature gaps}

## Top {N} Alternatives at a Glance
| Tool | Best For | Price | Key Differentiator |
|------|----------|-------|--------------------|
| A    | X        | $X    | Y                  |

## {Alternative 1}: {Differentiator}
{2-3 paragraphs}

## {Alternative 2}: {Differentiator}
{...same pattern}

## When to Stick with {Original Tool}
{1 paragraph — honest take on when the original is still best}

## FAQ

> We test AI tools hands-on. [Learn how we evaluate →](/how-we-test)
Last updated: YYYY-MM-DD
Disclosure: Some links may contain affiliate partnerships.
```

**Word count**: ≥800 words
**External links (≥2)**:
- Original tool's official site — linked in "Why Look for Alternatives" section
- Top 2 alternatives' official sites — linked on first mention in body

---

## 5. Use Case

**Frontmatter**:
```yaml
slug: "ai-tools-for-youtubers"
title: "{N} AI Tools Every YouTuber Needs in 2026"
description: "SEO meta description"
date: "YYYY-MM-DD"
category: "ai-video"
author: "ToolHub Team"
```

**Required Sections** (in order):
```
[Hero / Scene Image]

## The Scenario: {What You're Trying to Do}
{1 paragraph painting the scene}

## The Tool Stack
| Stage | Tool | What It Does | Price |
|-------|------|-------------|-------|
| Script | A | X | $X |
| Edit | B | Y | $Y |

## Stage 1: {Workflow Step}
{2-3 paragraphs + specific tool recommendation}

## Stage 2: {Workflow Step}
{...same pattern for each stage}

## The Full Workflow
{End-to-end walkthrough tying it all together}

## FAQ

> We test AI tools hands-on. [Learn how we evaluate →](/how-we-test)
Last updated: YYYY-MM-DD
Disclosure: Some links may contain affiliate partnerships.
```

**Word count**: ≥1000 words
**External links (≥2)**:
- Official sites of tools mentioned in "Best Tools" table — linked on tool names
- 1 industry definition or research source — linked in intro

---

## 6. What Is / How-to

**Frontmatter**:
```yaml
slug: "what-is-ai-face-swap"
title: "What Is AI Face Swapping? (And Which Tool to Use)"
description: "SEO meta description"
date: "YYYY-MM-DD"
category: "face-swap"
author: "ToolHub Team"
```

**Required Sections** (in order):
```
[Concept Image]

## {What It Is / What You'll Learn}
{1-2 paragraphs — direct answer to the search query}

## {Key Concept 1}
{2-3 paragraphs}

## {Key Concept 2}
{2-3 paragraphs}

## Best Tools for {Topic}
{Table: Tool | Best For | Price | Link}

## Common Mistakes / Pitfalls
{Bullet list}

## FAQ

> We test AI tools hands-on. [Learn how we evaluate →](/how-we-test)
Last updated: YYYY-MM-DD
Disclosure: Some links may contain affiliate partnerships.
```

**Word count**: ≥800 words

---

## Internal Linking Matrix

| From | To | Where |
|------|----|-------|
| Review | Compare (same tool) | "vs Competitor" section |
| Review | Other Reviews (same category) | "See also" at bottom |
| Compare | Review (tool A) | Body first mention of tool A |
| Compare | Review (tool B) | Body first mention of tool B |
| Compare | Other Compares (same category) | FAQ or bottom |
| Blog (any) | Reviews / Compares | Tool names link to reviews |
| Blog (any) | Related Blog posts | Bottom "Related" |
