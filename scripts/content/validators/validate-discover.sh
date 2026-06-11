#!/usr/bin/env bash
# validate-discover.sh — V2 discover mode validator
#
# Usage:
#   bash scripts/content/validators/validate-discover.sh <article-id>
#   ARTICLE_ID=<article-id> bash scripts/content/validators/validate-discover.sh
#   STATE_DIR=~/.claude/state/toolporto-writer/<article-id> bash scripts/content/validators/validate-discover.sh
#
# Exit codes:
#   0 = pass
#   1 = fixable
#   2 = wrong mode / missing prerequisite
#   3 = rewrite required

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/common.sh"

PASS_ITEMS=()
FIXABLE_ITEMS=()
PREREQ_ITEMS=()
REWRITE_ITEMS=()

# -- init (discover doesn't need a target file) ------------------
TARGET_FILE="${TARGET_FILE:-}"
ARTICLE_ID="${ARTICLE_ID:-${1:-}}"
STATE_DIR="${STATE_DIR:-}"

if [ -z "$STATE_DIR" ]; then
  if [ -n "$ARTICLE_ID" ] && [ -d "$ARTICLE_ID" ]; then
    STATE_DIR="$ARTICLE_ID"
    ARTICLE_ID="$(basename "$STATE_DIR")"
  elif [ -n "$ARTICLE_ID" ]; then
    STATE_DIR="${STATE_ROOT_DEFAULT}/${ARTICLE_ID}"
  fi
fi

if [ -z "$STATE_DIR" ]; then
  print_header "validate-discover" "discover"
  echo "FAIL:"
  echo "- missing ARTICLE_ID or STATE_DIR"
  echo
  echo "RECOMMENDED ACTION:"
  echo "- pass <article-id> as the first argument, or set ARTICLE_ID / STATE_DIR"
  echo
  echo "EXIT CODE: 2"
  exit 2
fi

CANDIDATE_BRIEF="${STATE_DIR}/brief.candidate.yaml"
DISCOVER_ARTIFACTS="${STATE_DIR}/discover-artifacts.txt"

print_header "validate-discover" "discover"
echo "Article ID: ${ARTICLE_ID}"
echo "State dir: ${STATE_DIR}"
echo "Candidate brief: ${CANDIDATE_BRIEF}"
echo "Discover artifacts: ${DISCOVER_ARTIFACTS}"
echo

# -- prerequisite checks ----------------------------------------
if [ ! -d "$STATE_DIR" ]; then
  fail_prereq "state directory is missing"
fi

if [ ! -f "$CANDIDATE_BRIEF" ]; then
  fail_prereq "brief.candidate.yaml is missing"
fi

if [ ! -e "$DISCOVER_ARTIFACTS" ]; then
  fail_prereq "discover-artifacts.txt is missing"
elif [ ! -s "$DISCOVER_ARTIFACTS" ]; then
  fail_fixable "discover-artifacts.txt exists but is empty"
fi

TARGET_FILE=""
ARTICLE_TYPE=""
DUPLICATE_STATUS=""
SERP_DECISION=""

if [ -f "$CANDIDATE_BRIEF" ]; then
  if has_line '^brief_version:[[:space:]]*2[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "brief_version is 2"
  else
    fail_fixable "brief_version is missing or not 2"
  fi

  if has_line '^current_mode:[[:space:]]*discover[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "current_mode is discover"
  else
    fail_prereq "current_mode is not discover"
  fi

  if has_line '^article_id:[[:space:]]*.+$' "$CANDIDATE_BRIEF"; then
    pass_item "article_id is present"
  else
    fail_fixable "article_id is missing"
  fi

  ARTICLE_TYPE="$(extract_yaml_scalar '^[[:space:]]{2}article_type:[[:space:]]*"?([^"]+)"?[[:space:]]*$' "$CANDIDATE_BRIEF")"
  case "$ARTICLE_TYPE" in
    review|compare|blog)
      pass_item "intent.article_type is ${ARTICLE_TYPE}"
      ;;
    *)
      fail_fixable "intent.article_type is missing or invalid"
      ;;
  esac

  if has_line '^[[:space:]]{2}category:[[:space:]]*"?[^"]+"?[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "intent.category is present"
  else
    fail_fixable "intent.category is missing"
  fi

  if has_line '^[[:space:]]{2}primary_keyword:[[:space:]]*"?[^"]+"?[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "intent.primary_keyword is present"
  else
    fail_fixable "intent.primary_keyword is missing"
  fi

  if has_line '^[[:space:]]{2}search_intent:[[:space:]]*"?[^"]+"?[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "intent.search_intent is present"
  else
    fail_fixable "intent.search_intent is missing"
  fi

  if has_line '^[[:space:]]{2}audience:[[:space:]]*"?[^"]+"?[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "intent.audience is present"
  else
    fail_fixable "intent.audience is missing"
  fi

  TARGET_FILE="$(grep -E '^[[:space:]]{4}-[[:space:]]*content/(reviews|compare|blog)/[^[:space:]]+\.mdx[[:space:]]*$' "$CANDIDATE_BRIEF" 2>/dev/null | head -n 1 | sed -E 's/^[[:space:]]*-[[:space:]]*//; s/[[:space:]]*$//')"
  if [ -n "$TARGET_FILE" ]; then
    pass_item "artifacts.target_files contains a content target"
  else
    fail_fixable "artifacts.target_files is missing a valid content path"
  fi

  if has_line '^[[:space:]]{2}angle:[[:space:]]*"?[^"]+"?[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "decisions.angle is present"
  else
    fail_fixable "decisions.angle is missing"
  fi

  if has_line '^[[:space:]]{2}render_contract:[[:space:]]*$' "$CANDIDATE_BRIEF" \
    && has_line '^[[:space:]]{4}auto_rendered:' "$CANDIDATE_BRIEF" \
    && has_line '^[[:space:]]{4}mdx_must_not_duplicate:' "$CANDIDATE_BRIEF"; then
    pass_item "decisions.render_contract skeleton is present"
  else
    fail_fixable "decisions.render_contract is incomplete"
  fi

  DUPLICATE_STATUS="$(extract_yaml_scalar '^[[:space:]]{4}duplicate_check_status:[[:space:]]*"?([^"]+)"?[[:space:]]*$' "$CANDIDATE_BRIEF")"
  case "$DUPLICATE_STATUS" in
    clear|similar|exact)
      pass_item "mode_outputs.discover.duplicate_check_status is ${DUPLICATE_STATUS}"
      ;;
    *)
      fail_fixable "mode_outputs.discover.duplicate_check_status is missing or invalid"
      ;;
  esac

  SERP_DECISION="$(extract_yaml_scalar '^[[:space:]]{4}serp_decision:[[:space:]]*"?([^"]+)"?[[:space:]]*$' "$CANDIDATE_BRIEF")"
  case "$SERP_DECISION" in
    write|skip|uncertain)
      pass_item "mode_outputs.discover.serp_decision is ${SERP_DECISION}"
      ;;
    *)
      fail_fixable "mode_outputs.discover.serp_decision is missing or invalid"
      ;;
  esac

  case "$(extract_yaml_scalar '^[[:space:]]{4}hub_spoke_role:[[:space:]]*"?([^"]+)"?[[:space:]]*$' "$CANDIDATE_BRIEF")" in
    hub|spoke|connector)
      pass_item "mode_outputs.discover.hub_spoke_role is present"
      ;;
    *)
      fail_fixable "mode_outputs.discover.hub_spoke_role is missing or invalid"
      ;;
  esac
