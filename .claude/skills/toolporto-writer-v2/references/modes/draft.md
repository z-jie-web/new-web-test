# Draft Mode

Input: `~/.claude/state/toolporto-writer/<article-id>/brief.yaml`  
Output: `~/.claude/state/toolporto-writer/<article-id>/brief.candidate.yaml`  
Validator: `scripts/content/validators/validate-draft.sh <target-file>`

## Purpose

`draft` turns a validated discovery brief into a structurally complete article
file.

This mode is responsible for:

- creating the target MDX file
- writing valid frontmatter
- producing the required article structure
- reaching the minimum content threshold for the chosen article type

It is **not** responsible for:

- visual polish
- anti-AI rewriting
- backlink operations
- final release validation

Those belong to later modes.

## Preconditions

Do not enter `draft` unless:

- `validate-discover.sh` returned `0`
- `brief.yaml` exists
- `brief.yaml.current_mode` is `discover` or the workflow has explicitly routed
  back to `draft`
- `artifacts.target_files` is present

If any of these are missing, the draft validator should return exit code `2`.

## Inputs

`draft` reads:

- `brief.yaml`
- `project-contract.md`
- article-type templates and examples (see `.claude/skills/toolporto-writer/references/article-templates.md`)
  - 🚨 The template's "Required Sections" skeleton is authoritative — copy its
    format literally (e.g. `![Logo A] VS ![Logo B]` for compare, not separate lines).
    When in doubt, read an existing article of the same type for reference.

Minimum required brief fields before writing:

```yaml
intent:
  article_type: ...
  category: ...
  primary_keyword: ...
  search_intent: ...
  audience: ...

artifacts:
  target_files:
    - ...

decisions:
  angle: ...
  render_contract: ...
```

If the brief lacks any of these, stop and return to `discover`.

## Outputs

At the end of `draft`, the candidate brief must include:

```yaml
current_mode: draft

mode_outputs:
  draft:
    target_file: content/.../...mdx
    frontmatter_complete: true
    structure_complete: true
    word_count: 0
    required_sections_confirmed: []
    known_gaps: []
```

The target MDX file itself must exist on disk.

## Core Rule

`draft` is about **content correctness and structural completeness**, not
editorial perfection.

A good draft:

- has the right file path
- has valid frontmatter
- has all required sections
- has enough words
- avoids placeholders and broken formatting

A good draft does **not** need to:

- pass AI-style detection perfectly
- have perfect image selection
- contain backlink updates

## File Creation Rules

### Review

Target:

- `content/reviews/<slug>.mdx`

Canonical frontmatter fields:

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
- `lastUpdated`

### Compare

Target:

- `content/compare/<tool-a>-vs-<tool-b>.mdx`

Canonical frontmatter fields:

- `toolA`
- `toolB`
- `verdict`
- `winner`
- `lastUpdated`

Important:

- compare pages are hybrid pages
- the draft should not try to manually replicate the page-level quick compare
  table from code unless the contract explicitly calls for a second editorial
  table with a distinct purpose

### Blog

Target:

- `content/blog/<slug>.mdx`

Canonical frontmatter fields:

- `slug`
- `title`
- `description`
- `date`

Optional:

- `category`
- `author`
- `relatedReviews`

## Structural Requirements

`draft` should align with the actual file-type expectations, not a bloated
all-purpose checklist.

### Review draft must include

- opening paragraph
- `## Key Features`
- `## Pricing`
- `## FAQ`

### Compare draft must include

- at least two substantive comparison sections
- `## Pricing`
- `## Who Should Choose`
- `## FAQ`

Do not require a duplicate "At a Glance" summary table in MDX when the page
already auto-renders one from review frontmatter.

### Blog draft must include

- opening section
- at least one meaningful H2 section
- `## FAQ`

If these are missing, `validate-draft.sh` should fail with exit code `1`.

## Render Contract Awareness

`draft` must obey the render contract from the brief.

This means:

- write frontmatter that powers auto-rendered UI
- do not duplicate auto-rendered structures in MDX unless the brief explicitly
  says an editorial version is still needed

Examples:

- review TL;DR is auto-rendered from frontmatter via `TldrBox`
- compare quick summary table is auto-rendered from review A + review B
- compare CTA buttons are auto-rendered by the page component

So `draft` should focus on the MDX body that adds value beyond those surfaces.

## Draft-Time Prose Constraints (Validator 前置, 避免 enhance 返工)

以下阈值在 `validate-enhance.sh` 与 `article-check.sh` 中硬性执行。
**写 draft 时就应满足**, 否则 enhance 阶段必须全篇返工:

| 约束 | 阈值 | 违反后果 |
|------|------|---------|
| em dash(—)密度 | 正文 ≤1.0/100 词(≈ 每 100 词 1 个) | >1.0 fixable, >2.0 rewrite |
| AI 词(actually/enhance/crucial 等 45 词表) | 正文 0 命中 | article-check 扣分 |
| `description` 长度 | 110-165 字符 | article-check Check 8 扣分 |
| review `name` | 纯工具名, 不含 "Review" | SEO title 双重拼写 |
| blog title 中冒号后长度 | 建议 ≤70 字符 | — |

写作时替代习惯(本站实际采用):

- em dash 用逗号 / 冒号 / 括号 / 分句替代;双 dash 插入语用括号
- AI 词表全文见 `scripts/content/validators/lib/ai-patterns.sh`, 常见雷区:
  `actually, effectively, significantly, notably, crucial, enhance(d), showcase`

**draft 完成后自查**(写文件后、跑 validate-draft 前, 必须执行):

```bash
python3 scripts/content/check-prose-metrics.py <target-file> <article-id>
```

该脚本按 validator 同口径输出 em dash 密度 / AI 词命中 / description 长度 /
review name / 关键词密度。exit 0 再进 enhance, 否则先修。

## Minimum Draft Content Standards

The draft validator should own these checks:

- required sections present
- no placeholders
- pricing specificity where applicable
- FAQ count
- minimum word count
- no broken headings
- required frontmatter fields present

These are structural gates, not polish gates.

## Draft Writing Strategy

Write from the brief, not from broad memory.

For every draft, carry forward:

- audience
- angle
- search intent
- category
- render contract

The article should answer:

- who this is for
- what decision the reader is trying to make
- what your angle is

It should not try to solve the entire publishing pipeline in one step.

## What Draft Must Not Do

Do not:

- run anti-AI scoring as a hard gate
- optimize image placement beyond basic file references if needed
- add backlink operations
- run build
- redefine SEO thresholds inside the file body
- add ritual gate messages to the article content

## Word Count Behavior

Minimum word count belongs here because it is a structural completeness check.

Recommended thresholds:

- review: `>= 800`
- compare: `>= 600`
- blog: `>= 800`

If the content is materially below threshold:

- first attempt -> exit `1`
- if the draft remains thin after repair attempts -> escalate to `3`

## Compare-Specific Constraint

If the compare depends on a review that does not yet exist, `draft` must not
pretend the compare can ship cleanly.

Two valid paths:

- create the missing review as a prerequisite batch item
- route back to `discover` so the target artifact set is corrected

This is a `2`, not a silent downgrade to blog.

## Suggested Draft Summary

At the end of a successful draft pass, a concise summary is enough:

```text
draft complete:
- file=content/compare/elevenlabs-vs-play-ht.mdx
- article_type=compare
- word_count=698
- required_sections=pass
- frontmatter_complete=true
```

## Validator Expectations

`validate-draft.sh` should inspect:

- `brief.candidate.yaml`
- target file path from the brief
- the file contents

It should verify:

- target file exists
- file path matches article type
- required frontmatter fields exist
- required sections exist
- placeholders are absent
- FAQ count meets minimum
- word count meets minimum
- headings are not corrupted

Expected outcomes:

- exit `0`: ready for `enhance`
- exit `1`: structural issues are fixable
- exit `2`: wrong mode, missing target file, or missing prerequisite state
- exit `3`: draft is too broken or too thin to patch efficiently

## Exit Condition

`draft` is complete only when:

1. the target MDX file exists
2. `brief.candidate.yaml` contains draft-owned fields
3. `validate-draft.sh <target-file>` returns `0`

Only then may `brief.candidate.yaml` replace `brief.yaml`.
