---
name: toolporto-writer
version: 1.3.0
description: "ToolPorto 英文 AI 工具文章写作系统 — 话题生成 → 写作 → 视觉增强 → 去 AI 味 → SEO 校验 → 质量门禁 → 三角色自检 → 发布后闭环 → 交付报告。9 Phase + 9 Gate 强制不可跳过。"
author: toolporto
license: MIT
tags:
  - content
  - writing
  - seo
  - english
  - ai-tools
  - affiliate
---

# ToolPorto Writer — 英文 AI 工具文章写作系统

## 网站目标与定位

**ToolPorto (toolporto.com)** 是面向海外英文用户的 AI 工具评测与推荐平台。

**变现方式**：流量广告 + 联盟营销返佣（affiliate）。
**目标用户**：开发者和内容创作者为主，覆盖所有寻找 AI 工具的英文用户。
**风格基调**：专业但不学术，有观点不中性，像懂行的朋友推荐工具——不是百科式介绍。

## When to Activate

Trigger when the user mentions:
- "写文章" / "write article" / "create content"
- 提到具体工具名 + 暗示写文章（"写一篇 X 的测评"）
- "有什么热点可以写" / "最近有什么话题"
- "加一个新工具" / "新增工具 X"
- "更新文章" / "refresh content"

## 网络代理（全局前置）

> 参考：`references/network-proxy.md`

**在国内网络环境下，所有外部网络访问（WebFetch、WebSearch、curl 下载 logo、IndexNow ping）必须通过本地代理。**

每轮写作开始前，自动执行代理检测：

```bash
# 自动检测艾可云代理端口（HTTP: 33210, SOCKS: 33211）
curl -x http://127.0.0.1:33210 -sI https://www.google.com --max-time 5 > /dev/null && export PROXY_PORT=33210 && export https_proxy=http://127.0.0.1:33210 && echo "✅ 艾可云 HTTP 代理可用: 33210" || \
curl -x socks5://127.0.0.1:33211 -sI https://www.google.com --max-time 5 > /dev/null && export PROXY_PORT=33211 && export https_proxy=socks5://127.0.0.1:33211 && echo "✅ 艾可云 SOCKS 代理可用: 33211" || \
echo "⚠️ 代理不可用，提示用户开启艾可云"
```

**检测到代理后**：`export https_proxy=http://127.0.0.1:${PROXY_PORT}` 全 session 生效。
**未检测到**：提示用户 "艾可云代理未开启，是否继续（可能网络受限）？"

---

## 8-Phase Workflow

> 🚨 **PHASE GATE SYSTEM ACTIVE**
> 
> 以下 8 个 Phase **必须按顺序执行**。每个 Phase 之间有 Gate（详见下方"Phase Gate 强制执行系统"）。
> Gate 不通过 → 停在该 Phase 修复 → 禁止前进。禁止跳 Phase。禁止"先前进再回来补"。
> 
> **如果在任何时刻你产生"这个 Phase 可以跳过"的念头——你不可以。**
> 
> **每个 Phase 完成后必须输出 `🔒 Gate N PASS → 进入 Phase N+1` 标记。** 不输出就是没通过。

### Phase 1: 话题生成

> 参考：`references/topic-engine.md`

**🚨 强制前置脚本（必须先跑，贴输出证据）：**

```bash
# 1. 查重 — 避免写重复话题
bash scripts/check-duplicate.sh "<topic-name>"

# 2. 分类健康度 — 了解当前各分类覆盖情况
bash scripts/category-stats.sh
```

**这两个脚本的输出必须完整粘贴。** 不贴 = Phase 1 未执行，退回重做。

- `check-duplicate.sh` 退出码 0 = 无冲突，可以写；退出码 1 = 有相似话题，需要判断；退出码 2 = 完全重复，禁止写
- `category-stats.sh` 展示各分类的 review/blog/compare 数量 + 健康度指标（🟢≥8 🟡4-7 🔴<4），帮判断该补哪个分类

**数据源**（热度驱动，不看竞争度。🚨 全部走代理，先确保 `https_proxy` 已设置）：

