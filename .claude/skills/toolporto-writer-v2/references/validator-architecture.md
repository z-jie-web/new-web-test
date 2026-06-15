# ToolPorto Writer V2 Validator Architecture

This document defines the validator layer for `toolporto-writer-v2`.

Its job is to replace ritual gate language with deterministic, executable
mode exits.

The agent should not decide from memory whether a phase is "good enough."
The validator decides.

## Goals

- Replace chat-level gate rituals with executable checks
- Keep each validator aligned to a single mode
- Prevent infinite fix loops
- Prevent state drift in `working brief`
- Let the skill evolve without duplicating thresholds across prompt text

## Scope

This file defines:

- validator ownership by mode
- exit codes and required agent behavior
- retry / backtrack / rewrite policy
- state write rules for `brief.yaml` and `brief.candidate.yaml`
- migration position of legacy `article-check.sh`

This file does not define:

- the article templates themselves
- the project rendering contract
- the topic engine rules

Those belong in:

- `references/project-contract.md`
- `references/modes/*.md`

## Canonical Paths

Each mode doc must repeat these paths explicitly so Claude does not need to
infer state locations outside the repo.

```text
Input:  ~/.claude/state/toolporto-writer/<article-id>/brief.yaml
Output: ~/.claude/state/toolporto-writer/<article-id>/brief.candidate.yaml
```

Recommended validator location pattern:

```text
scripts/content/validators/validate-<mode>.sh
```

Canonical validators:

- `scripts/content/validators/validate-discover.sh`
- `scripts/content/validators/validate-draft.sh`
- `scripts/content/validators/validate-enhance.sh`
- `scripts/content/validators/validate-publish.sh`
- `scripts/content/validators/validate-refresh.sh`

## Discover Artifact Capture

`discover` mode cannot rely on chat transcript visibility.

If a validator needs proof that prerequisite discovery work happened, that proof
must be persisted to disk in the state directory for the current `article-id`.

Canonical discover artifact file:

```text
~/.claude/state/toolporto-writer/<article-id>/discover-artifacts.txt
```

Minimum contract:

- file exists
- file is non-empty
- file contains:
  - duplicate-check command output
  - category-stats command output
  - any topic-selection notes the validator depends on

Recommended capture pattern:

```bash
mkdir -p ~/.claude/state/toolporto-writer/<article-id>
{
  echo "=== check-duplicate ==="
  bash scripts/check-duplicate.sh "<topic>"
  echo
  echo "=== category-stats ==="
  bash scripts/category-stats.sh
} | tee ~/.claude/state/toolporto-writer/<article-id>/discover-artifacts.txt
```

The discover validator should read this file directly instead of assuming that
stdout remains visible in the agent transcript.

## Exit Codes

These exit codes are the only allowed validator outcomes.

| Exit code | Meaning | Required agent behavior |
|---|---|---|
| `0` | pass | Advance to next mode |
| `1` | fixable | Stay in current mode, repair, rerun same validator |
| `2` | wrong mode / missing prerequisite | Return to previous mode and produce the missing prerequisite |
| `3` | rewrite required | Return to `draft` mode and rewrite the content |

## Retry Policy

`fixable` (`1`) is not infinite.

Per mode:

- max repair attempts: `3`
- on attempt `1-3`: repair in place, rerun same validator
- if attempt `4` would be required: automatically escalate to exit code `3`

This prevents endless "small fix" loops.

Recommended `brief` shape:

```yaml
validation:
  enhance:
    attempts: 2
    last_exit_code: 1
```

Escalated example:

```yaml
validation:
  enhance:
    attempts: 3
    last_exit_code: 1
    escalated_to: 3
```

## Agent State Machine

```text
discover -> draft -> enhance -> publish
                ^        |         |
                |        |         |
                +--------+---------+

refresh -> enhance -> publish
```

Allowed transitions:

- `discover` pass -> `draft`
- `draft` pass -> `enhance`
- `enhance` pass -> `publish`
- `publish` pass -> done
- `refresh` pass -> `enhance`

Fallback transitions:

- any mode returns `2` -> previous mode
- any mode returns `3` -> `draft`

`publish` returning `2` means the file is not publish-ready because a prior mode
did not finish its job. It should not patch around the problem locally.

