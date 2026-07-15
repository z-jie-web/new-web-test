# Discover Mode

Input: `~/.claude/state/toolporto-writer/<article-id>/brief.yaml`  
Output: `~/.claude/state/toolporto-writer/<article-id>/brief.candidate.yaml`  
Artifacts: `~/.claude/state/toolporto-writer/<article-id>/discover-artifacts.txt`  
Validator: `scripts/content/validators/validate-discover.sh`

## Purpose

`discover` decides whether an article should exist and initializes the canonical
 state the rest of the workflow depends on.

This mode does **not** draft copy.

Its only job is to:

- prove the topic is worth writing
- decide article type and target file path
- establish search intent and positioning
- initialize the working brief with enough structure for `draft`

If `discover` is weak, every later mode becomes improvisation.

## Preconditions

Before using this mode:

- brand alignment Phase 0 is either complete or running under an explicit
  migration allowlist
- `project-contract.md` is the current truth source for render behavior
- `validator-architecture.md` is the current truth source for exit behavior

Do not let `discover` invent constraints that belong in those documents.

## Inputs

Expected user inputs:

- a tool name
- a category
- a comparison pair
- a "what should we write next?" request
- a refresh candidate

Expected project inputs:

- `content/reviews/`
- `content/compare/`
- `content/blog/`
- `content/categories/`
- project scripts:
  - `scripts/check-duplicate.sh`
  - `scripts/category-stats.sh`

Optional external inputs:

- Product Hunt, X, Reddit, HN, Google Trends, SERP notes

## Required Outputs

At the end of `discover`, the candidate brief must contain:

```yaml
brief_version: 2
run_id: ...
article_id: ...
current_mode: discover
status: in_progress

intent:
  article_type: review | compare | blog
  category: ...
  primary_keyword: ...
  search_intent: ...
  audience: ...

artifacts:
  target_files:
    - ...

decisions:
  angle: ...
  render_contract:
    auto_rendered: []
    mdx_must_not_duplicate: []

mode_outputs:
  discover:
    topic_source_summary: []
    duplicate_check_status: clear | similar | exact
    category_health_snapshot: ...
    serp_decision: write | skip | uncertain
    hub_spoke_role: hub | spoke | connector
    supporting_evidence: []

validation:
  discover:
    attempts: 0
    last_exit_code: null

history: []
```

The values do not need to be verbose. They do need to be explicit.

## Discover Artifact File

`discover` must not rely on the chat transcript as proof.

Persist all prerequisite evidence to:

`~/.claude/state/toolporto-writer/<article-id>/discover-artifacts.txt`

Minimum required contents:

- raw output of `check-duplicate.sh`
- raw output of `category-stats.sh`
- any brief SERP / trend / hot-topic notes needed for the final decision

Use the dedicated script (do NOT use heredoc-based manual creation — it breaks on `$()` expansion in this environment):

```bash
bash scripts/content/create-discover-artifacts.sh <article-id> "<topic-description>"
```

This single command:
- Creates the state directory
- Runs `check-duplicate.sh` and captures full stdout
- Runs `category-stats.sh` and captures full stdout
- Writes the metadata header (date, keyword strategy tier)
- Produces a validator-compliant `discover-artifacts.txt`

If the validator cannot find the artifact file or the artifact file is empty, `discover` did not complete.

## Decision Sequence

Run this sequence in order.

### 1. Normalize the topic

Decide:

- candidate article title or topic label
- candidate article type
- canonical `article-id`

Rules:

- review: use tool slug
- compare: use `tool-a-vs-tool-b`
- blog: use final content slug, not a loose brainstorm label

The `article-id` must be stable enough to use as the state directory key.

### 2. Run duplicate detection

Run:

```bash
bash scripts/check-duplicate.sh "<topic-name>"
```

Interpretation:

- exit `0`: clear
- exit `1`: similar content exists, angle differentiation required
- exit `2`: exact content exists, do not proceed as a new article without an
  explicit alternate angle or refresh intent

Write both the command output and the interpreted status into the brief.

### 3. Run category health check

Run:

```bash
bash scripts/category-stats.sh
```

Purpose:

- understand category saturation
- identify weak categories that deserve more content
- detect when the proposed topic is filling a real gap versus adding noise

Write a compact summary into `mode_outputs.discover.category_health_snapshot`.

### 3.5. Keyword feasibility check

**This step enforces keyword strategy. Do not skip it.**

Read the strategy config:

```text
~/.claude/state/toolporto-writer/keyword-strategy.yaml
```

The config defines three tiers keyed to site age:

| Tier | Age | Rule |
|------|-----|------|
| `long_tail_only` | 0-3 months | Only long-tail, low-competition keywords |
| `mixed` | 3-6 months | Long-tail primary, medium-competition allowed with unique angle |
| `competitive` | 6+ months | All keyword types, data-driven selection |

**How to use this step:**

1. Determine the candidate `primary_keyword` for the proposed article
2. Classify the keyword against the current tier's `allowed_patterns` and `avoid_patterns`
3. If the keyword matches `avoid_patterns`:
   - Do NOT proceed with a broad keyword
   - Generate 2-3 long-tail alternatives that match `allowed_patterns`
   - Present alternatives to the user (or auto-select the best one if running autonomously)
   - Write the chosen alternative as `primary_keyword` in the brief
4. If the keyword matches `allowed_patterns`:
   - Proceed normally
   - Record in brief: `keyword_tier_check: passed`

**Pattern classification guide:**