| 来源 | 用途 | 代理方式 |
|------|------|----------|
| Product Hunt | WebFetch `producthunt.com` → AI 分类 Trending | WebFetch（走系统代理） |
| X / Twitter | WebSearch "AI tool" + 具体工具/分类名 | WebSearch（走系统代理） |
| Reddit | WebFetch `reddit.com/r/artificial` 等 | WebFetch（走系统代理） |
| Hacker News | WebFetch `news.ycombinator.com` → 搜 AI | WebFetch（走系统代理） |
| Google Trends | WebFetch `trends.google.com` 验证搜索趋势 | WebFetch（走系统代理） |
| 站内已有数据 | 分类 C(n,2) 补位 | ❌ 不需要代理 |

**外部搜索标准流程**（3 步，缺一不可）：
```bash
# Step 1: 确认代理在线
curl -x http://127.0.0.1:${PROXY_PORT:-33210} -sI https://www.google.com --max-time 5 | head -1

# Step 2: WebSearch（Claude Code 内置，走系统代理）
# 搜索热点："{category} AI tools 2026" / "{tool name} review" / "best {category} AI"

# Step 3: WebFetch（Claude Code 内置，走系统代理）
# 拉 Product Hunt AI 分类页 / Reddit 热帖 / Hacker News 首页
```

**三大触发场景：**

1. **新工具加入** — 用户说"加了工具 X"
   → 自动列出：1 篇 review + 同分类所有 vs 对比文章

2. **热点驱动** — 用户说"有什么话题"
   → 🚨 先确认代理在线（`curl -x http://127.0.0.1:${PROXY_PORT} -sI https://www.google.com`）
   → WebSearch + WebFetch 从 Product Hunt / Reddit / X / HN 拉热点
   → 筛选 → 列出 2~4 个话题选项
   → 每条标注：热度来源 / 建议文章类型 / 预估词数
   → 代理不可用时：降级为站内 C(n,2) 补位模式

3. **分类补位** — 分类内 C(n,2) 未覆盖
   → 列出缺失的对比 / best-of 文章

**输出格式**：
```
🔥 话题建议（选 2 篇开始）：
1. [文章类型] 标题 → 热度来源 → ~预估词数
2. [文章类型] 标题 → 热度来源 → ~预估词数
```

**筛选红线**：搜索量 < 100/月的长尾词不写。

**Hub/Spoke 强制规划**（参考 `references/topic-engine.md`）：
- 每个话题必须明确角色：Hub（≥3000 词）/ Spoke（800-1500）/ Connector
- 答出 3 个问题：支撑哪个 hub？链向哪 2+ 个 spoke？哪 2+ 个 spoke 反链回来？

**SERP 竞品分析强制做**：
- 用 WebFetch（自动走系统代理）拉 Google top 10 看竞品 — 大媒体满屏 → 跳过；榜单短或过期 → 写
- 如果 WebFetch 返回网络错误 → 先确认代理已开（`curl -x http://127.0.0.1:${PROXY_PORT} -sI https://www.google.com`）→ 重试
- 代理不可用时的降级：用 WebSearch（同样走代理）替代，覆盖 SERP 数据源


### Phase 2: 写作

> 参考：`references/article-templates.md`

**一次写 2 篇**，套用对应模板。不要多写，写完自检。

**六种文章类型**：
| 类型 | 目录 | 最小词数 |
|------|------|---------|
| Review | `content/reviews/` | ≥800 |
| Compare | `content/compare/` | ≥600 |
| Best-of | `content/blog/` | ≥1000 |
| Alternative | `content/blog/` | ≥800 |
| Use Case | `content/blog/` | ≥1000 |
| What Is / How-to | `content/blog/` | ≥800 |

**写作核心原则**：
- **话题涉及新工具 → 必须先写 Review，再写 Compare**。不存在的工具 Review 自动纳入本批写作。严禁降级为 Blog 绕过。
- 所有必须章节存在，零占位符
- 内链自动建立（review ↔ compare 双向链接）
- CTA 位置后续由模板统一注入，当前不写占位标记（HTML 注释在 MDX v3 中会编译失败）
- EEAT 信号：底部标注 "Last updated" + "How we test" 链接
- **`lastUpdated` 字段必填**：ISO 8601 格式（`2026-06-05T12:00:00Z`），用于列表排序

### Phase 3: 视觉增强

> 参考：`references/visual-enhance.md`

**每篇文章插入**：
1. 工具 Logo（从官网 favicon/press kit 获取 → `public/logos/{slug}.png`）
2. ≥1 个视觉组件（WinnerBadge / ProsCons / ScoreCard）
3. 配图（官网截图优先 → 无版权问题；doubao-image 生成 → 须无水印）
4. 无需 CTA 占位（后期统一加）

