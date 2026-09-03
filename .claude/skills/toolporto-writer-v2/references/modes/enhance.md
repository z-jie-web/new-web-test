# Enhance Mode

Input: `~/.claude/state/toolporto-writer/<article-id>/brief.yaml`  
Output: `~/.claude/state/toolporto-writer/<article-id>/brief.candidate.yaml`  
Validator: `scripts/content/validators/validate-enhance.sh <target-file>`

## Purpose

`enhance` turns a structurally valid draft into an editorially stronger article.

This mode owns:

- anti-AI cleanup
- image and visual completeness
- internal linking
- external linking
- SEO-ready polish that belongs in content, not in project config
- frontmatter convention checks:
  - review `name` must be plain tool name (template appends "Review (2026) — Is It Worth It?")
  - blog `title`+`description` must contain search intent signal words
- render-contract conflict detection

This mode does **not** own:

- initial article creation
- final publish/build verification
- backlink rollout across old content

## Preconditions

Do not enter `enhance` unless:

- `validate-draft.sh` returned `0`
- the target file exists
- `brief.yaml` contains:
  - target file
  - audience
  - angle
  - render contract

If the article is still structurally incomplete, the correct outcome is `2`,
not "do your best anyway."

## Inputs

`enhance` reads:

- `brief.yaml`
- target MDX file
- `project-contract.md`
- `content-deai-engine` rules for de-AI logic
- `humanizer` skill for anti-AI editing
- `geo-rules.md` for AI-engine citation optimization

### Logo Extension Fix (MUST run first)

Before any other enhance step, run:

```bash
bash scripts/content/fix-logo-extensions.sh <target-file>
```

This automatically detects `/logos/xxx.svg` references where only `.png` exists
and fixes them. Without this, `validate-enhance.sh` will flag every article
that references an SVG file missing from disk.

Expected brief fields:

```yaml
decisions:
  angle: ...
  render_contract: ...

mode_outputs:
  draft:
    target_file: ...
    frontmatter_complete: true
    structure_complete: true
```

## Outputs

At the end of `enhance`, the candidate brief must include:

```yaml
current_mode: enhance

mode_outputs:
  enhance:
    ai_pattern_score: 0
    ai_pattern_status: pass | warn | fail
    images_present: true
    image_paths_checked: []
    internal_links_count: 0
    external_links_count: 0
    third_party_sources_count: 0
    render_contract_conflicts: []
    known_gaps: []
```

Keep this concise. The brief should store results, not essays.

## Core Principle

`enhance` improves the article **without changing its role**.

It should make the draft:

- more readable
- more specific
- more trustworthy
- less repetitive
- more compliant with the project contract

It should not silently change:

- article type
- target audience
- primary angle

If those need to change, the correct move is usually back to `draft`.

## Anti-AI Editing

**Required step: invoke the `humanizer` skill on every draft before proceeding to publish.**

The humanizer skill applies Wikipedia's "Signs of AI writing" patterns — a broader and more current vocabulary than `content-deai-engine`.

After humanizer pass, use `content-deai-engine` as secondary validation. Store scored results and remediation summary in the V2 brief.

Source: invoke the `humanizer` skill, then `content-deai-engine` for diagnostic patterns.

**Humanizer pass must run before `validate-enhance.sh`.** If the validator flags AI pattern score ≥ 2.0, re-run humanizer on the flagged sections before attempting other fixes.

### Execution discipline (em dash / 标点清理)

历史事故: 对含 YAML frontmatter 与跨句插入语的文件跑全局正则替换 em dash,
曾把多值行与句子错误配对导致文件损坏。

规则:
- **禁止**对整文件跑跨行/跨句正则替换(`perl -0pi`, 非贪婪配对等)
- em dash 降量 = 逐处人工决策: 单 dash 补充语 → 逗号/冒号; 双 dash 插入语 → 括号
- 先跑诊断拿到目标值, 再动手:
  ```bash
  python3 scripts/content/check-prose-metrics.py <target-file> <article-id>
  ```
- 每篇改完复跑诊断确认达标, 再进 validate-enhance

## Fact Re-Review (独立事实复审)

enhance 的 AI 清理与措辞修改可能引入事实漂移。validate-enhance 前,
用 **fresh context 视角**执行一次事实复审(不沿用写作时的假设):

