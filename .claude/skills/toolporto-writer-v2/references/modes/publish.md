# Publish Mode

Input: `~/.claude/state/toolporto-writer/<article-id>/brief.yaml`  
Output: `~/.claude/state/toolporto-writer/<article-id>/brief.candidate.yaml`  
Validator: `scripts/content/validators/validate-publish.sh <target-file>`

## Purpose

`publish` is the release-readiness mode.

It does not write the first draft.
It does not own deep editorial rewrites.
It does not invent missing discovery context.

It verifies that the article is actually ready to ship within the current
project runtime.

`publish` owns:

- final date validation by content type
- schema-ready frontmatter checks
- build verification
- backlink completion
- delivery checklist completion

## Preconditions

Do not enter `publish` unless:

- `validate-enhance.sh` returned `0`
- `brief.yaml` contains `mode_outputs.enhance`
- the target file exists

If `publish` is being used to patch around missing draft/enhance work, the
validator should return `2`.

## Inputs

`publish` reads:

- `brief.yaml`
- target file
- `project-contract.md`
- `validator-architecture.md`
- runtime code and build output when needed

Expected brief fields:

```yaml
artifacts:
  target_files:
    - ...

mode_outputs:
  draft: ...
  enhance: ...
```

## Outputs

At the end of `publish`, the candidate brief must include:

```yaml
current_mode: publish

mode_outputs:
  publish:
    article_check_status: pass | fix | rewrite
    build_status: pass | fail
    date_validation_status: pass | fail
    schema_validation_status: pass | fail
    backlink_status: pass | fail
    backlink_targets_applied: []
    backlink_candidates_remaining: 0
    delivery_ready: true | false
    known_gaps: []
```

Keep this factual and compact.

## Core Principle

`publish` should answer one question:

**Can this article ship under the current repo behavior without hidden breakage?**

If the answer is no, the reason must be concrete and executable.

## Ownership

### Publish owns these checks

- legacy Check 9: date validation
- legacy Check 10: schema-ready frontmatter
- build success
- backlink completion
- delivery readiness

### Publish does not own

- article ideation
- article structure creation
- anti-AI rewrite scoring
- basic section completeness

If those fail, the correct action is to route back, not to compensate here.

## Relationship to `article-check.sh`

`article-check.sh` remains useful, but in V2 it is no longer the whole gate
system.

V2 rule:

- `publish` may invoke `article-check.sh`
- `article-check.sh` is one publish sub-check
- `publish` still must additionally verify:
  - build
  - backlinks
  - content-type-specific date logic
  - schema/frontmatter rules aligned to current code

So:

- `article-check.sh` pass is necessary
- `article-check.sh` pass is not sufficient

## Date Validation

Date validation must follow the content-type contract.

### Review

Check:

- `frontmatter.lastUpdated` exists
- format is valid for the current V2 rule set

Notes:

- review page visible "Updated" currently uses git/file mtime
- review list sorting uses `lastUpdated`

### Compare

Check:

- `frontmatter.lastUpdated` exists
- compare file uses the project-approved date format

Notes:

- compare schema publish/modify timestamps currently use file mtime
- compare content freshness still depends on compare frontmatter

### Blog

Check:

- `frontmatter.date` exists
- if refresh updated the article materially, ensure policy says whether `date`,
  author, or a future `lastUpdated` field should change

Do not assume one universal field fits all article types.

## Schema-Ready Frontmatter

This check belongs in `publish` because schema behavior depends on runtime code.

Examples from current code:

- review `ratingValue` depends on `pros.length`
- review `Offer.price` depends on `pricing`
- compare schema is assembled from two review frontmatters plus compare data
- blog schema author falls back to `SITE.name`

`publish` should validate these relationships at the content-type level, not as
generic prose rules.

## Build Verification

`publish` must verify that the site still builds.

Canonical check:

```bash
npm run build
```

At minimum, store in the brief:

- build command used
- build exit status
- failure summary if non-zero

If build fails because of the current article change:

- exit `1` if the fix is local and clear
- exit `3` if the content needs redraft or major contract repair

## Backlink Completion

Backlinks belong here, not in `enhance`.

Minimum expectation:

- backlink discovery has been run
- required backlink edits have been applied according to policy

Policy interpretation for V2:

- do **not** require the missing-backlink pool to be reduced to zero
- require a selected set of `3-5` backlink target files
- each selected target must verifiably contain a link to the current article
- any remaining opportunities beyond that are advisory, not automatic blockers

Recommended check inputs:

- backlink artifact or command output
- changed file set
- brief backlink summary
- `backlink_targets_applied` list in the publish brief

If backlink work was never started:

- return `2` if this mode was entered too early
- or `1` if only a small number of obvious backlink edits remain

## Delivery Checklist

`publish` should leave the article in a state where a human reviewer can see:

- target file path
- date validation result
- schema/frontmatter validation result
- build result
- backlink result
- overall delivery readiness

This replaces the V1 ritualized gate messages with a factual shipping report.

## Suggested Publish Summary

Example:

```text
publish complete:
- file=content/compare/elevenlabs-vs-play-ht.mdx
- article_check=pass
- build=pass
- date_validation=pass
- schema_validation=pass
- backlinks=pass
- delivery_ready=true
```

## Validator Expectations

`validate-publish.sh` should inspect:

- `brief.candidate.yaml`
- target file
- `article-check.sh` result if used
- build result
- backlink status

It should verify:

- publish-owned brief fields exist
- date rules are satisfied for the current content type
- schema-ready frontmatter rules are satisfied
- build passes
- backlink policy is satisfied
- delivery checklist is complete

Expected outcomes:

- exit `0`: article is ready to ship
- exit `1`: local publish fixes remain
- exit `2`: publish was entered before upstream work completed
- exit `3`: the file must return to `draft`

## What Publish Must Not Do

Do not:

- silently rewrite the article's core angle
- perform heavy de-AI rewriting here
- invent missing discovery logic
- redefine project contract rules

If publish finds upstream problems, route backward explicitly.

## Exit Condition

`publish` is complete only when:

1. candidate brief contains publish-owned fields
2. `validate-publish.sh <target-file>` returns `0`

Only then may `brief.candidate.yaml` replace `brief.yaml`.