**Logo 下载**（代理必须）：
```bash
# 所有 curl 命令必须走代理
curl -x http://127.0.0.1:${PROXY_PORT} -sL --max-time 10 -o public/logos/{slug}.png "https://{domain}/favicon.ico"
```
如果代理不可用 → 创建 SVG 占位 logo（品牌首字母 + 品牌色），确保文章不缺图。

**图片 SEO**：
- 文件名用关键词：`deepswapper-logo.png` 而非 `img001.png`
- alt 文本含目标关键词
- ImageObject Schema 标记

### Phase 4: 去 AI 味

> 参考：`references/anti-ai-patterns-en.md`

**四步流程**：

1. **诊断** — 扫描英文 AI 模式 → 输出 AI 味等级（高/中/低）+ 主要问题
2. **去模板** — 删机械连接词、套话、教科书语气
3. **加细节** — 至少 2 个真实细节（时间/数字/场景）
4. **立观点 + 给动作** — 明确站位 + 可执行建议

**人格注入**：
- 有态度（"This surprised me" / "Honestly, we expected better"）
- 有节奏（短句 + 长句交替，不打官腔）
- 有具体场景（"If you're editing a 30-minute YouTube video every week..."）
- 敢推荐也敢不推荐

**自审**：写完问自己 "What makes this obviously AI-generated?" → 修到答不上来。

### Phase 5: SEO 校验

> 参考：`references/seo-checklist.md`

- 标题含主关键词（前 60 字符）
- meta description 110-160 字符
- H2 含语义相关词
- 首段 100 字内含目标关键词
- 内链 ≥2 条
- FAQ 用结构化 Q&A
- 图片 alt 含关键词 + 文件名含关键词

### Phase 6: 质量门禁

> 参考：`references/quality-gate.md`

**🚨 唯一交付前置条件：跑脚本并贴完整输出。**

```bash
bash scripts/article-check.sh <path-to-mdx-file>
```

**9 项硬检查**，一项不过即退回：

| # | 检查项 | 不通过表现 |
|---|-------|----------|
| 1 | 必须章节存在 | 缺 FAQ / Pricing / At a Glance / Key Features |
| 2 | 无占位符 | "Other Tool" / "Varies by tool" / "TBD" / "TODO" |
| 3 | Pricing 表用具体工具名 | 通用名 / "Tool A" / "Tool B" |
| 4 | FAQ ≥ 3 个问答 | 只有 1-2 个 |
| 5 | 正文 ≥ 目标词数 | Review<800 / Compare<600 / Blog<800 |
| 6 | 无损坏标题 | `## X ## Y` 合并标题 |
| 7 | 内链 ≥2 + 图片 ≥1 + 无禁用组件 | 孤岛内容 / 无图 / 用了未实现组件 |
| 8 | SEO Frontmatter 合规 | 标题超长/描述超长/alt 太短 |
| 9 | lastUpdated ISO 8601 | 缺失或格式错误 |

**评级**：9/9 → PASS | 6-8/9 → FIX | ≤5/9 → REWRITE

**额外强制要求**：`npm run build` 必须通过（脚本不检查 build 因为太慢，但交付前必须跑）。

### Phase 7: 三角色自检

- **SEO 专家**：这个标题搜索量高吗？首段有直接答案吗？图片 alt 写了吗？
- **读者**：读完知道选哪个了吗？还想继续看吗？有没有被推销感？
- **魔鬼代言人**：给出 1 条最强反对理由。如果无法反驳 → 回去改

**自检通过 → 输出文章 + 自检报告 → 等用户确认发布。**

### Phase 8: 发布后闭环

> 参考：`references/phase-8-post-publish.md`

**部署成功不是终点。新文章是孤岛 = 没流量。** 必须做四件事：

1. **反向内链更新（强制自动化）** — 先跑 `bash scripts/find-link-ops.sh <file>` 自动找出所有遗漏的链接候选，根据 MISSING 列表逐一补链到 ≥3 个老文章
2. **主动 ping 搜索引擎** — sitemap 已自动更新，未来接入 IndexNow 可主动通知 Bing
3. **社媒分享文案** — 至少 1 条针对该文章的具体 Reddit/X 文案
4. **数据回流（条件触发）** — 已接 GSC/GA 后，4 周后核查收录与流量

**Phase 8 不做 = 文章只是"上线"，不是"发布"。**

### Phase 9: 交付报告（最终装配）

