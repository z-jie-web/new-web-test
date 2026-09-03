# Visual Enhancement

Every article must have visual elements — no pure text walls.

> ⚠️ **网络代理**：在国内网络环境下，所有 `curl` 命令必须走代理。详见 `references/network-proxy.md`。

---

## Logo Sourcing

### Source Priority
1. **Official press kit / brand assets page** — best quality
2. **Favicon** — `https://{domain}/favicon.ico` or `https://{domain}/apple-touch-icon.png`
3. **Google Images** — search "{tool name} logo png" (check license)

### Download & Store
```bash
# 代理必须！先确保已设置 PROXY_PORT 环境变量
# export https_proxy=http://127.0.0.1:${PROXY_PORT}

# Download logo to public/logos/ (with proxy)
curl -x http://127.0.0.1:${PROXY_PORT:-7890} -sL --max-time 10 -o public/logos/{slug}.png "https://{tool-website}/favicon.ico"

# Or for SVG
curl -x http://127.0.0.1:${PROXY_PORT:-7890} -sL --max-time 10 -o public/logos/{slug}.svg "https://{tool-website}/logo.svg"

# Verify file exists and is valid
file public/logos/{slug}.png
```

### Fallback: SVG Placeholder
如果代理不可用或下载失败 → **直接创建 SVG 占位 logo**，不要反复重试：
```bash
# 创建品牌色 + 首字母的 SVG
cat > public/logos/{slug}.svg << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
  <rect width="400" height="400" rx="80" fill="#{BRAND_COLOR}"/>
  <text x="200" y="215" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-size="130" font-weight="700" letter-spacing="-2">{INITIALS}</text>
  <rect x="120" y="240" width="160" height="6" rx="3" fill="white" opacity="0.3"/>
</svg>
SVGEOF
```

### Naming Convention
```
public/logos/
├── deepswapper.png
├── elevenlabs.png
├── midjourney.png
└── ...
```
File name = tool slug. No random names.

### Usage in MDX
```mdx
![DeepSwapper Logo](/logos/deepswapper.png)
```

For compare pages:
```mdx
| ![DeepSwapper](/logos/deepswapper.png) | VS | ![Reface](/logos/reface.png) |
|:--:|:--:|:--:|
| DeepSwapper | | Reface |
```

---

## Article Images

### Source Priority
1. **Official screenshots** — from tool website (no copyright issue, fair use for review)
2. **AI generated** — using `doubao-image` skill, check for watermarks before using
3. **Public domain / Unsplash** — when neither above works

### Watermark Policy
**RED LINE**: No watermarked images in published articles.
- Check every image before inserting
- If watermark found → find alternative source
- AI-generated: verify output has zero watermark artifacts

### Image Placement
Per article minimum:
- Compare: 1 comparison image (side-by-side UI or quality comparison)
- Review: 1 hero image (tool interface or branding)
- Blog: 1 hero + 1 inline diagram/illustration

### Image SEO
- File name: `{keyword}-{descriptor}.png` (e.g. `deepswapper-face-swap-quality-comparison.png`)
- Alt text: descriptive + keyword-rich
  ```
  ✅ "DeepSwapper face swap result showing skin texture detail preservation"
  ❌ "image1"
  ❌ "DeepSwapper" (too generic)
  ```
- Add ImageObject Schema to page (see `.claude/skills/toolporto-writer/references/seo-checklist.md` Section 6)

---

## MDX Visual Components

### Current Reality: Markdown Only

**The codebase does NOT have WinnerBadge / ProsCons / ScoreCard / CTABox React components.** Do not write `<WinnerBadge>` or `<ProsCons>` in MDX — they will not render. Use plain Markdown for everything:

### Winner (for Compare pages) — Use Bold Text
```mdx
**Winner: DeepSwapper** for image quality.
```
That's it. No component. If the team builds `<WinnerBadge>` later, the skill will be updated.

### Pros/Cons (for Review pages) — Use Plain Lists
```mdx
### Pros
- Pro 1
- Pro 2

### Cons
- Con 1
- Con 2
```

### Scores (for Review and Best-of pages) — Use Markdown Table + Star Text
```mdx
| Quality | Speed | Ease of Use |
|---------|-------|-------------|
| ★★★★★ 9/10 | ★★★★☆ 7/10 | ★★★★★ 9/10 |
```

### CTA (for all pages) — Use Plain Link, Mark Position
```mdx
<!-- CTA_PLACEHOLDER: deepswapper affiliate -->
[Visit DeepSwapper →](https://deepswapper.com)
```
The HTML comment is invisible. The plain link works today. When `<CTABox>` component ships, the placeholder will be auto-replaced.

### Do NOT use these (they will break the build or render as text):
- `<WinnerBadge tool="X" />`
- `<ProsCons pros={[...]} cons={[...]} />`
- `<ScoreCard scores={...} />`
- `<CTABox href="X" text="Y" />`

---

## Visual Rhythm per Article Type

### Compare Page Visual Flow
```
[Tool A Logo]  VS  [Tool B Logo]     ← 第一屏，建立信任
[At a Glance Table]                   ← 快速决策
[Comparison Image]                     ← 视觉差异
[Body Text + WinnerBadge]
[Pricing Table]
[CTA_PLACEHOLDER]
[FAQ]
```

### Review Page Visual Flow
```
[Tool Logo + Hero Image]              ← 第一屏
[TL;DR Box]                            ← 决策速览
[Pros / Cons Cards]
[Body Text + Feature Screenshots]
[Pricing Table]
[ScoreCard]
[CTA_PLACEHOLDER]
[FAQ]
```

### Blog Page Visual Flow
```
[Hero Image]                           ← 抓注意力
[Key Points / Verdict Box]
[Tool Logo + ScoreCard per tool]
[Comparison Table]
[Decision Framework Diagram]
[CTA_PLACEHOLDER]
[FAQ]
```
