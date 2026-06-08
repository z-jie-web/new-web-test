# Topic Engine

Heat-driven topic generation for ToolPorto. Priority = external buzz + SEO opportunity. Ignore competition difficulty.

> ⚠️ **网络代理**：所有外部数据源访问（WebFetch、WebSearch、curl）必须走本地代理。操作前先确认 `https_proxy` 已设置。详见 `references/network-proxy.md`。

---

## Data Sources

| Source | URL / Method | What to Extract | Priority Weight | Proxy Required |
|--------|-------------|-----------------|-----------------|----------------|
| Product Hunt | WebFetch `producthunt.com` → AI category | Trending AI tools, launch dates, upvote counts | High | ✅ WebFetch |
| X / Twitter | WebSearch "AI tool" + "AI review" + "{category} AI" | Discussion volume, sentiment, new launches | High | ✅ WebSearch |
| Reddit | WebFetch `reddit.com/r/artificial` 等 | Hot posts, tool mentions, pain points | Medium | ✅ WebFetch |
| Hacker News | WebFetch `news.ycombinator.com` → search AI | Front page items, comment depth | Medium | ✅ WebFetch |
| Google Trends | WebFetch `trends.google.com` → compare tool names | Search volume trend (rising/falling) | Validation | ✅ WebFetch |
| Site Internal | `ls content/reviews/` `ls content/compare/` | Missing C(n,2) pairs, uncategorized tools | Base coverage | ❌ 本地 |

---

## Universal Rule: No Review → No Compare Without It

**This applies to ALL layers. If any topic involves a tool that doesn't have a Review page yet, the Review MUST be written as part of the same batch.**

```
Topic includes Tool X → Tool X has Review? → YES → Write Compare
                                         → NO  → Write Review FIRST, then Compare
```

Example: User wants "ElevenLabs vs Microsoft AI Voice" but Microsoft AI Voice has no review.
→ Batch becomes: 1) Microsoft AI Voice Review + 2) ElevenLabs vs Microsoft AI Voice Compare
→ Do NOT silently downgrade to Blog. Fix the gap.

---

## Hub & Spoke Matrix Planning (Required for every topic)

**Why**: Isolated articles don't compound. Hub-and-spoke architecture passes link equity inward and lets one strong long-form piece pull traffic that flows out to dozens of supporting pages.

**Classify every topic as one of:**

| Role | Type | Word count | Internal-link role |
|------|------|-----------|--------------------|
| **Hub** | Best-of / Category Guide | ≥3000 | Outbound to many spokes |
| **Spoke** | Review / Compare / Alternative | 800-1500 | Inbound to one hub |
| **Connector** | What-is / How-to | 1000-2000 | Sits between hub and spoke |

**Before writing, answer 3 questions:**

1. **Which hub does this support?** (If none exists, the new piece should probably BE the hub.)
2. **Which existing spokes will this link to?** (Min 2 in body.)
3. **Which existing spokes should link back to this?** (Min 2 — execute in Phase 8.)

If you can't answer all 3, the topic isn't ready. Pick a different one or write the missing hub first.

**Example matrix for ai-voice category:**
```
HUB:   /blog/best-ai-voice-generators (3500 words, links to all spokes)
   ├── /reviews/elevenlabs
   ├── /reviews/play-ht
   ├── /reviews/murf-ai
   ├── /compare/elevenlabs-vs-play-ht
   ├── /compare/elevenlabs-vs-murf-ai
   └── /blog/elevenlabs-alternatives (also a mini-hub)
```

---

## Competitive SERP Check (Required before committing)

Before writing, **fetch Google's top 10 results for the target query** and assess whether you can win.

**How** (use WebFetch tool):

```
Query: "{target keyword}"
Capture for each top-10 result:
  - Domain (Forbes/TechCrunch = hard, independent blog = easier)
  - Word count estimate
  - Last updated date
  - Content depth (FAQ count, structure)
```

