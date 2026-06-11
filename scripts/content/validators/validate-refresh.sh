#!/usr/bin/env bash
# validate-refresh.sh — V2 refresh mode validator
#
# Usage:
#   bash scripts/content/validators/validate-refresh.sh <target-file>
#   TARGET_FILE=<target-file> ARTICLE_ID=<article-id> bash scripts/content/validators/validate-refresh.sh
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

# -- init --------------------------------------------------------
TARGET_FILE="${TARGET_FILE:-${1:-}}"
init_validator "validate-refresh" "refresh"
check_common_prereqs

# -- brief checks ------------------------------------------------
if [ -f "$CANDIDATE_BRIEF" ]; then
  if has_line '^current_mode:[[:space:]]*refresh[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "current_mode is refresh"
  else
    fail_prereq "current_mode is not refresh"
  fi

  if has_line '^parent_brief_id:[[:space:]]*.+$' "$CANDIDATE_BRIEF"; then
    pass_item "parent_brief_id is present"
  else
    fail_prereq "parent_brief_id is missing"
  fi

  if has_line '^[[:space:]]{2}refresh:[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "mode_outputs.refresh exists"
  else
    fail_prereq "mode_outputs.refresh is missing"
  fi

  if has_line '^[[:space:]]{4}refresh_reason:[[:space:]]*$' "$CANDIDATE_BRIEF" || has_line '^[[:space:]]{6}-[[:space:]]*(pricing_changed|feature_launch|comparison_outdated|tool_shutdown|content_stale|schema_or_contract_alignment)[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "refresh_reason block exists"
  else
    fail_prereq "refresh_reason is missing"
  fi

  if has_line '^[[:space:]]{4}changed_sections:[[:space:]]*$' "$CANDIDATE_BRIEF" && has_line '^[[:space:]]{6}-[[:space:]]*.+$' "$CANDIDATE_BRIEF"; then
    pass_item "changed_sections are present"
  else
    fail_fixable "changed_sections are missing or empty"
  fi

  if has_line '^[[:space:]]{4}stale_claims_removed:[[:space:]]*$' "$CANDIDATE_BRIEF" && has_line '^[[:space:]]{6}-[[:space:]]*.+$' "$CANDIDATE_BRIEF"; then
    pass_item "stale_claims_removed are present"
  else
    fail_fixable "stale_claims_removed are missing or empty"
  fi

  if has_line '^[[:space:]]{4}files_touched:[[:space:]]*$' "$CANDIDATE_BRIEF" && has_line '^[[:space:]]{6}-[[:space:]]*'"${TARGET_FILE//\//\\/}"'[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "files_touched includes target file"
  else
    fail_fixable "files_touched is missing target file"
  fi
fi

# -- freshness metadata ------------------------------------------
case "$TYPE" in
  review|compare)
    last_updated="$(frontmatter_value lastUpdated "$TARGET_FILE")"
    if [ -n "$last_updated" ]; then
      pass_item "refresh target has lastUpdated"
    else
      fail_fixable "refresh target is missing lastUpdated"
    fi
    ;;
  blog)
    date_value="$(frontmatter_value date "$TARGET_FILE")"
    if [ -n "$date_value" ]; then
      pass_item "refresh target has date"
    else
      fail_fixable "refresh target is missing date"
    fi
    ;;
esac

# If refresh says no stale claims were removed, it's not a real refresh.
if has_line '^[[:space:]]{4}stale_claims_removed:[[:space:]]*\[\][[:space:]]*$' "$CANDIDATE_BRIEF"; then
  fail_rewrite "refresh removed no stale claims; this is not a meaningful refresh"
fi

# -- exit routing ------------------------------------------------
route_exit \
  "the article needs a redraft instead of a light refresh" \
  "create a valid refresh brief lineage and reason before refreshing" \
  "complete the refresh notes and rerun validate-refresh" \
  "advance to enhance mode"
