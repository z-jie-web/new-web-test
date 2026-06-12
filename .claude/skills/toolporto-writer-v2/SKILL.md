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

## Exception Handling

- No brief exists:
  - new task -> enter `discover`
  - existing article refresh/update task -> use `briefctl recover`
- Brief exists but may be damaged:
  - run `briefctl validate <article-id>`
  - if invalid and article exists -> `briefctl recover <article-id> <target-file>`
  - if invalid and article does not exist -> restart at `discover`
- Refresh task with missing lineage:
  - use `briefctl recover` instead of hard-blocking

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