> 🚨 **这是最后一道 Gate。G9 不过 = 全部退回。不接受任何理由跳过。**

**Phase 9 是 Phase Completion Evidence 的强制输出阶段。** 所有 8 段证据必须在此阶段一次性完整贴出。分开发送的不算——必须汇总。

```
📊 Phase Completion Evidence — 最终交付报告
═══════════════════════════════════════════

📊 Phase 1 — 话题选型证据：
  - check-duplicate.sh 输出
  - category-stats.sh 输出
  - 命中数据源
  - Hub/Spoke 角色
  - SERP 竞品分析结论

📊 Phase 2 — 写作证据：
  - 文件路径 + wc -w 结果
  - 必须章节确认

📊 Phase 3 — 视觉增强证据：
  - Logo 文件路径 + ls 结果
  - 文章内嵌图片数

📊 Phase 4 — 去 AI 味证据：
  - 删除的 AI 套话（≥3 条）
  - 加入的细节（≥2 条）

📊 Phase 5 — SEO 校验证据：
  - 标题长度 / 描述长度
  - 内链数 / alt 长度

📊 Phase 6 — 质量门禁证据：
  - article-check.sh 完整输出（必须 9/9）
  - npm run build 输出

📊 Phase 7 — 三角色自检证据：
  - SEO 专家 / 读者 / 魔鬼代言人评语

📊 Phase 8 — 发布后闭环证据：
  - find-link-ops.sh 输出
  - 反向内链清单（≥3 处修改链接）
  - 社媒分享文案
═══════════════════════════════════════════
```

**输出此报告后，紧接着输出：**

```
🔒🔒🔒 ALL GATES PASSED 🔒🔒🔒
G1 ✅ G2 ✅ G3 ✅ G4 ✅ G5 ✅ G6 ✅ G7 ✅ G8 ✅ G9 ✅
→ 交付
```

**只有看到这两段连在一起，才算交付完成。** 缺任一段 = G9 未通过 = 退回补全。

---

## 文章更新 SOP

> 参考：`references/content-refresh.md`

**触发前先跑**：

```bash
bash scripts/list-stale.sh
```

这个脚本按 lastUpdated/date 排序所有文章，标注 🔴 STALE (>180d) / 🟡 AGING (90-180d) / 🟢 FRESH (<90d)。根据输出判断哪些文章需要更新。

**触发条件**（用户明确要求时）：
- 工具价格变动
- 工具重大功能更新
- 工具停止运营
- 文章发布超过 6 个月

**优先原则**：新文章 > 更新老文章。除非用户指定，否则主写新内容。

---

## 变现埋点策略

> ⚠️ CTA 暂不插入。等有 affiliate 合作伙伴 + 稳定流量（月 UV > 5000）后再统一注入。过早埋 CTA 既无收益还增加维护负担。

当前每篇文章仅保留：
- FAQ 上方：文本链接 "{ToolName} Official Site" → 直接链到官网（非 affiliate）
- 合规要求：每篇底部标注 `Disclosure: Some links may contain affiliate partnerships.`

---

## Phase Gate 强制执行系统

> **这条线以上的所有指令都是"建议"。这条线以下才是"规则"。**

**AI Agent 的行为约束不在 Red Lines 段，而在这一段的 Mechanical Gates。Red Lines 告诉你"错了会怎样"，Phase Gates 让你"根本错不了"。**

### 核心机制：Gate 不过 = 不允许进入下一 Phase

每个 Phase 结束时，必须满足 **Exit Condition** 才能继续。不满足 → 停在该 Phase 修复，禁止前进。禁止跳过。禁止 "先前进再回来补"。

```
Phase 1 ──[G1]──▶ Phase 2 ──[G2]──▶ Phase 3 ──[G3]──▶ Phase 4 ──[G4]──▶ Phase 5
                                                                             │
Phase 9 ◀──[G8]── Phase 8 ◀──[G7]── Phase 7 ◀──[G6]── Phase 6 ◀──[G5]─────┘
   │
   └──[G9: 完整证据报告]──▶ 交付
```

### Gate 定义（机械不可跳过）

