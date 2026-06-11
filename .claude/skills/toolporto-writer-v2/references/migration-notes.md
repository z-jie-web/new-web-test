# ToolPorto Writer V2 Migration Notes

This document defines the rollout order for moving from the current V1 writing
system to `toolporto-writer-v2`.

The goal is not to "rewrite the skill."
The goal is to restore one true source of truth and move the workflow without
breaking real article production.

## Migration Principles

1. **Do not mutate V1 blindly while designing V2.**
   Build V2 in parallel until the core contract, validators, and state model are
   stable.

2. **Fix truth-source drift before adding more rules.**
   If code, scripts, and skill text disagree, new prompt polish is wasted effort.

3. **Use golden samples as reality checks.**
   V2 is not ready because the docs look good. V2 is ready when real sample
   content passes the validators.

4. **Prefer wrappers over big-bang replacement.**
   Existing scripts like `article-check.sh` can remain temporarily as compatibility
   layers while ownership moves to mode validators.

## What V2 Replaces

V2 replaces these V1 design assumptions:

- giant monolithic skill prompt
- chat transcript as process proof
- ritual gate phrases in place of executable checks
- duplicated threshold definitions across skill, references, and scripts
- unclear distinction between MDX-authored content and auto-rendered page UI

## Phase 0: Brand Alignment Audit

This is the first migration phase.

Do not finalize validators or examples until this is settled.

### Problem

~~The project previously mixed ToolPorto, ToolHub, and ToolHub Team across code and content. Resolved in Phase 0.~~

### Phase 0 output

Canonical brand set (applied):

```yaml
canonical_brand:
  site_name: ToolPorto
  author_name: ToolPorto Team
  domain: toolporto.com
```

### Phase 0 acceptance criteria

- [x] one approved canonical brand set exists
- [x] all brand-bearing code paths are identified and aligned
- [x] `lib/constants.ts` SITE.name → `ToolPorto`
- [x] all `app/` pages: ToolHub → ToolPorto
- [x] all `content/blog/` frontmatter: author → `ToolPorto Team`
- [x] V1/V2 skill doc examples aligned
- [x] no new V2 validator hardcodes old brand names

## Phase 1: Freeze V1 Rule Growth

Do not keep adding rules to the V1 monolith while V2 is being defined.

Allowed V1 edits during migration:

- critical bug fixes
- factual corrections
- obvious contradiction cleanup if needed for current production

Disallowed V1 edits:

- new phase logic
- new gate rituals
- more duplicated checklists

### Acceptance criteria

- V1 is effectively in maintenance mode
- V2 becomes the design target for new workflow decisions

## Phase 2: Establish V2 Truth Sources

These files must exist before validators are treated as canonical:

- [project-contract.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/project-contract.md)
- [validator-architecture.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/validator-architecture.md)
- [working-brief-schema.md](/Users/zhangjie/project/npm/new-web-test/.claude/skills/toolporto-writer-v2/references/working-brief-schema.md)

### Acceptance criteria

- render contract is derived from code, not from intuition
- validator exit codes are fixed
- brief lifecycle is fixed

## Phase 3: Mode Docs

The V2 workflow should be documented in discrete mode files:

- `discover.md`
- `draft.md`
- `enhance.md`
- `publish.md`
- `refresh.md`

These documents should:

- declare explicit state input/output paths
- declare their validator
- define only the responsibilities of that mode

They should not:

- restate the whole system
- duplicate thresholds already owned by validators
- define render behavior already owned by `project-contract.md`

### Acceptance criteria

- each mode can be read independently
- mode handoff is understandable from `brief + validator`, not from chat memory

## Phase 4: Validator Bootstrap

Start with the validator skeletons before attempting full production adoption.

Bootstrap order:

1. `validate-discover.sh`
2. `validate-draft.sh`
3. `validate-enhance.sh`
4. `validate-publish.sh`
5. `validate-refresh.sh`

Reason:

- discover and draft define state correctness
- enhance reveals render-contract drift
- publish can then safely wrap `article-check.sh`
- refresh should come last because it depends on the core lifecycle already being stable

### Acceptance criteria

