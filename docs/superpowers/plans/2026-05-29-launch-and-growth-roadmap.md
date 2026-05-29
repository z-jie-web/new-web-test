# ToolHub 上线及增长路线图

> **当前状态**：代码已推送到 GitHub，尚未部署，0 流量。
> **目标**：3 个月内月访问 5000+，收到第一笔 affiliate 佣金。

---

## 第一阶段：部署上线（今天完成）

### 1.1 Vercel 部署

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 账号登录
2. 点击 "Add New Project" → 选择 `new-web-test` 仓库
3. 框架自动识别 Next.js，无需改任何配置
4. 添加环境变量：
   ```
   NEXT_PUBLIC_SITE_URL = https://你的域名.com
   ```
5. 点击 Deploy，等待 2 分钟构建完成
6. 记录 Vercel 给的默认域名（xxx.vercel.app）

### 1.2 DNS 配置（如果有自己的域名）

1. 在 Vercel 项目 → Settings → Domains → 添加你的域名
2. 去域名注册商（Namecheap/Cloudflare 等）修改 DNS：
   - 方式 A（推荐）：NS 记录指向 Vercel 的 nameserver
   - 方式 B：添加 CNAME 记录指向 `cname.vercel-dns.com`
3. 等待 DNS 生效（1-24 小时）
4. 在 Vercel 的 Domains 页面点 "Refresh"，确认状态变绿

### 1.3 部署后验证清单

- [ ] 访问首页，确认正常加载
- [ ] 随机点 5 个 review 页面，确认 200
- [ ] 访问 `/sitemap.xml`，确认列出所有 URL
- [ ] 访问 `/robots.txt`，确认内容正确
- [ ] 访问 `/llms.txt`，确认返回内容
- [ ] `curl -I https://你的域名.com` 确认 HTTPS 生效
- [ ] 检查 `og:title` 和 `twitter:card` meta 标签

---

## 第二阶段：搜索引擎收录（上线后第 1-3 天）

### 2.1 Google Search Console

