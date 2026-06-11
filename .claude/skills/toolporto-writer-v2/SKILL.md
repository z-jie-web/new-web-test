---
name: toolporto-writer-v2
description: "ToolPorto 官网英文内容写作 V2 skill。用于 review / compare / blog / refresh 任务，采用 mode-based workflow：discover → draft → enhance → publish，以及 refresh → enhance → publish。使用 working brief、mode validators、project contract 作为唯一状态与真相源，避免 V1 的流程膨胀、规则漂移和聊天仪式化 gate。"
---

# ToolPorto Writer V2

This is the V2 design for ToolPorto writing workflows.

Use this skill when the task is to:

- write a new review
- write a new compare page
- write a new blog / best-of / alternatives page
- refresh an existing article
- plan or validate ToolPorto content workflow itself

Typical triggers:

- "write article"
- "write a review"
- "write a compare"
- "add tool X"
- "what should we write next"
- "refresh this article"
- "update this review"

## What V2 Changes

V2 is intentionally different from V1:

- no giant monolithic prompt
- no duplicated thresholds across docs
- no chat-only gate rituals
- no pretending the transcript is a reliable state store

Instead, V2 uses:

1. a **working brief** as the only canonical state carrier
2. **mode documents** with narrow responsibilities
3. **validators** with explicit exit codes
4. a **project contract** derived from real code

Read these before acting:

- project truth source:
  - [references/project-contract.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/project-contract.md)
- validator behavior:
  - [references/validator-architecture.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/validator-architecture.md)
- state model:
  - [references/working-brief-schema.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/working-brief-schema.md)

## State Files

V2 uses state outside the repo so it does not pollute git history.

Canonical state path:

```text
~/.claude/state/toolporto-writer/<article-id>/brief.yaml
```

Working candidate path:

```text
~/.claude/state/toolporto-writer/<article-id>/brief.candidate.yaml
```

Discover proof path:

```text
~/.claude/state/toolporto-writer/<article-id>/discover-artifacts.txt
```

Do not assume Claude will "remember" prior steps. Read and write these files
explicitly.

## Mode Router

Choose exactly one entry mode.

### Use `discover` when

- the topic is not yet finalized
- the article type is not yet fixed
- you need duplicate check / category health / SERP or gap analysis
- the user asks for topic ideas or "what should we write"

Read:

- [references/modes/discover.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/modes/discover.md)

### Use `draft` when

- the topic is already chosen
- the target file path is known
- the article body needs to be created or structurally rebuilt

Read:

- [references/modes/draft.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/modes/draft.md)

### Use `enhance` when

- a structurally valid draft already exists
- the work is editorial polish, de-AI cleanup, links, visuals, or render-conflict cleanup

Read:

- [references/modes/enhance.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/modes/enhance.md)

### Use `publish` when

- draft and enhance already passed
- the remaining question is whether the article is safe to ship

Read:

- [references/modes/publish.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/modes/publish.md)

### Use `refresh` when

- the article already exists
- there is a concrete update reason
- you need a new maintenance cycle rather than a greenfield draft

Read:

- [references/modes/refresh.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/modes/refresh.md)

## Mode Transition Rules

Primary path:

```text
discover -> draft -> enhance -> publish
```

Refresh path:

```text
refresh -> enhance -> publish
```

Do not skip modes casually.

If a validator says the current mode is wrong or incomplete, follow the exit code
policy from `validator-architecture.md` instead of improvising.

## Validator Rule

The validator decides whether the mode is complete.

Do not replace validator outcomes with narrative reassurance like:

- "looks good to me"
- "probably fine"
- "I already checked this mentally"

If a validator does not return pass, the mode is not done.

## De-AI Rule

V2 does not maintain its own second anti-AI lexicon.

For diagnostic patterns and rewrite heuristics, use:

- `content-deai-engine`

The V2 mode docs only define how the results are consumed and validated.

## Contract Rule

If a mode doc and the project behavior differ, the project behavior wins.

Do not force MDX content to duplicate UI already rendered automatically by:

- compare page components
- review page TL;DR / cards
- built-in CTA surfaces

Always resolve this using `project-contract.md`, not old V1 instincts.

## Migration Status

This V2 skill is a design-first replacement for the current V1 system.

Until migration is complete:

- treat V2 as the preferred architecture for new workflow design
- use golden samples to prove validators and mode docs match reality
- do not copy old V1 thresholds into V2 unless they are re-anchored in one true source

## Success Standard

V2 is working when:

- the chosen mode is obvious
- the brief is readable and current
- the validator outcome is deterministic
- the article does not fight the render layer
- rules are defined once, not scattered across prompts

