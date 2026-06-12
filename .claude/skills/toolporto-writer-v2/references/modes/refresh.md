# Refresh Mode

Input: `~/.claude/state/toolporto-writer/<article-id>/brief.yaml`  
Output: `~/.claude/state/toolporto-writer/<article-id>/brief.candidate.yaml`  
Validator: `scripts/content/validators/validate-refresh.sh <target-file>`

## Purpose

`refresh` handles updates to an existing article when the article should remain
the same asset but its content is no longer current enough.

Examples:

- pricing changes
- product positioning changes
- major feature launches
- stale comparison logic
- old links or unsupported claims

`refresh` is not "append a note and move on."
It is a stateful maintenance cycle.

## Preconditions

Do not enter `refresh` unless:

- a target article already exists
- there is a concrete refresh reason
- the new run is linked back to the prior brief

If there is no real refresh reason, this mode should fail early.

## Refresh Lifecycle

`refresh` starts a new run.

It must not endlessly append to the original publish-cycle brief.

Rules:

- create a new `run_id`
- keep the same `article_id`
- set `parent_brief_id` to the prior canonical brief
- write the new cycle into a new canonical brief for this run

This preserves lineage while keeping each cycle readable.

## Inputs

`refresh` reads:

- existing article file
- parent brief if available
- current `project-contract.md`
- the concrete change reason

The candidate brief must contain:

```yaml
article_id: ...
parent_brief_id: ...
current_mode: refresh

mode_outputs:
  refresh:
    refresh_reason: ...
    changed_sections: []
    stale_claims_removed: []
    files_touched: []
```

## Required Refresh Reason

Every refresh must declare one or more reasons.

Allowed examples:

- `pricing_changed`
- `feature_launch`
- `comparison_outdated`
- `tool_shutdown`
- `content_stale`
- `schema_or_contract_alignment`
- `state_recovery`

Bad examples:

- `felt like updating`
- `improve quality`
- `Claude rewrote it a bit`

`refresh_reason` must be concrete enough to review after the fact.

`state_recovery` is reserved for brief recovery paths where the article exists
but the refresh state must be reconstructed before normal refresh work can continue.

## Responsibilities

`refresh` owns:

- identifying what became stale
- deciding which sections must change
- updating article-specific facts
- updating freshness metadata according to content type policy
- recording what changed and why

`refresh` does not own:

- greenfield topic discovery
- full-page redrafting unless validator escalation requires it

## Refresh Decision Sequence

### 1. Confirm the asset identity

You must know exactly which file is being refreshed.

Examples:

- `content/reviews/elevenlabs.mdx`
- `content/compare/elevenlabs-vs-play-ht.mdx`
- `content/blog/best-ai-voice-generators.mdx`

### 2. State the refresh reason

Write the reason to the candidate brief.

If multiple reasons apply, list them.

### 3. Identify changed sections

Do not treat the whole article as a blur.

List which sections are impacted.

Examples:

- `Pricing Breakdown`
- `Our Take`
- `FAQ`
- `Comparison verdict`

### 4. Replace stale claims

The standard is replacement, not accumulation.

Bad refresh:

- adds a 2026 note at the top
- leaves outdated body claims untouched

Good refresh:

- removes or rewrites obsolete prices, features, limits, and verdicts

### 5. Update freshness metadata

Follow content-type rules from `project-contract.md`.

Examples:

- review: update `lastUpdated` if policy requires
- compare: update compare freshness field
- blog: update `date` only if your editorial policy says that date represents
  last meaningful revision, otherwise plan a separate future `lastUpdated` rule

## Outputs

At the end of `refresh`, the candidate brief should contain:

```yaml
mode_outputs:
  refresh:
    refresh_reason:
      - pricing_changed
    changed_sections:
      - Pricing Breakdown
      - FAQ
    stale_claims_removed:
      - "old Creator plan price"
      - "old language support count"
    files_touched:
      - content/reviews/elevenlabs.mdx
```

Keep this factual and reviewable.

## Relationship to Later Modes

`refresh` does not ship directly.

On pass:

- `refresh -> enhance -> publish`

This keeps refreshed content aligned with current style, links, and release
checks.

## Validator Expectations

`validate-refresh.sh` should inspect:

- target file
- candidate brief
- parent brief reference if available

It should verify:

- `refresh_reason` exists
- `changed_sections` are named
- each `stale_claims_removed` entry is no longer present in the target file
- stale information was replaced, not merely appended
- each `files_touched` entry has real `git diff --stat` evidence
- freshness metadata was updated according to current policy
- the article remains compatible with current project contract expectations

Expected outcomes:

- exit `0`: refresh is structurally sound; proceed to `enhance`
- exit `1`: refresh is valid but incomplete
- exit `2`: missing parent state or no valid refresh reason
- exit `3`: the article is too stale or inconsistent and should return to `draft`

## What Refresh Must Not Do

Do not:

- silently convert refresh into a brand-new article idea
- leave obsolete facts in place while adding new notes
- rewrite for a different audience without escalating
- update metadata without updating the underlying claims

## Suggested Refresh Summary

Example:

```text
refresh complete:
- file=content/reviews/elevenlabs.mdx
- refresh_reason=pricing_changed
- changed_sections=Pricing Breakdown, FAQ
- stale_claims_removed=2
- metadata_updated=true
```

## Exit Condition

`refresh` is complete only when:

1. candidate brief contains refresh-owned fields
2. `validate-refresh.sh <target-file>` returns `0`

Only then may `brief.candidate.yaml` replace `brief.yaml` and advance to
`enhance`.