1. 列出正文 top claims(前 5-8 个含数字/定价/基准的断言)
2. 与素材来源逐条核对: 数字未变、口径未混、来源链接仍指向正确出处
3. 重点核对改写后是否仍区分 "vendor-reported" 与独立验证
4. 将结果写入 brief: `enhance.facts_verified: true` + 备注核查过的断言数

同一批次多篇时, 可对每篇做该核对; 复查发现的冲突记入 `known_gaps`。

## GEO Check (AI 引擎引用优化)

按 `references/geo-rules.md` 对每篇执行 GEO 自检(开篇是否 answer-first、
是否存在可独立摘引的结论句、关键数字是否带来源口径、FAQ 首句是否即答案)。
自检结论写入 brief: `enhance.geo_check: pass`。

### Weighted scoring model

Recommended scoring:

- isolated weak keyword outside intro/outro: `0.5`
- weak keyword in intro/outro: `1.0`
- template phrase (`in conclusion`, `it's important to note`): `2.0`
- repeated sentence-shape cluster: `1.5`
- generic positive closing: `1.5`

Thresholds:

- `< 2.0` -> pass
- `2.0 - 3.5` -> fixable (`1`)
- `> 3.5` -> rewrite required (`3`)

### Mandatory exemptions

Do not scan:

- frontmatter
- tables
- quoted citations
- link URLs
- anchor boilerplate

This mode is about prose quality, not token-policing every string.

## Image and Visual Rules

`enhance` must align with the project contract, not legacy assumptions.

### Valid image path families

Validators should recognize:

- `/logos/...`
- `/images/...`
- approved screenshot paths
- approved diagram paths

Do not assume `/logos/` is the only legitimate visual path.

### Required behavior

- confirm at least one valid visual exists where the content type requires it
- ensure alt text is descriptive and not trivial
- avoid watermarked or obviously broken image references

### Render-contract awareness

If a page auto-renders a visual or summary surface from frontmatter, `enhance`
must not add a second MDX version unless it serves a distinct editorial purpose.

## Linking Rules

### Internal links

`enhance` owns contextual internal linking inside the article body.

Minimum:

- `>= 2` meaningful internal links

Examples:

- review links to relevant compare pages
- compare links to both underlying review pages
- blog links to related review pages and maybe category hubs

### External links

`enhance` owns in-article outbound references.

Minimum:

- `>= 3` external links for review/compare/blog
- `>= 1` must be a non-official third-party authority source

Examples:

- official docs or pricing
- Product Hunt page
- Hacker News thread
- Reddit discussion
- credible industry report

Do not satisfy the third-party-source rule with another vendor landing page.

## Render Contract Conflict Detection

This is one of the most important V2 additions.

The validator should detect when the MDX body duplicates surfaces the page
already renders from frontmatter.

Typical conflicts:

- a compare MDX file recreates the same quick summary table already rendered by
  the page component
- a review MDX file recreates the same TL;DR box already rendered by `TldrBox`
- hand-written CTA placeholders compete with built-in CTA buttons

If duplication is small and removable -> `1`
If duplication is deep and the piece needs structural rewrite -> `3`

## What Enhance Must Not Do

Do not:

- add publish-only backlink operations
- run build as a required step
- redefine frontmatter schema contracts
- create a second content plan
- rewrite the article into a different audience/angle without escalating

## Suggested Enhance Summary

Example:

```text
enhance complete:
- ai_pattern_score=1.5
- internal_links=3
- external_links=4
- third_party_sources=1
- images_present=true
- render_contract_conflicts=0
```

## Validator Expectations

`validate-enhance.sh` should inspect:

- `brief.candidate.yaml`
- target file
- render contract from the brief

It should verify:

- internal links count
- external links count
- third-party source count
- image presence across approved path families
- alt text quality
- weighted AI score
- absence of render-contract duplication conflicts

Expected outcomes:

- exit `0`: ready for `publish`
- exit `1`: polish issues are fixable in place
- exit `2`: article was not actually draft-complete
- exit `3`: rewrite needed due to AI-pattern density or deep duplication conflict

## Exit Condition

`enhance` is complete only when:

1. candidate brief contains enhance-owned fields
2. `validate-enhance.sh <target-file>` returns `0`

Only then may `brief.candidate.yaml` replace `brief.yaml`.
