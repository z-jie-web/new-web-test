# ToolPorto Writer V2 Working Brief Schema

This document defines the canonical state model for `toolporto-writer-v2`.

The working brief is the only persistent state carrier across modes.

Do not depend on:

- chat transcript memory
- "we already discussed that"
- hidden agent context

If state matters, it belongs in the brief.

## Purpose

The brief exists to:

- preserve cross-mode continuity
- reduce prompt size
- make validator behavior deterministic
- preserve decision lineage
- stop later modes from re-inventing earlier choices

## Canonical Paths

Canonical brief:

```text
~/.claude/state/toolporto-writer/<article-id>/brief.yaml
```

Working candidate:

```text
~/.claude/state/toolporto-writer/<article-id>/brief.candidate.yaml
```

Discover artifact file:

```text
~/.claude/state/toolporto-writer/<article-id>/discover-artifacts.txt
```

## Lifecycle

### New article cycle

```text
discover -> draft -> enhance -> publish
```

### Refresh cycle

```text
refresh -> enhance -> publish
```

## Persistence Rules

Mode execution must follow this sequence:

1. read `brief.yaml`
2. write updates to `brief.candidate.yaml`
3. run validator
4. if exit code `0`, replace `brief.yaml` with `brief.candidate.yaml`
5. if exit code `1/2/3`, keep canonical brief unchanged

This prevents failed mode attempts from corrupting canonical state.

## Refresh Forking Rule

Refresh does not append forever to the original brief.

Instead:

- start a new run
- preserve the same `article_id`
- set `parent_brief_id` to the prior canonical brief

This gives you lineage without turning one state file into a never-ending log.

## Canonical Schema

Recommended baseline:

```yaml
brief_version: 2
run_id: ai-voice-elevenlabs-vs-play-ht-2026-06-11
article_id: elevenlabs-vs-play-ht
parent_brief_id: null
current_mode: discover
status: in_progress

intent:
  article_type: compare
  category: ai-voice
  primary_keyword: "elevenlabs vs play ht"
  search_intent: commercial investigation
  audience: "developers building voice agents; creators evaluating narration quality"

artifacts:
  target_files:
    - content/compare/elevenlabs-vs-play-ht.mdx

decisions:
  angle: "ElevenLabs wins narration; Play.ht wins conversational AI"
  render_contract:
    auto_rendered: []
    mdx_must_not_duplicate: []

mode_outputs:
  discover: {}
  draft: {}
  enhance: {}
  publish: {}
  refresh: {}

validation:
  discover: { attempts: 0, last_exit_code: null }
  draft: { attempts: 0, last_exit_code: null }
  enhance: { attempts: 0, last_exit_code: null }
  publish: { attempts: 0, last_exit_code: null }
  refresh: { attempts: 0, last_exit_code: null }

history: []
```

## Field Definitions

### `brief_version`

- integer or small literal version marker
- used to detect incompatible schema changes

Current value:

- `2`

### `run_id`

Unique identifier for one workflow cycle.

Rules:

- new article cycle -> new `run_id`
- refresh cycle -> new `run_id`
- do not reuse old `run_id` across refreshes

### `article_id`

Stable identity for the article asset.

Rules:

- review -> review slug
- compare -> compare slug (`tool-a-vs-tool-b`)
- blog -> final blog slug

This is also the state directory key.

### `parent_brief_id`

Used only when the current brief is a child of a prior cycle.

Typical cases:

- refreshing an existing published article
- branching from an earlier canonical run

New article cycles should use:

- `null`

### `current_mode`

Allowed values:

- `discover`
- `draft`
- `enhance`
- `publish`
- `refresh`

This should reflect the mode that owns the current candidate mutation.

### `status`

Recommended values:

- `in_progress`
- `blocked`
- `complete`

Do not overuse this. Validators should drive routing more than prose status flags.

## `intent`

The `intent` block defines why the article exists.

Required fields:

- `article_type`
- `category`
- `primary_keyword`
- `search_intent`
- `audience`

Guidelines:

- `article_type` must be one of the project-supported types
- `category` must match project category reality
- `search_intent` should be concise and explicit
- `audience` should be specific enough to influence writing choices

## `artifacts`

This block tracks concrete file outputs.

