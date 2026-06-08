# Phase 8: 发布后闭环

文章发布 + 部署不是终点。Phase 8 是"发布后让流量真正涌入"的关键环节。**漏掉这一步，文章就是孤岛**。

> ⚠️ **网络代理**：IndexNow ping 需要走代理。详见 `references/network-proxy.md`。

---

## 必做四件事

### 1. 反向内链更新（最关键，强制执行）

新文章发布后，**老文章里能链向它的位置必须打开**。否则新文章就是 SEO 孤岛。

**🚨 强制第一步：跑 find-link-ops.sh**

```bash
bash scripts/find-link-ops.sh <new-article-slug-or-path>
```

这个脚本会：
- 自动找出同分类所有老文章
- 检查哪些已经链向新文章，哪些还没
- 输出 MISSING（需要加链接的）和 ALREADY_LINKED（已经有的）
- 退出码 0 = 所有候选都已链接；退出码 1 = 有遗漏待补

**必须把脚本输出贴出来作为证据。** 根据 MISSING 列表逐个加链接。

**操作流程：**

```bash
# Step 1: 跑 find-link-ops.sh 获取候选列表
bash scripts/find-link-ops.sh content/reviews/sora-2.mdx

# Step 2: 对每个 MISSING 候选文件，找适合插入新文章名的位置
# - Best-of 文章：加入工具列表
# - Alternative 文章：加入备选项列表
# - 同类 Review：在 "vs Competitors" 章节提一句
# - 同类 Compare：在 "FAQ" 章节加 "What about Sora 2?"
```

**强制要求：**
- 新 Review → 至少 3 个老文章里加反向链接
- 新 Compare → 在两个工具的 Review 页 "vs" 章节都加链接
- 新 Blog → 链接到的所有 Review 也得能从 Review 反向链回 Blog

**证据：** 列出每个被修改的老文件路径 + 新加的链接文本。

---

### 1.1 反向内链策略（防老文章膨胀）

**核心原则：编辑替换 > 自然提及 > 新增条目。禁止全分类每篇都加。**

每次新增工具，`find-link-ops.sh` 会列出同分类所有老文章（MISSING 列表）。但你不能每篇都加——老文章会膨胀成一个链接农场。

| 优先级 | 策略 | 操作 | 适用条件 |
|--------|------|------|----------|
| **P0: 编辑替换** | 老文章已用文字提到该工具名（外链或无链接），只把文字转内链 | 替换，零增量 | grep 发现老文章已有工具名，但链接缺失或外链 |
| **P1: 自然提及** | 在 vs 段/备选列表/FAQ 中加入一句，替换掉同等长度的旧文字 | 替换，净增 ≈0 | 工具确实和老文章的使用场景产生分叉 |
| **P2: 新增条目** | 在 "not the best choice" 列表或相关工具链中加一行 | 新增 1 行 | 仅当老文章现有条目 ≤5 条 |
| **禁止** | 全分类每篇加；文章末尾堆砌链接；Hub blog 机械追加表格行 | — | — |

**实施步骤：**

```
Step 1: 跑 find-link-ops.sh，拿到 MISSING 列表
Step 2: 对每个 MISSING 候选，先 grep 检查老文章是否已有文字提及该工具名
        → 有提及 → P0 编辑替换（零增量）
        → 无提及 → 判断 P1（替换旧文字）或 P2（新增 1 行）
Step 3: 筛选：单次最多在 3-5 篇老文章中留反向链接（含编辑替换）
        超过 5 篇 → 说明没筛选，退回重新精选
```

**筛选标准**（选哪 3-5 篇加反向链接）：
1. 同分类 Hub blog（best-of 类）— 必加，融入正文而非机械追加
2. 直接竞品 Review — 在 vs 段自然提及
3. 使用场景互补的工具 — 在 "not the best choice" 或 FAQ 提一句
4. 其余老文章 — 不加。等它们自己更新时自然会提到新工具

---

### 2. 主动 Ping 搜索引擎

新文章发布、sitemap 更新后，**主动告诉 Google + Bing**，否则可能 2-4 周才被发现。

```bash
# Google: 自从 2023 年废弃了 ping API，现在靠 GSC 提交 sitemap
# 但每次推送会让 GSC 重新爬 sitemap
# 验证：登录 GSC → URL Inspection → Test Live URL

# Bing IndexNow（推荐，2024+ 生效）— 走代理
curl -x http://127.0.0.1:${PROXY_PORT:-33210} -X POST "https://www.bing.com/indexnow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "toolporto.com",
    "key": "YOUR_INDEXNOW_KEY",
    "keyLocation": "https://toolporto.com/YOUR_INDEXNOW_KEY.txt",
    "urlList": [
      "https://toolporto.com/reviews/sora-2",
      "https://toolporto.com/sitemap.xml"
    ]
  }'
```

**注意：** IndexNow 需要先在网站根目录放一个 key 文件验证所有权。**等你拿到 IndexNow key 后再启用此步**，目前先确认 sitemap 自动更新即可。

---

### 3. 社媒分享 / Reddit 提示

文章上线后，告诉用户（或自己）哪些渠道可以扩散。

| 渠道 | 适合的文章类型 | 提示文案模板 |
|------|---------------|-------------|
| Reddit r/{category} | Review / Compare | "Tested {Tool} for 2 weeks — here's what surprised me" |
| Hacker News | What is / 技术深度 | "Show HN: {Topic}" |
| X / Twitter | Best-of / Alternative | 配 OG 图发推 |
| Indie Hackers | 创业相关 | 增长故事角度 |

**强制要求：** Phase 8 输出至少 1 条针对该文章的具体分享文案（不是模板）。

---

### 4. 数据回流（条件触发）

如果 GA4 / GSC 已接入：
- 文章发布 4 周后，检查 GSC 是否被收录
- 检查 GA4 该 URL 流量、停留时间、跳出率
- 如果 4 周仍未收录 → 必须排查（可能是 noindex / canonical / robots 问题）

---

## Phase 8 证据要求（红线 6 适用）

```
📊 Phase 8 — 发布后闭环证据：
  - find-link-ops.sh 输出（完整粘贴）
  - 反向内链清单：{老文件路径}: 加了 "{链接文本}" 链向 /{type}/{new-slug}
  - 至少 3 处修改
  - sitemap 更新后 git status 输出
  - 至少 1 条社媒分享文案
  - （如已接 GSC）IndexNow API 调用结果
```

**没有证据 = 文章未发布完成。**