**Decision matrix:**

| Top 10 dominated by | Action |
|---------------------|--------|
| Big media (Forbes, TechCrunch, Wired) | SKIP — can't outrank with our DA |
| Listicles / round-ups under 1500 words | WRITE — beat them on depth (3000+) |
| Outdated content (2023 or older) | WRITE — freshness wins easy |
| Reddit / YouTube only | WRITE — content gap exists |
| Niche blogs with thin coverage | WRITE — beat them on EEAT |

**Skip rules (don't write):**
- 8+ of top 10 are .gov / .edu / Wikipedia
- Top 3 are all from same publication with 5000+ words each
- Featured Snippet held by same site for 2+ years

---

## 3-Layer Generation

### Layer 1: New Tool Trigger
**When**: User says "加了工具 X" or "新增 {Tool}"

**Auto-generate**:
1. 1 × Review: `content/reviews/{tool-slug}.mdx`
2. N × Compare: `{tool-slug}-vs-{existing-tool}.mdx` (one per existing tool in same category)

```
If category has 5 tools already:
  → 1 review + 5 compare articles = 6 articles total
  → Present as topic list, let user select which 2 to write first
```

### Layer 2: Category Gap Fill
**When**: User says "有什么话题" or "帮我找找要写的"

**Scan logic**:
1. List all categories: `ls content/categories/`
2. For each category, list tools: `ls content/reviews/ | grep -l "category: {cat}"`
3. Calculate missing C(n,2) pairs
4. List missing pairs as potential topics

```
Category: face-swap (6 tools, 15 pairs)
Already covered: 15/15 ✅
Missing: 0

Category: ai-video (7 tools, 21 pairs)
Already covered: 18/21
Missing: 3 pairs → recommend as topics
```

### Layer 3: Heat-Driven Discovery
**When**: User asks for hot topics

**Process**:
1. Check Product Hunt AI category → trending tools this week
2. Search X for "{tool name} AI review" → discussion volume
3. Check Reddit front pages of relevant subreddits
4. Validate with Google Trends → is interest rising?
5. Filter: site already has content? → skip
6. Filter: estimated search volume < 100/mo? → skip
7. Output: 2-4 topic suggestions

---

## Output Format

Present to user as:

```
🔥 话题建议（选 2 篇开始）：

1. [Review] Suno AI Review — Is It the Best AI Music Generator?
   → 热度来源：Product Hunt #1 this week + 10K+ X mentions
   → ~800 词 / content/reviews/suno-ai.mdx

2. [Compare] Suno AI vs Udio — Which AI Music Tool Wins?
   → 热度来源：Reddit r/aiMusic 热帖 (2.3K upvotes)
   → ~600 词 / content/compare/suno-ai-vs-udio.mdx

3. [Best-of] 4 Best AI Music Generators Actually Worth Using
   → 热度来源：Google Trends "AI music generator" ↑ 180%
   → ~1000 词 / content/blog/best-ai-music-generators.mdx

4. [Category Gap] Mubert vs Soundraw — missing compare pair
   → 来源：ai-music 分类补位
   → ~600 词 / content/compare/mubert-vs-soundraw.mdx
```

---

## Filtering Rules

| Rule | Action |
|------|--------|
| Search volume < 100/month | Skip (not worth the effort) |
| Tool has < 10K users / no community | Skip unless Layer 1 trigger |
| Topic already covered on site | Skip (unless update needed) |
| Tool is too niche / unknown category | Flag as "low priority" |
| Google Trends shows declining interest | Skip |
| X/Reddit/HN discussion < 100 mentions | Lower priority |

---

## Frequency

- **New tool added**: Immediate — Layer 1 auto-trigger
- **User asks for topics**: Run Layer 2 + Layer 3
- **Proactive check** (user hasn't asked): Don't — wait for user trigger. Don't generate topics unsolicited.
