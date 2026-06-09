# SEO Checklist

Apply to every article before publishing.

---

## 1. Title

- [ ] **字符数：50-65** (Google 截断在约 60 字符 / 580px)
- [ ] Primary keyword in the first 60 characters
- [ ] Title format by type:
  - Review: `{ToolName} Review (2026) — Is It Worth It?`
  - Compare: `{Tool A} vs {Tool B} (2026) — Which Is Better for {Use Case}?`
  - Best-of: `{N} Best {Category} Tools in 2026 — Actually Tested`
  - Alternative: `{N} Best {Tool} Alternatives in 2026`
  - Use Case: `{N} AI Tools Every {Role} Needs in 2026`
  - What Is: `What Is {Topic}? (And Which Tool Should You Use)`
- [ ] Include year (freshness signal)
- [ ] 验证命令: `grep '^title:' file.mdx | sed 's/title: "//;s/"$//' | wc -c` → 输出 ≤66（含换行符 1 字符）

## 2. Meta Description

- [ ] **字符数：110-160**（超过 160 会被 Google 截断）
- [ ] Include primary keyword naturally
- [ ] End with a hook or question
- [ ] Template: `{Direct answer / verdict}. We compared {tools} on {criteria} to help you decide.`
- [ ] Example: `DeepSwapper wins on quality, Reface wins on fun. We tested both on 20+ images to help you pick the right face swap tool for your needs.`
- [ ] 验证命令: `grep '^description:' file.mdx | sed 's/description: "//;s/"$//' | wc -c` → 110-161

## 3. URL Slug

- [ ] Contains primary keyword
- [ ] Lowercase, hyphens between words
- [ ] **长度：≤60 字符**
- [ ] Format by type:
  - Review: `/reviews/elevenlabs`
  - Compare: `/compare/deepswapper-vs-reface`
  - Blog: `/blog/best-ai-voice-generators`
- [ ] No stop words (the, a, and, for) unless necessary for meaning

## 4. Heading Structure

- [ ] **Exactly one H1** (= page title, frontmatter `title:`)
- [ ] **≥2 H2s**, each ≥3 词
- [ ] H2s read as a coherent outline
- [ ] **禁用裸通用词作 H2**：`## Features` `## Pricing` `## FAQ` 必须加上下文：
  - ❌ `## Features`
  - ✅ `## Key Features of ElevenLabs`
  - 唯一例外: `## FAQ`（保留，方便 Schema 识别）

## 5. Content

- [ ] **Primary keyword in first 100 words**（首段必出现）
- [ ] Primary keyword in last paragraph (FAQ can count)
- [ ] Semantic keywords throughout H2s and body
- [ ] **内链 ≥2 条** to related reviews/compares
- [ ] **正文 ≥ 目标词数**（按文章类型）
  - Compare ≥600 / Review ≥800 / Blog 800-1000

## 6. Image SEO

- [ ] **文件名规范**: `{tool-slug}.{png,svg}`，禁止 `img-001.png` `logo.png`
- [ ] **Alt 文本规范**:
  - **长度 ≥15 字符**
  - **必须含工具名 + 类型上下文**（不能是裸工具名）
  - ❌ `Google Logo` (10 字符，无上下文)
  - ❌ `ElevenLabs` (10 字符，裸名)
  - ✅ `Google Gemini Omni AI video tool logo` (37 字符，有上下文)
  - ✅ `ElevenLabs AI voice synthesis tool logo` (39 字符)
- [ ] **每篇文章 ≥1 张图片嵌入正文**
- [ ] Images 压缩到 < 200KB
- [ ] 验证命令:
  ```bash
  grep -o '!\[[^]]*\]' file.mdx  # 列出所有 alt
  # 然后逐个检查字符数 ≥15
  ```

### Image Schema Example
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "ImageObject",
  "contentUrl": "https://toolporto.com/logos/deepswapper.png",
  "name": "DeepSwapper Logo",
  "caption": "DeepSwapper AI face swap tool logo"
}
</script>
```

## 7. FAQ Schema

- [ ] FAQ section uses clear Q&A format
- [ ] Questions are real search queries (use "People Also Ask" for ideas)
- [ ] Questions are in H2 or H3 tags with answers directly following
- [ ] FAQPage Schema added to page:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Is DeepSwapper better than Reface?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "DeepSwapper produces more realistic image swaps with better skin texture and lighting matching. Reface is better for fun video swaps and social content."
    }
  }]
}
</script>
```

## 8. Structured Data (Page-Level)

- [ ] Article type:
  - Review → `Review` Schema with rating
  - Compare → `Article` Schema
  - Blog → `Article` or `BlogPosting` Schema
- [ ] BreadcrumbList Schema
- [ ] Organization/WebSite Schema (on homepage only)

### Review Schema Example
```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {"@type": "SoftwareApplication", "name": "DeepSwapper"},
  "reviewRating": {"@type": "Rating", "ratingValue": "9.2"},
  "author": {"@type": "Organization", "name": "ToolPorto"}
}
```

## 9. Internal Linking

- [ ] ≥2 contextual internal links (not just navigation)
- [ ] Link text is descriptive (not "click here"):
  - Good: `[our full ElevenLabs review →](/reviews/elevenlabs)`
  - Bad: `[click here](/reviews/elevenlabs)`
- [ ] Links to related compares from review pages
- [ ] Links to both reviews from compare pages

## 10. Performance

- [ ] Page loads in < 2s (Next.js SSG handles this)
- [ ] Build output confirms static generation
- [ ] `npm run build` passes without errors

## 11. External Link Validation

- [ ] **≥3 external links** (review/compare/blog), **≥2** (alternative/use-case/what-is)
- [ ] **≥1 link to a non-tool-official-site** (third-party authoritative source)
- [ ] All external links use descriptive anchor text (not "click here"):
  - Good: `[ElevenLabs pricing page](https://elevenlabs.io/pricing)`
  - Bad: `[click here](https://elevenlabs.io)`
- [ ] No bare URLs in body text
- [ ] Third-party sources are real pages (verified with WebFetch)
- [ ] External links open in same tab (not `target="_blank"`)
- [ ] 验证命令:
  ```bash
  grep -oP 'https?://[^\s\)]+' file.mdx | wc -l  # → ≥3 for review/compare/blog
  grep -oP '\[.*?\]\(https?://[^\s\)]+\)' file.mdx  # check all link texts are meaningful
  ```