- each validator returns only `0/1/2/3`
- each validator prints actionable failure reasons
- each validator works against synthetic local state samples

## Phase 5: Golden Sample Alignment

Before V2 is declared usable, run it against real content.

Recommended initial golden set:

- [content/reviews/elevenlabs.mdx](/Users/zhangjie/project/npm/new-web-test/content/reviews/elevenlabs.mdx:1)
- [content/compare/elevenlabs-vs-play-ht.mdx](/Users/zhangjie/project/npm/new-web-test/content/compare/elevenlabs-vs-play-ht.mdx:1)
- [content/blog/best-ai-voice-generators.mdx](/Users/zhangjie/project/npm/new-web-test/content/blog/best-ai-voice-generators.mdx:1)

Rules:

- if the sample fails, do not hand-wave it
- either migrate the sample or fix the validator
- do not declare V2 "strict" if it is merely misaligned

### Acceptance criteria

- one review sample passes
- one compare sample passes
- one blog sample passes

## Phase 6: Migrate `article-check.sh`

`article-check.sh` currently behaves like a pseudo-constitution.

It should become one of:

1. a compatibility wrapper that calls the new mode validators
2. a human QA helper that no longer duplicates V2 authority

Preferred end state:

- `validate-publish.sh` owns the shipping decision
- `article-check.sh` is invoked from publish as one sub-check or wrapper

### Acceptance criteria

- no check exists only in V1 text and nowhere executable
- no important executable check exists only in `article-check.sh` without V2 ownership

## Phase 7: Switch the Entry Skill

Once V2 is stable:

- point project-level guidance to `toolporto-writer-v2`
- keep V1 available temporarily as deprecated

Recommended deprecation behavior:

- V1 stays read-only
- V1 header marks it as deprecated
- V1 points maintainers to V2 docs

### Acceptance criteria

- new writing tasks route to V2 by default
- no important workflow knowledge exists only in V1

## Phase 8: Cleanup ✅ COMPLETE

After V2 is the default:

- [x] remove obsolete duplicated rule text from V1 — V1 SKILL.md replaced with redirect stub (566→58 lines)
- [x] V1 references kept as read-only supplementary material
- [x] consolidate shared validator helpers — `lib/common.sh` extracted, ~400 lines deduplicated
- [x] `briefctl.sh` created for working brief lifecycle management

V1 references retained (read-only):
- `references/article-templates.md`, `anti-ai-patterns-en.md`, `seo-checklist.md`
- `references/quality-gate.md` (superseded by V2 validators)
- `references/topic-engine.md`, `visual-enhance.md`, `content-refresh.md`
- `references/network-proxy.md`, `phase-8-post-publish.md`

## Recommended Execution Order

Use this order in practice:

1. Phase 0 brand alignment audit
2. freeze V1 rule growth
3. confirm V2 truth-source docs
4. finish validator scaffolding
5. validate golden samples
6. migrate `article-check.sh`
7. switch entry skill
8. cleanup and deprecate V1

## Rollback Strategy

If V2 blocks production work:

- keep V1 operational for live content
- keep V2 as design target
- revert only the entrypoint routing, not the reference docs

Do not delete V2 artifacts because a validator found real project drift.
That drift is the point.

## Non-Goals

Migration is not trying to:

- instantly rewrite all existing content
- perfect every validator before testing
- eliminate every V1 file on day one

Migration is trying to:

- restore coherence
- make state machine behavior explicit
- make article quality verifiable

## Definition of Done

V2 migration is complete when:

- [x] one canonical brand state exists — ToolPorto, aligned across all code/content
- [x] V2 docs are the truth source for workflow behavior — project-contract, validator-architecture, working-brief-schema, 5 mode docs
- [x] V2 validators are the truth source for gate behavior — validate-{discover,draft,enhance,publish,refresh}.sh with 0/1/2/3 exit codes
- [x] golden samples pass deterministically — elevenlabs (review), elevenlabs-vs-play-ht (compare), best-ai-voice-generators (blog) all exit 0 through discover→draft→enhance→publish
- [x] new article work no longer depends on V1 ritual gates — AGENTS.md routes to V2, V1 reduced to redirect stub

All 8 phases complete. V2 is the default writing system.

