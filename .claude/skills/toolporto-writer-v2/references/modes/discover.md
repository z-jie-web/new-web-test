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

Recommended pattern:

```bash
mkdir -p ~/.claude/state/toolporto-writer/<article-id>
{
  echo "=== check-duplicate ==="
  bash scripts/check-duplicate.sh "<topic>"
  echo
  echo "=== category-stats ==="
  bash scripts/category-stats.sh
  echo
  echo "=== notes ==="
  echo "article_type=compare"
  echo "serp_decision=write"
  echo "hub_spoke_role=spoke"
} | tee ~/.claude/state/toolporto-writer/<article-id>/discover-artifacts.txt
```

If the validator cannot find the artifact file, `discover` did not complete.

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