fi

# -- discover artifact checks ------------------------------------
if [ -s "$DISCOVER_ARTIFACTS" ]; then
  if has_line '^=== check-duplicate ===$' "$DISCOVER_ARTIFACTS" && has_line '^Content Duplicate Check$' "$DISCOVER_ARTIFACTS"; then
    pass_item "duplicate-check output captured in discover artifacts"
  else
    fail_fixable "duplicate-check output is missing from discover artifacts"
  fi

  if has_line '^=== category-stats ===$' "$DISCOVER_ARTIFACTS" && has_line '^Category Health Dashboard$' "$DISCOVER_ARTIFACTS"; then
    pass_item "category-stats output captured in discover artifacts"
  else
    fail_fixable "category-stats output is missing from discover artifacts"
  fi
fi

# -- path/type consistency ---------------------------------------
if [ -n "$TARGET_FILE" ] && [ -n "$ARTICLE_TYPE" ]; then
  case "$ARTICLE_TYPE" in
    review)
      if [[ "$TARGET_FILE" == content/reviews/*.mdx ]]; then
        pass_item "target file path matches review article type"
      else
        fail_fixable "target file path does not match review article type"
      fi
      ;;
    compare)
      if [[ "$TARGET_FILE" == content/compare/*.mdx ]]; then
        pass_item "target file path matches compare article type"
        compare_slug="$(basename "$TARGET_FILE" .mdx)"
        tool_a="${compare_slug%%-vs-*}"
        tool_b="${compare_slug##*-vs-}"
        if [ "$tool_a" = "$compare_slug" ] || [ -z "$tool_b" ]; then
          fail_fixable "compare target file slug is not in tool-a-vs-tool-b form"
        else
          missing_compare_prereq=0
          if [ ! -f "content/reviews/${tool_a}.mdx" ] && ! has_line "^[[:space:]]{4}-[[:space:]]*content/reviews/${tool_a}\.mdx[[:space:]]*$" "$CANDIDATE_BRIEF"; then
            missing_compare_prereq=1
            fail_prereq "compare prerequisite review missing for ${tool_a}"
          fi
          if [ ! -f "content/reviews/${tool_b}.mdx" ] && ! has_line "^[[:space:]]{4}-[[:space:]]*content/reviews/${tool_b}\.mdx[[:space:]]*$" "$CANDIDATE_BRIEF"; then
            missing_compare_prereq=1
            fail_prereq "compare prerequisite review missing for ${tool_b}"
          fi
          if [ $missing_compare_prereq -eq 0 ]; then
            pass_item "compare prerequisites are satisfied or declared in target files"
          fi
        fi
      else
        fail_fixable "target file path does not match compare article type"
      fi
      ;;
    blog)
      if [[ "$TARGET_FILE" == content/blog/*.mdx ]]; then
        pass_item "target file path matches blog article type"
      else
        fail_fixable "target file path does not match blog article type"
      fi
      ;;
  esac
fi

# -- hard blocks -------------------------------------------------
if [ "$SERP_DECISION" = "skip" ]; then
  fail_rewrite "discover concluded serp_decision=skip; do not advance to draft"
fi

if [ "$DUPLICATE_STATUS" = "exact" ]; then
  fail_rewrite "topic is marked as an exact duplicate; use refresh mode or choose a different article path"
fi

# -- exit routing ------------------------------------------------
route_exit \
  "do not continue to draft; choose refresh mode or re-run discover with a materially different topic" \
  "go back and produce the missing prerequisite state or artifacts" \
  "fix the candidate brief or artifact file and rerun validate-discover" \
  "advance to draft mode"
