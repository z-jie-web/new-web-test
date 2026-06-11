#!/usr/bin/env bash
# validate-draft.sh — V2 draft mode validator
#
# Usage:
#   bash scripts/content/validators/validate-draft.sh <target-file>
#   TARGET_FILE=<target-file> ARTICLE_ID=<article-id> bash scripts/content/validators/validate-draft.sh
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
init_validator "validate-draft" "draft"
check_common_prereqs

# -- brief checks ------------------------------------------------
if [ -f "$CANDIDATE_BRIEF" ]; then
  if has_line '^current_mode:[[:space:]]*draft[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "current_mode is draft"
  else
    fail_prereq "current_mode is not draft"
  fi

  if has_line '^[[:space:]]{4}-[[:space:]]*'"${TARGET_FILE//\//\\/}"'[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "target file matches artifacts.target_files"
  else
    fail_fixable "target file does not match artifacts.target_files in brief"
  fi

  case "$TYPE" in
    review)
      if has_line '^[[:space:]]{2}article_type:[[:space:]]*review[[:space:]]*$' "$CANDIDATE_BRIEF"; then
        pass_item "brief article_type matches review"
      else
        fail_fixable "brief article_type does not match review target"
      fi
      ;;
    compare)
      if has_line '^[[:space:]]{2}article_type:[[:space:]]*compare[[:space:]]*$' "$CANDIDATE_BRIEF"; then
        pass_item "brief article_type matches compare"
      else
        fail_fixable "brief article_type does not match compare target"
      fi
      ;;
    blog)
      if has_line '^[[:space:]]{2}article_type:[[:space:]]*blog[[:space:]]*$' "$CANDIDATE_BRIEF"; then
        pass_item "brief article_type matches blog"
      else
        fail_fixable "brief article_type does not match blog target"
      fi
      ;;
  esac
fi

# -- frontmatter + body checks -----------------------------------
if [ -f "$TARGET_FILE" ]; then
  case "$TYPE" in
    review)
      for key in slug name category description tags url pricing pros cons bestFor lastUpdated; do
        if has_line "^${key}:[[:space:]]*.+$" "$TARGET_FILE"; then
          pass_item "frontmatter.${key} is present"
        else
          fail_fixable "frontmatter.${key} is missing"
        fi
      done
      ;;
    compare)
      for key in toolA toolB verdict winner lastUpdated; do
        if has_line "^${key}:[[:space:]]*.+$" "$TARGET_FILE"; then
          pass_item "frontmatter.${key} is present"
        else
          fail_fixable "frontmatter.${key} is missing"
        fi
      done
      ;;
    blog)
      for key in slug title description date; do
        if has_line "^${key}:[[:space:]]*.+$" "$TARGET_FILE"; then
          pass_item "frontmatter.${key} is present"
        else
          fail_fixable "frontmatter.${key} is missing"
        fi
      done
      ;;
  esac

  # Required sections
  sections_ok=1
  case "$TYPE" in
    review)
      required_sections=("## Key Features" "## Pricing" "## FAQ")
      ;;
    compare)
      required_sections=("## Pricing" "## Who Should Choose" "## FAQ")
      ;;
    blog)
      required_sections=("## FAQ")
      ;;
  esac
  for section in "${required_sections[@]}"; do
    if ! grep -qF "$section" "$TARGET_FILE"; then
      sections_ok=0
      fail_fixable "missing required section: ${section}"
    fi
  done
  if [ "$TYPE" = "blog" ]; then
    h2_count="$(grep -c '^## ' "$TARGET_FILE" || true)"
    if [ "${h2_count}" -lt 2 ]; then
      sections_ok=0
      fail_fixable "blog draft needs at least one meaningful H2 plus FAQ"
    fi
  fi
  if [ "$sections_ok" -eq 1 ]; then
    pass_item "required sections are present"
  fi

  # Placeholders
  if grep -qE "Other Tool|Varies by tool|TBD|TODO|implement later|fill in" "$TARGET_FILE"; then
    fail_fixable "placeholder text found in draft"
  else
    pass_item "no placeholder text found"
  fi

  # Pricing specificity for compare
  if [ "$TYPE" = "compare" ]; then
    if grep -qE "^\| \*\*Tool [AB]\*\*|Other Tool" "$TARGET_FILE"; then
      fail_fixable "compare pricing table uses generic tool names"
    else
      pass_item "compare pricing uses specific tool names"
    fi
  fi

  # FAQ count
  faq_count="$(grep -cE '^\*\*.*\?\*\*' "$TARGET_FILE" || true)"
  if [ "$faq_count" -ge 3 ]; then
    pass_item "FAQ count is ${faq_count}"
  else
    fail_fixable "FAQ count is ${faq_count}; need at least 3"
  fi

  # Word count
  words="$(wc -w < "$TARGET_FILE" | tr -d ' ')"
  min_words=800
  if [ "$TYPE" = "compare" ]; then
    min_words=600
  fi
  if [ "$words" -ge "$min_words" ]; then
    pass_item "word count is ${words} (min ${min_words})"
  else
    shortfall=$((min_words - words))
    if [ "$shortfall" -gt 300 ]; then
      fail_rewrite "word count is ${words}; draft is too thin for ${TYPE}"
    else
      fail_fixable "word count is ${words}; need at least ${min_words}"
    fi
  fi

  # Corrupted headings
  if grep -qE '##.*##' "$TARGET_FILE"; then
    fail_fixable "corrupted heading detected (merged headings on one line)"
  else
    pass_item "no corrupted headings found"
  fi
fi

# -- exit routing ------------------------------------------------
route_exit \
  "return to draft mode and rewrite the article body" \
  "fix mode routing or produce the missing prerequisite state before drafting" \
  "repair the draft file or candidate brief and rerun validate-draft" \
  "advance to enhance mode"
