---
name: toolporto-writer-v2
description: "ToolPorto 官网英文内容写作路由 skill。用于 review / compare / blog / refresh 任务，按 working brief 的 current_mode 路由到 discover / draft / enhance / publish / refresh 对应文档。优先保证流程与质量约束正确，再减少运行时 token。"
---

# ToolPorto Writer V2 Router

Use this skill when the task is to:

- write a new review
- write a new compare page
- write a new blog or best-of page
- refresh an existing article
- continue an already-started ToolPorto content workflow

Common triggers:

- "write article"
- "write a review"
- "write a compare"
- "add tool X"
- "what should we write next"
- "refresh this article"
- "update this review"

## State Paths

Canonical state:

```text
~/.claude/state/toolporto-writer/<article-id>/brief.yaml
```

Mode candidate state:

```text
~/.claude/state/toolporto-writer/<article-id>/brief.candidate.yaml
```

Discover artifact proof:

```text
~/.claude/state/toolporto-writer/<article-id>/discover-artifacts.txt
```

Global keyword strategy config (auto-read by discover, no manual adjustment needed):

```text
~/.claude/state/toolporto-writer/keyword-strategy.yaml
```

State tool:

```text
scripts/content/briefctl.sh
```

## Routing Rules

Primary path:

```text
discover -> draft -> enhance -> publish
```

Refresh path:

```text
refresh -> enhance -> publish
```

Brief state is the source of truth.

If user wording conflicts with `brief.current_mode`, prefer the brief and tell
the user which mode is currently active.

## Pipeline Checklist

Every article MUST pass through this exact sequence:

```
□ discover   → validate-discover.sh [exit 0]
□ draft      → validate-draft.sh [exit 0]
□ enhance    → humanizer pass → validate-enhance.sh [exit 0]
□ publish    → validate-publish.sh [exit 0] → build pass → deploy
```

Each checkbox must be checked before the next one starts. If any validator returns non-zero, the pipeline PAUSES until the issue is resolved.

## Gate Enforcement (HARD RULES — DO NOT SKIP)

Every mode transition requires validator exit code `0`. No exceptions.

### Mode transition gates

| From | To | Gate | Failure action |
|------|----|------|----------------|
| discover | draft | `validate-discover.sh` → 0 | Fix brief/artifacts, rerun |
| draft | enhance | `validate-draft.sh` → 0 | Fix MDX file, rerun |
| enhance | publish | `validate-enhance.sh` → 0 | Apply humanizer, fix issues, rerun |
| publish | deploy | `validate-publish.sh` → 0 + build pass | Fix issues, rerun |

### Gate violations that MUST block progression

1. **Exit code ≠ 0** — DO NOT proceed to the next mode. Fix and rerun.
2. **AI pattern score ≥ 2.0** — invoke humanizer on the full draft before any other enhance action.
3. **Humanizer not invoked in enhance** — enhance mode is NOT complete without a humanizer pass. The validator checks AI pattern score; if humanizer was skipped, the score will be high and the gate will catch it.
4. **Brief not promoted** — after validator exit 0, promote `brief.candidate.yaml` → `brief.yaml` before mode transition.

### Gate bypass is NOT allowed

- "The issue is just brief formatting" → fix the brief
- "It's a minor validator bug" → fix the issue, don't work around it
- "Build passes so it's fine" → validator must pass first

### humanizer enforcement in enhance

The enhance mode MUST include these steps in order:
1. Run `scripts/content/fix-logo-extensions.sh <target-file>` to auto-fix SVG→PNG mismatches
2. Read the draft MDX file
3. Invoke `humanizer` skill on the full draft
4. Apply all humanizer-suggested changes
5. Add external links and third-party sources
6. Run `validate-enhance.sh`
7. If AI pattern score ≥ 2.0 → goto step 3
8. If exit 0 → promote brief, proceed to publish

## Exception Handling

- No brief exists:
  - new task -> enter `discover`
  - existing article refresh/update task -> use `briefctl recover`
- Brief exists but may be damaged:
  - run `briefctl validate <article-id>`
  - if invalid and article exists → `briefctl recover <article-id> <target-file>`
  - if invalid and article does not exist → restart at `discover`
- Refresh task with missing lineage:
  - use `briefctl recover` instead of hard-blocking
- Validator exit ≠ 0 after 5+ retries:
  - escalate to user with specific failure details and proposed fix

## Load Map

Load only the files for the active mode.

- `discover`
  - [references/modes/discover.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/modes/discover.md)
  - [references/working-brief-schema.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/working-brief-schema.md)
- `draft`
  - [references/modes/draft.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/modes/draft.md)
  - [references/project-contract.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/project-contract.md)
- `enhance`
  - [references/modes/enhance.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/modes/enhance.md)
  - [references/project-contract.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/project-contract.md)
  - `.claude/skills/content-deai-engine/SKILL.md`
  - `.claude/skills/humanizer/SKILL.md`
- `publish`
  - [references/modes/publish.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/modes/publish.md)
  - [references/validator-architecture.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/validator-architecture.md)
- `refresh`
  - [references/modes/refresh.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/modes/refresh.md)
  - [references/project-contract.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/project-contract.md)

## Runtime Rule

Let validators own gate decisions.

Do not restate validator logic in this router.

For system rationale and migration context, read:

- [references/design-rationale.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/design-rationale.md)
- [references/migration-notes.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/migration-notes.md)