1. 打开 [search.google.com/search-console](https://search.google.com/search-console)
2. 添加资源 → 选择 "Domain" 方式（推荐）或 "URL prefix"
3. 验证域名所有权：
   - 如果域名在 Cloudflare：直接一键验证
   - 其他：按提示添加 TXT 记录或 HTML 文件
4. **提交 Sitemap**（最重要的一步）：
   - 左侧菜单 → Sitemaps → 输入 `sitemap.xml` → 提交
   - 确认状态显示 "Success" 且 URL 数量为 86

### 2.2 Bing Webmaster Tools

1. 打开 [bing.com/webmasters](https://www.bing.com/webmasters)
2. 可以直接导入 GSC 数据（如果已用同个 Google 账号）
3. 同样提交 sitemap

### 2.3 手动提交关键页面（加速收录）

在 GSC 顶部搜索栏，逐个粘贴以下 URL，点 "Request Indexing"：

```
/（首页）
/categories/video-generation
/categories/ai-avatars
/categories/ai-subtitles
/categories/face-swap
/reviews/heygen
/reviews/kling-ai
/reviews/capcut-international
/reviews/facefusion
/reviews/runway-gen-3
```

只手动提交 10 个最重要的页面，其余 76 个等 Google 通过 sitemap 自己爬。

---

## 第三阶段：内容扩充（上线后第 1-4 周）

### 3.1 扩充优先级

按搜索量从高到低，每周扩充 5-6 篇：

**第 1 周（5 篇，月搜索量最高）：**
- [ ] CapCut International（4470万月访问，极高搜索量）
- [ ] HeyGen（1024万月访问，增长中）
- [ ] Kling AI（1377万月访问，TOP 1 排名）
- [ ] Runway Gen-3（843万月访问，稳定搜索）
- [ ] PixVerse（709万月访问）

**第 2 周（6 篇）：**
- [ ] FaceFusion（GitHub 3万+ Star）
- [ ] Topaz Video AI（330万月访问）
- [ ] Descript（317万月访问）
- [ ] Synthesia（$1亿 ARR）
- [ ] VEED
- [ ] Captions

**第 3 周（6 篇）：**
- [ ] Pika 2.0
- [ ] Luma Dream Machine
- [ ] InVideo AI
- [ ] Reface
- [ ] Kapwing
- [ ] Happy Scribe

**第 4 周（5 篇）：**
- [ ] D-ID
- [ ] DeepSwapper
- [ ] Swapface
- [ ] FaceMagic
- [ ] Remaker Face Swap

### 3.2 每篇扩充模板（目标 800-1200 词）

每个 review 需要增加以下章节：

```markdown
## Quick Verdict
50-80词，一句话总结 + 最适合谁用 + 核心卖点。用户30秒看完就能做决定。

## Hands-On Experience
150-200词，写实际使用感受。不要复述官方功能列表，写"用了之后什么感觉"。
- 上手门槛：几分钟能用？需要教程吗？
- 输出质量：和预期差多少？什么场景表现好/差？
- 速度和性能：快不快？会不会卡？

## Pricing Breakdown
100-150词，展开每个套餐的具体内容、限制、性价比判断。
- 免费版能用什么？有什么限制（水印/时长/分辨率）？
- 付费版哪个最划算？为什么？
- 有没有隐藏费用？

## vs Alternatives
80-120词，快速对比 1-2 个同类工具的核心差异。一句话点出"选A不选B"的理由。

## Who Should Use It / Who Should Skip
100-150词，帮用户做决策。
- 最适合：3个具体场景/人群
- 不建议：3个不适合的场景/人群

## FAQ
80-100词，回答 3 个用户真实会搜索的问题。
```

### 3.3 内容扩充辅助脚本

用以下 prompt 对每个 review 批量生成扩充内容。在 Claude Code 中执行：

```
读 content/reviews/heygen.mdx 当前内容，
扩充到 1000 词左右，按以下结构：
1. Quick Verdict（80词）
2. Hands-On Experience（200词，写实际使用感受，不要编造具体数值）
3. Pricing Breakdown（150词，基于已知的定价信息展开）
4. vs Alternatives（120词，对比 Synthesia 和 D-ID）
5. Who Should Use / Skip（150词）
6. FAQ（100词，3个问题）
保留现有的 pros/cons/bestFor frontmatter，只扩充 MDX body。
```

---

## 第四阶段：流量监控和数据迭代（持续进行）

### 4.1 每周用 GSC 检查的指标

| 指标 | 看什么 | 行动信号 |
|------|--------|---------|
| 总展示次数 | 是否在增长 | 如果 4 周不涨，检查收录状态 |
| 平均排名 | 是否在上升 | 排名 > 20 的词，优先扩充那篇内容 |
| 点击率(CTR) | 是否 > 2% | < 1% 的需要优化 title 和 description |
| 新收录页面数 | 是否在增加 | 如果没有新收录，手动提交 |

### 4.2 GSC 数据驱动的内容迭代

```
① 每周末打开 GSC → Performance → 按 Query 排序
② 找出展示量最高的 10 个查询词
③ 检查这些词的排名：
   - Top 5-10：该篇 review 加内链，从其他页面链过来
   - Top 10-20：扩充该篇内容到 1200 词+
   - Top 20-50：检查标题是否匹配搜索意图
④ 找出展示量低但 CTR 高的词 → 这些是内容不够长尾，扩充该页
```

### 4.3 UTM 追踪 Affiliate 链接

所有外部链接加 UTM 参数，方便追踪哪个页面带来点击：

```
/tools/review/[slug] 中的 affiliate 链接格式：
https://example.com?utm_source=toolhub&utm_medium=affiliate&utm_campaign=[slug]
```

---

## 第五阶段：变现启动（第 2-3 个月）

### 5.1 Affiliate 申请

| 平台 | 申请条件 | 覆盖工具 |
|------|---------|---------|
| Impact / PartnerStack | 免费注册 | HeyGen, Synthesia, VEED 等 SaaS 工具 |
| ShareASale | 免费注册 | 各类软件 affiliate |
| 直接联系工具方 | 发邮件询问 | 小工具可能有私有 affiliate 计划 |

**邮件模板**：
```
Subject: Affiliate partnership inquiry — ToolHub

Hi [Tool Name] team,

I run ToolHub ([URL]), a curated tools directory.
We're about to publish an in-depth review and comparison of [Tool Name].
Currently getting indexed in Google and growing.

Do you have an affiliate or referral program? We'd love to
partner and drive qualified traffic your way.

Best,
[Name]
```

### 5.2 Google AdSense 申请

**申请时机**：内容扩充到每篇 800 词以上，至少 20 篇完成后。

**在 Vercel 上添加 ads.txt**：
创建 `public/ads.txt` 文件：
```
google.com, pub-你的发布商ID, DIRECT, f08c47fec0942fa0
```

**注意事项**：
- 申请前确保 About/Privacy/Disclaimer 页面完备
- 首页和 review 页要有足够文字（不要大片空白）
- 如果被拒，添加更多原创内容后重新申请

---

## 第六阶段：Blog 内容和外链（第 2-6 个月）

### 6.1 Blog 选题方向

Blog 文章瞄准信息类长尾关键词（review 是交易类）：

| 文章类型 | 关键词模式 | 例子 |
|---------|-----------|------|
| 教程/How to | "how to [do X]" | "How to Add Auto Captions to TikTok Videos" |
| 合集/Roundup | "best [N] tools for [X]" | "10 Best AI Video Generators for Social Media in 2025" |
| 对比/Comparison | "[A] vs [B]" | 已通过 /compare 路由覆盖 |
| 问题解答 | "why / what is [X]" | "What Is AI Video Upscaling and Does It Really Work" |
| 趋势/分析 | "[topic] trends" | "AI Video Generation Trends 2025" |

### 6.2 外链获取策略

| 方式 | 难度 | 效果 | 怎么做 |
|------|------|------|--------|
| Product Hunt 发布 | 低 | 中 | 做一个免费小工具，附带网站链接 |
| Hacker News 分享 | 中 | 高 | 写一篇有数据/观点的博文，分享出去 |
| 工具方的 "As seen on" 页面 | 低 | 中 | 发邮件给收录的工具方，告知已被评测 |
| Reddit 相关 subreddit | 低 | 低 | 在 r/VideoEditing 等社区自然参与 |
| Guest post | 高 | 高 | 给相关博客投稿，换取一条外链 |

---

## 三个月的目标里程碑

| 时间 | 内容目标 | 流量目标 | 收入目标 |
|------|---------|---------|---------|
| 上线日 | 22 篇 review 上线，站点可访问 | 0，GSC 提交 sitemap | $0 |
| 第 2 周 | 扩充 11 篇到 800 词+ | GSC 展示量开始出现 | $0 |
| 第 4 周 | 全部 22 篇扩充完毕 | 日展示 100+，开始有关键词排名 | $0 |
| 第 8 周 | 发布 5 篇 blog，20 篇 review 800 词+ | 日展示 500+，月访问 2000+ | $0-5 |
| 第 12 周 | 20+ 篇 blog，50+ 篇深度内容 | 月访问 5000+，Adsense 审核通过 | $20-50 |

---

## 当前需要立即执行的

按顺序，今天完成：
1. Vercel 部署（10 分钟）
2. GSC 提交 sitemap（5 分钟）
3. 手动提交 10 个关键页面（5 分钟）
4. 开始第 1 周 5 篇 review 扩充