| Pattern | Examples | When allowed |
|---------|----------|-------------|
| `tool_vs_tool_for_use_case` | "elevenlabs vs fish audio for podcasters" | All tiers |
| `specific_how_to` | "how to use kling ai for social media ads" | All tiers |
| `niche_best_of` | "best free face swap tools for streamers" | All tiers |
| `single_tool_for_audience` | "is elevenlabs good for youtube creators" | All tiers |
| `problem_solution` | "how to add ai subtitles to tiktok videos" | All tiers |
| `broad_best_of` | "best AI video generators" | mixed+, with unique angle |
| `category_head_term` | "AI voice generator" | competitive only |
| `generic_vs` | "midjourney vs stable diffusion" | mixed+, with specific angle |

**Keyword tier check output must be recorded in brief:**

```yaml
mode_outputs:
  discover:
    keyword_tier_check: passed | redirected
    original_keyword: "best AI video generators"      # if redirected
    selected_keyword: "best AI video generator for social media creators 2026"  # if redirected
    selected_pattern: niche_best_of
    alternatives_suggested: ["...", "...", "..."]
```

**Site age auto-detection:**

Calculate site age from `site_launch_date` in the strategy config. Do not ask the user for this — it is deterministic.

```text
site_age_months = (today - site_launch_date) / 30
current_tier = lookup from tiers based on site_age_months
```

If the strategy config `current_tier` disagrees with the auto-calculated tier (e.g., the user manually upgraded after providing GSC data), trust the config's `current_tier` value. It represents an explicit strategy decision.

**When the user provides GSC data:**

The user may periodically share GSC screenshots or data. When they do:

1. Update `last_gsc_update` in the strategy config to today
2. Analyze the data: which categories are gaining impressions, which pages are close to top 10
3. Discuss with the user whether to adjust `current_tier`
4. Do NOT auto-upgrade the tier — it's a collaborative decision

If no GSC data has been shared since launch, the agent should note this as a known gap but proceed with the current tier.

### 4. Decide article type

Choose one of:

- `review`
- `compare`
- `blog`

Rules:

- if the request centers on a single tool evaluation -> `review`
- if the request compares two specific tools -> `compare`
- if the request is category-level, alternatives, best-of, use-case, or explainer
  -> `blog`

Do not use `blog` to avoid writing a missing `review`.

If a compare depends on a tool without a review page, record that prerequisite
in the brief so later modes can route correctly.

### 5. Decide target file path

Examples:

- `content/reviews/elevenlabs.mdx`
- `content/compare/elevenlabs-vs-play-ht.mdx`
- `content/blog/best-ai-voice-generators.mdx`

This path must be written into `artifacts.target_files`.

### 6. Decide angle and search intent

You must write both:

- `angle`
- `search_intent`

Examples:

- angle: `ElevenLabs wins narration quality; Play.ht wins conversational AI`
- search_intent: `commercial investigation`

Bad:

- `write a good comparison`
- `make it useful`

Good:

- concrete claim
- concrete reader problem
- concrete reason this page exists

### 7. Decide audience

This is not optional.

Examples:

- `developers building voice agents`
- `YouTube creators choosing a voiceover tool`
- `L&D teams localizing training video`

The audience should be specific enough to influence later copy decisions.

### 8. Apply the render contract

Import from `project-contract.md`.

Write into the brief:

- what the page auto-renders
- what the MDX must not duplicate

At minimum, this must stop:

- review TL;DR duplication
- compare quick-table duplication
- compare built-in CTA duplication

### 9. Decide hub / spoke role

Choose:

- `hub`
- `spoke`
- `connector`

This does not need to be over-optimized, but it does need to be explicit.

### 10. Decide SERP action

Choose:

- `write`
- `skip`
- `uncertain`

`uncertain` is valid if discovery surfaced mixed evidence, but it must be
backed by notes in `supporting_evidence`.

## What Discover Must Not Do

Do not:

- start drafting article paragraphs
- optimize wording
- invent SEO thresholds
- duplicate project-contract rules into the brief
- treat chat visibility as proof that scripts ran

## Recommended Brief Initialization Strategy

If `brief.yaml` does not exist:

- create a minimal skeleton
- write all discover-owned fields into `brief.candidate.yaml`

If `brief.yaml` already exists:

- read it
- validate that the requested `article-id` matches the current run
- write only discover-owned fields into `brief.candidate.yaml`

`discover` must not modify later-mode outputs.

## Validator Expectations

`validate-discover.sh` should be able to prove:

- the artifact file exists
- the artifact file includes duplicate-check output
- the artifact file includes category-stats output
- article type is chosen
- target file path exists in the brief
- search intent exists
- audience exists
- angle exists
- render contract exists
- hub/spoke role exists

Expected outcomes:

- exit `0`: state is ready for `draft`
- exit `1`: brief or artifact file is incomplete
- exit `2`: prerequisites missing or wrong mode
- exit `3`: topic is fundamentally invalid and should not move forward

## Good Discover Output

Good output is short, explicit, and machine-checkable.

Example summary:

```text
discover complete:
- article_type=compare
- article_id=elevenlabs-vs-play-ht
- target_file=content/compare/elevenlabs-vs-play-ht.mdx
- audience=developers building voice agents; creators evaluating narration quality
- serp_decision=write
- hub_spoke_role=spoke
```

## Anti-Patterns

Avoid:

- "this seems promising" without artifact capture
- deciding article type without naming target file
- using category stats as prose instead of extracting a decision
- passing vague brainstorm notes into `draft`
- writing a brief so long that it becomes a second skill

## Exit Condition

`discover` is done only when:

1. `discover-artifacts.txt` exists and is non-empty
2. `brief.candidate.yaml` contains every discover-owned field needed by `draft`
3. `validate-discover.sh` returns `0`

Only then may `brief.candidate.yaml` replace `brief.yaml`.