| Gate | 位置 | Exit Condition | 验证方式 |
|------|------|---------------|---------|
| **G1** | Phase 1 → 2 | `check-duplicate.sh` + `category-stats.sh` 输出已贴 + 选题已确认 | 检查聊天记录中是否包含两条 bash 输出 |
| **G2** | Phase 2 → 3 | MDX 文件已写入磁盘 + `wc -w` ≥ 最低词数 | `ls` + `wc -w` 实际执行 |
| **G3** | Phase 3 → 4 | Logo 文件存在于 `public/logos/` + 文章内图片引用 ≥1 | `ls public/logos/{slug}.*` + `grep -c` 实际执行 |
| **G4** | Phase 4 → 5 | 已输出 ≥3 条删除的 AI 套话 + ≥2 条新增细节 | 检查聊天记录中是否包含具体文本 |
| **G5** | Phase 5 → 6 | 已输出标题长度 + 描述长度 + 内链数 + alt 长度 | 检查聊天记录中是否包含数值 |
| **G6** | Phase 6 → 7 | `article-check.sh` 输出 9/9 + `npm run build` 通过 | bash 输出截图 + build 最后一行是 success |
| **G7** | Phase 7 → 8 | 三角色评语已输出（每条 ≥1 句） | 检查聊天记录 |
| **G8** | Phase 8 → 9 | `find-link-ops.sh` 已跑 + ≥3 反向内链已写入 + 社媒文案已输出 | bash 输出 + `git diff` 确认修改 |
| **G9** | 9 → 交付 | Phase Completion Evidence 完整报告已输出（8 段证据，缺一不可） | 检查聊天记录中包含全部 8 段 |

### 自检速查（每个 Phase 切换前必须过）

进入下一 Phase 前，AI Agent 必须回答三个问题：

```
1. 上一 Phase 的 Gate Exit Condition 满足了吗？（是 / 否）
2. 证据在聊天记录里可见吗？（是 / 否）
3. 我能否跳过这个 Gate？（不能）
```

三个问题全答对 → 进入下一 Phase。任一答错 → 停。

### Phase Gate 违规检测

**当用户说 "你跳过了 Phase X" 时，自查步骤：**

1. 翻聊天记录 — Gate X 的 Exit Condition 证据是否可见？
2. 不可见 → 你就是跳过了。承认，道歉，回到该 Phase 重做。
3. 不要辩解"其实做了只是没贴出来"——没贴 = 没做。

**"没贴 = 没做" 是 Phase Gate 系统的底层逻辑。** 证据不在聊天记录里 = 该 Phase 未执行。不接受任何口头补述。

### 每次 Phase 切换时必须输出 Gate Pass 标记

进入 Phase N 之前，AI Agent 必须输出：

```
🔒 Gate N-1 PASS → 进入 Phase N
   - Exit Condition: [具体证据摘要]
   - 验证方式: [bash 命令 / 聊天记录检查]
```

**不输出这行标记 = 未通过 Gate = 禁止进入下一 Phase。** 这行标记是唯一的通行证。用户看到这行标记就知道 Gate 已被检查。

如果所有 Phase 已完成、准备交付，输出总结：

```
🔒🔒🔒 ALL GATES PASSED 🔒🔒🔒
G1 ✅ G2 ✅ G3 ✅ G4 ✅ G5 ✅ G6 ✅ G7 ✅ G8 ✅ G9 ✅
→ 交付
```

**G9 是最后一道防线**：完整证据报告必须一次性贴出，8 段缺一不可。不接受"之前贴过了"——必须重新汇总输出。

---

## Red Lines (3.25 Items)

| # | 红线 | 后果 |
|---|------|------|
| 1 | 写完后不跑 Phase 5-7 就交 | 退回重走全流程 |
| 2 | 质量门禁 ≤5 分强行说通过 | 退回重写 |
| 3 | 出现 "Other Tool" / "Varies by tool" / "TBD" / "TODO" | 同分类全部复查 |
| 4 | `npm run build` 不通过就交 | 修到通过为止 |
| 5 | 写 2 篇以上不自检直接批量交 | 分批退回 |
| 6 | Phase 1-8 任一无命令输出证据 | 退回补全并重走该 Phase |
| 6.5 | **未跑 `bash scripts/article-check.sh <file>` 并贴出输出** | 视为未交付，直接退回 |
| 7 | **话题涉及无 Review 工具，未先写 Review 直接写 Compare** | 全部退回，先写 Review 后写 Compare |
| 8 | **MDX 中出现 `<WinnerBadge>` `<ProsCons>` `<ScoreCard>` `<CTABox>` 等未实现组件** | 退回改为 Markdown fallback |
| 9 | **未做 Phase 1 Hub/Spoke 规划 + SERP 竞品分析** | 重做 Phase 1 |
| 10 | **未做 Phase 8 发布后闭环（反向内链 < 3 处）** | 退回补内链 |
| 11 | **Phase 1 未跑 `check-duplicate.sh` + `category-stats.sh` 并贴输出** | Phase 1 视为未执行，退回重做 |
| 12 | **写文章不看 `category-stats.sh` 输出，盲写已饱和分类** | 退回该话题，从 Phase 1 重选 |

