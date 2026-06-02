# 内容质量校验 SOP

> 每篇文章（review / blog）发布前必须通过以下 12 项校验。一项不过，不可提交。

---

## 校验清单

### 一、元数据完整性（6 项）

- [ ] **Frontmatter 10 字段**：slug, name, category, description, tags, url, pricing, pros, cons, bestFor 全部填写
- [ ] **URL 有效性**：`url` 字段必须以 `https://` 开头，指向官方域名
- [ ] **品类归属**：`category` 值必须在 4 个有效品类内（video-generation / ai-avatars / ai-subtitles / face-swap）
- [ ] **Slug 唯一性**：不与已有文章 slug 重复
- [ ] **Tags 相关性**：至少 2 个 tag，与工具核心功能对应
- [ ] **Pros/Cons 真实**：每条必须对应真实用户反馈或官方功能说明，不编造

### 二、内容深度（5 项）

- [ ] **字数**：800-1,200 词（简单工具可放宽至 700）
- [ ] **5 章节完整**：
  - `## What [Tool] Actually Does` — 功能原理说明
  - `## Pricing Breakdown` — 定价表格 + 性价比分析
  - `## Who Should Use [Tool]` — 适合/不适合场景
  - `## vs [Competitor]` — 至少对比 2 个同类工具
  - `## FAQ` — 至少 3 个问答
- [ ] **定价真实性**：所有价格数据来自官方定价页或 2026 年第三方评测，标注来源
- [ ] **品类特定结构**：
  - 视频生成类：What/Quality/Speed/Pricing/Who/vs/FAQ
  - AI 头像类：What/Quality/Pricing/Who/vs/FAQ
  - AI 字幕类：What/Accuracy/Features/Pricing/Who/vs/FAQ
  - 换脸类：What/Limitations/Pricing/Who/vs/FAQ
- [ ] **无废话填充**：不出现 "very"（全文 0 次），不用 "TBD/TODO/Coming soon"

### 三、语法与表达（3 项）

- [ ] **无中式英语**：无中文字符混入，无缺失冠词，无主谓不一致
- [ ] **Flesch-Kincaid 可读性**：技术工具 50-60，通用工具 60-73
- [ ] **句式多样性**：长句+短句交替，无连续 5 句以上相同结构

### 四、技术验证（3 项）

- [ ] **构建通过**：`npm run build` 零错误
- [ ] **页面 HTTP 200**：`curl -s -o /dev/null -w "%{http_code}" https://toolporto.com/reviews/[slug]` 返回 200
- [ ] **Sitemap 包含**：生产环境 sitemap.xml 包含该 review URL

---

## 验证命令速查

```bash
# 1. Frontmatter 完整性
grep -E "^(slug|name|category|description|tags|url|pricing|pros|cons|bestFor):" content/reviews/[slug].mdx | wc -l
# 期望输出: 10

# 2. 字数
wc -w content/reviews/[slug].mdx

# 3. 结构完整性
grep -c "## What.*Actually Does\|## Pricing\|## Who Should Use\|## vs \|## FAQ" content/reviews/[slug].mdx
# 期望输出: 5

# 4. "very" 检查
grep -c '\bvery\b' content/reviews/[slug].mdx
# 期望输出: 0

# 5. 中文字符
grep -cP '[\x{4e00}-\x{9fff}]' content/reviews/[slug].mdx
# 期望输出: 0

# 6. 构建
npm run build 2>&1 | grep -c "error\|✗\|❌"
# 期望输出: 0

# 7. 页面可达
curl -s -o /dev/null -w "%{http_code}" "https://toolporto.com/reviews/[slug]"
# 期望输出: 200
```

---

## 发布流程

```
研究(WebSearch) → 写作 → 自查(12项) → npm run build → curl 验证 → git commit → git push → Vercel 自动部署 → GSC 收录
```

> **红线**：自称"完成"但没有跑完上面 12 项验证命令并贴出输出的，视为未完成。