Required:

- `target_files`

Rules:

- must be a list, even if only one file is produced
- paths should be project-relative
- later modes should not guess target files from memory

## `decisions`

This block stores durable editorial decisions.

Recommended fields:

- `angle`
- `render_contract`

### `angle`

One sentence that states the article's core claim or decision frame.

Bad:

- "make it useful"
- "good comparison"

Good:

- "ElevenLabs wins narration; Play.ht wins conversational AI"

### `render_contract`

This field tells the agent what is already rendered automatically by the page
layer and therefore must not be duplicated in MDX.

Recommended shape:

```yaml
render_contract:
  auto_rendered:
    - name: compare_quick_table
      source: review frontmatter of toolA/toolB
      renderer: app/compare/[...slugs]/page.tsx
      duplicate_if_written_in_mdx: true
  mdx_must_not_duplicate:
    - compare top summary table
    - review auto TLDR
```

This field should be derived from `project-contract.md`, not invented ad hoc.

## `mode_outputs`

This block stores mode-specific results.

Each mode owns only its own subtree.

### `mode_outputs.discover`

Recommended fields:

- `topic_source_summary`
- `duplicate_check_status`
- `category_health_snapshot`
- `serp_decision`
- `hub_spoke_role`
- `supporting_evidence`

### `mode_outputs.draft`

Recommended fields:

- `target_file`
- `frontmatter_complete`
- `structure_complete`
- `word_count`
- `required_sections_confirmed`
- `known_gaps`

### `mode_outputs.enhance`

Recommended fields:

- `ai_pattern_score`
- `ai_pattern_status`
- `images_present`
- `image_paths_checked`
- `internal_links_count`
- `external_links_count`
- `third_party_sources_count`
- `render_contract_conflicts`
- `known_gaps`

### `mode_outputs.publish`

Recommended fields:

- `article_check_status`
- `build_status`
- `date_validation_status`
- `schema_validation_status`
- `backlink_status`
- `backlink_targets_applied`
- `backlink_candidates_remaining`
- `delivery_ready`
- `known_gaps`

### `mode_outputs.refresh`

Recommended fields:

- `refresh_reason`
- `changed_sections`
- `stale_claims_removed`
- `files_touched`

## Field Ownership Rules

Each mode may only write its own fields plus `current_mode`.

Ownership:

- `discover`
  - `intent`
  - `artifacts.target_files`
  - `decisions.*`
  - `mode_outputs.discover`
- `draft`
  - `mode_outputs.draft`
- `enhance`
  - `mode_outputs.enhance`
- `publish`
  - `mode_outputs.publish`
- `refresh`
  - `parent_brief_id`
  - `mode_outputs.refresh`

Modes must not mutate earlier mode outputs except through an explicit migration
script outside normal workflow.

## `validation`

This block records validator attempts and outcomes.

Recommended shape:

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

Rules:

- increment `attempts` for each validator run in that mode
- store `last_exit_code`
- on fixable attempt `4`, set `escalated_to: 3`

## `history`

This is the compact event trail.

Recommended entry shape:

```yaml
history:
  - mode: discover
    result: pass
  - mode: draft
    result: pass
  - mode: enhance
    result: fixable
```

Keep it terse.

Do not dump full validator output here.

## Candidate Brief Requirements

`brief.candidate.yaml` must always be:

- parseable YAML
- complete enough for the validator of the current mode
- limited to the current mode's mutations plus inherited canonical state

It is a proposed next state, not a scratchpad blob.

## Discover Artifact Relationship

The brief alone is not enough for `discover`.

The artifact file exists because:

- validator must verify prerequisite script execution
- stdout in chat is not a durable machine-checkable source

The brief should summarize the outcomes.
The artifact file should contain the raw evidence.

## Anti-Patterns

Avoid:

- using the brief as a free-form notebook
- copying the whole article into the brief
- storing thresholds in both brief and mode docs
- allowing failed candidate state to overwrite canonical state
- reusing one brief forever across refresh cycles

## Minimum Healthy Brief

A healthy brief is:

- small enough to read quickly
- explicit enough to route modes correctly
- stable enough that a different agent can resume work without guessing

If the brief becomes another monolithic prompt, V2 has failed.