## Phase Completion Evidence (交付前必查)

每篇文章交付前，必须输出以下 **8 段证据**，缺一不可。无证据 = 视为未执行：

```
📊 Phase 1 — 话题选型证据：
  - check-duplicate.sh 输出（完整粘贴）
  - category-stats.sh 输出（完整粘贴）
  - 命中数据源: [Product Hunt / X / Reddit / 站内补位]
  - 工具 Review 状态: [已存在 / 待补全 → 列出需要先写的 Review]
  - Hub/Spoke 角色: [Hub / Spoke / Connector]
  - SERP 竞品分析结论: [SKIP / WRITE — 简述原因]
  - 文章类型 + 目标词数

📊 Phase 2 — 写作证据：
  - 文件路径: content/{type}/{slug}.mdx
  - 词数: wc -w 结果
  - 必须章节存在: grep 命令逐项确认

📊 Phase 3 — 视觉增强证据：
  - Logo 文件: ls public/logos/{slug}.{png,svg} 结果
  - 文章内嵌图片数: grep -c "!\[.*\](/logos/" 结果（≥1）
  - 图片 alt 文本是否含关键词

📊 Phase 4 — 去 AI 味证据：
  - 删除的 AI 套话清单（至少 3 条具体例子）
  - 加入的细节清单（≥2 个具体数字/场景/时间）
  - 立场陈述（明确推荐 / 不推荐 / 看情况）

📊 Phase 5 — SEO 校验证据：
  - 标题长度: XX字符 (标准 30-70)
  - Meta描述长度: XX字符 (标准 110-160)
  - 图片alt文本列表 + 字符数（每个 ≥15）
  - 内链数量: X条（≥2）

📊 Phase 6 — 质量门禁证据（必跑脚本）：
  - **命令**: `bash scripts/article-check.sh <file.mdx>`
  - **输出**: 必须粘贴完整脚本输出（9 项 PASS/FAIL + FINAL SCORE）
  - 退出码 0 才算通过；1/2 必须修复后重跑
  - **额外**: `npm run build` 输出（末尾 5 行）

📊 Phase 7 — 三角色自检证据：
  - SEO专家: [1句话判断]
  - 读者: [1句话判断]
  - 魔鬼代言人: [1条反对理由 + 是否已反驳]

📊 Phase 8 — 发布后闭环证据：
  - find-link-ops.sh 输出（完整粘贴）
  - 反向内链清单：列出 ≥3 个被修改的老文件 + 加的具体链接文本
  - sitemap.xml 验证已包含新 URL
  - 至少 1 条社媒分享文案
```

**核心规则**：每段证据必须是 **命令输出** 或 **可验证清单**，不能是口头描述。
"我做了 Phase 4 去 AI 味" → ❌ 不算
"删除了 'In the rapidly evolving world of AI', 'It's worth noting that', 'Let's dive in' 三条" → ✅ 算

---

## Reference Files

| 文件 | 内容 |
|------|------|
| `references/article-templates.md` | 六种文章类型完整模板 + 内链规则 + EEAT 标注 |
| `references/anti-ai-patterns-en.md` | 英文 AI 味检测模式 + 四步重写法 + 人格注入 |
| `references/seo-checklist.md` | SEO 检查清单（标题/描述/结构/图片/FAQ Schema） |
| `references/quality-gate.md` | 发布前 9 项门禁 + bash 脚本强校验 + 三角色自检 |
| `references/topic-engine.md` | 话题生成引擎（数据源/热度标准/筛选规则/Hub-Spoke/SERP 分析） |
| `references/visual-enhance.md` | 视觉增强规范（Logo/配图/组件/图片 SEO） |
| `references/content-refresh.md` | 文章更新 SOP（触发条件/更新深度/历史保留） |
| `references/network-proxy.md` | 网络代理配置（艾可云/Clash 端口检测 + curl/WebFetch 代理注入） |
| `references/phase-8-post-publish.md` | Phase 8 发布后闭环（find-link-ops.sh/反向内链/ping 引擎/社媒/数据回流） |