## Working Brief Write Rules

The brief is the only canonical state carrier.

### Files

- `brief.yaml` = canonical state
- `brief.candidate.yaml` = current mode working state

### Rules

1. A mode reads `brief.yaml`.
2. The mode writes only its own fields into `brief.candidate.yaml`.
3. The validator checks:
   - the article/file outputs
   - the candidate brief fields for that mode
4. Only on exit code `0` may `brief.candidate.yaml` replace `brief.yaml`.
5. On exit code `1`, `2`, or `3`:
   - keep `brief.yaml` unchanged
   - preserve `brief.candidate.yaml` for debugging and repair context

### Field Ownership

Each mode may only write its own subtree.

Recommended ownership:

- `discover` writes:
  - `intent`
  - `artifacts.target_files`
  - `decisions.angle`
  - `decisions.render_contract`
  - `mode_outputs.discover`
- `draft` writes:
  - `mode_outputs.draft`
- `enhance` writes:
  - `mode_outputs.enhance`
- `publish` writes:
  - `mode_outputs.publish`
- `refresh` writes:
  - `mode_outputs.refresh`
  - `parent_brief_id`
  - `refresh_reason`

Modes must not rewrite each other's state unless a migration script explicitly
does so outside normal execution.

## Refresh Lifecycle

`refresh` does not append forever to the original publishing brief.

Instead:

- create a new brief with a new `run_id`
- keep `article_id` the same
- set `parent_brief_id` to the original brief

This preserves lineage without turning one brief into an unbounded log.

## Validator Output Contract

Validators should be easy for both humans and Claude to read.

Recommended output shape:

```text
========================================
Validator: validate-enhance
Article: content/compare/elevenlabs-vs-play-ht.mdx
Mode: enhance
Attempt: 2/3
========================================

PASS:
- internal links >= 2
- alt text lengths valid

FAIL:
- external links: 2 found, need 3
- AI score: 3.0 (warn->fixable)

RECOMMENDED ACTION:
- add one third-party source link
- rewrite opening paragraph to remove pattern cluster

EXIT CODE: 1
```

Hard requirements:

- always print the validator name
- always print the target file(s)
- always print `EXIT CODE: X`
- always print actionable failure reasons

Avoid:

- vague "quality not sufficient"
- hidden logic not reflected in output

### JSON mode

Validators should support:

```bash
validate-<mode>.sh --json ...
```

Expected JSON envelope:

```json
{
  "validator": "validate-draft",
  "mode": "draft",
  "target_file": "content/reviews/elevenlabs.mdx",
  "article_id": "elevenlabs",
  "state_dir": "~/.claude/state/toolporto-writer/elevenlabs",
  "pass": [],
  "fail": [],
  "blocked": [],
  "rewrite": [],
  "recommended_action": "advance to enhance mode",
  "exit_code": 0
}
```

Rules:

- `--json` must not change validation logic
- it only changes serialization format
- human-readable mode remains the default

## Validator Ownership by Mode

### `validate-discover.sh`

Purpose:

- confirm the article is worth drafting
- confirm the brief is initialized correctly

Checks:

- discover artifact file exists and is non-empty
- duplicate check output is present in discover artifact file
- category stats output is present in discover artifact file
- topic / article type chosen
- keyword or search intent chosen
- hub/spoke role decided
- target files named
- `render_contract` exists in brief

Should inspect:

- `brief.candidate.yaml`
- `~/.claude/state/toolporto-writer/<article-id>/discover-artifacts.txt`

Should not inspect:

- article body quality
- image/link polish
- build results

Typical outcomes:

- `1`: brief missing one or two fields, or discover artifacts are incomplete
- `2`: no prerequisite discovery ran, or discover artifact file is missing
- `3`: never used here unless topic is fundamentally invalid and requires a new
  drafting path

### `validate-draft.sh <file>`

Purpose:

- verify that the article exists in a structurally valid draft state

Migrated legacy checks:

- old Check 1: required sections
- old Check 2: no placeholders
- old Check 3: pricing specificity
- old Check 4: FAQ count
- old Check 5: word count
- old Check 6: no corrupted headings

Additional responsibilities:

- confirm frontmatter fields required by the content type are present
- confirm target file path matches brief

Should not inspect:

- AI-writing patterns
- external link quality
- build success

Typical outcomes:

- `1`: missing sections, short copy, bad headings
- `2`: article file missing or wrong article type
- `3`: draft is so structurally broken that patching is more expensive than rewrite

### `validate-enhance.sh <file>`

Purpose:

- verify that content has been editorially improved and does not conflict with
  the render contract

Migrated legacy checks:

- old Check 7: internal links + image checks
- old Check 8: SEO frontmatter
- old Check 11: AI writing patterns

New required checks:

- external links count and quality
- at least one non-official third-party authority link
- image path recognition across:
  - `/logos/`
  - `/images/`
  - article-local screenshot paths
  - approved diagram paths
- render-contract conflict detection:
  - detect MDX duplication of auto-rendered compare/review surfaces
- SEO frontmatter convention checks:
  - review `name` field must be plain tool name (no "Review" — template appends it)
  - blog `title`+`description` must contain at least one search-intent signal word (review, compare, best, guide, tested, hands-on, how to, etc.)

AI pattern policy:

- not binary keyword policing
- use weighted score
- support warning and fail thresholds

Recommended rating model:

- score `< 2.0` -> pass
- score `2.0 - 3.5` -> fixable (`1`)
- score `> 3.5` -> rewrite required (`3`)

Mandatory exemptions:

- do not scan frontmatter
- do not scan tables
- do not scan quoted citations
- do not scan link URLs / anchor boilerplate

Typical outcomes:

- `1`: fixable polish issues
- `2`: enhance called before draft is structurally ready
- `3`: heavy AI-pattern density or duplicate-render conflicts that require rewrite

### `validate-publish.sh <file>`

Purpose:

- verify release readiness

Migrated legacy checks:

- old Check 9: date field validation
- old Check 10: schema-ready frontmatter

New required checks:

- `npm run build` passes
- backlinks updated according to policy, using selected verified targets rather
  than full-pool exhaustion
- publish checklist complete
- compare/review/blog dates validated by content type rules

Relationship to `article-check.sh`:

- `validate-publish.sh` may call `article-check.sh`
- but `article-check.sh` is no longer the whole publishing system
- it becomes one sub-check inside publish validation

Typical outcomes:

- `1`: build passes but metadata/backlink/checklist fixes remain
- `2`: publish attempted before enhance completed
- `3`: article must return to draft because schema/date/body state is too broken

### `validate-refresh.sh <file>`

Purpose:

- verify that a refresh cycle changed the article for a real reason, not just
  touched it cosmetically

Checks:

- `refresh_reason` exists in brief
- changed sections are identified
- each `stale_claims_removed` entry is absent from the target file
- stale information was replaced, not merely appended
- each `files_touched` entry has real `git diff --stat` evidence
- date fields were updated appropriately
- refreshed file still passes draft/enhance/publish expectations for its type

Typical outcomes:

- `1`: refresh reason valid but incomplete edits
- `2`: refresh attempted without a refresh brief
- `3`: refresh drifted so far that the content needs a redraft

## Legacy `article-check.sh` Migration

`article-check.sh` should not disappear immediately, but it must stop acting as
an alternate constitution.

V2 role:

- legacy wrapper or compatibility checker
- callable by humans and CI
- optionally used inside `validate-publish.sh`

Recommended migration:

1. keep current script during V2 bootstrap
2. split ownership into mode validators
3. either:
   - turn `article-check.sh` into a wrapper that calls the new validators, or
   - freeze it as a human QA helper and remove duplicated rules from skill docs

Do not keep two independent rule systems.

## Golden Sample Requirement

Before V2 is considered stable:

- one review sample must pass all V2 validators
- one compare sample must pass all V2 validators
- one blog sample must pass all V2 validators

If the golden set fails:

- fix the validator design
- or explicitly migrate the sample

Do not "explain away" failures.

## Non-Goals

Validators are not responsible for:

- deciding article ideas
- inventing market positioning
- replacing human editorial judgment on tone

They are guardrails, not writers.

## Success Criteria

V2 validator architecture is healthy when:

- validators own all gate logic
- no gate depends on magic chat phrases
- the agent never needs to infer which mode to re-enter
- the golden sample set passes deterministically
- changing a threshold requires editing one place only
