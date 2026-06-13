#!/usr/bin/env bash
# validate-publish.sh — V2 publish mode validator
#
# Usage:
#   bash scripts/content/validators/validate-publish.sh <target-file>
#   TARGET_FILE=<target-file> ARTICLE_ID=<article-id> bash scripts/content/validators/validate-publish.sh
#
# Exit codes:
#   0 = pass
#   1 = fixable
#   2 = wrong mode / missing prerequisite
#   3 = rewrite required

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/common.sh"

if [ "${1:-}" = "--json" ]; then
  VALIDATOR_OUTPUT="json"
  shift
fi

SKIP_BUILD="${SKIP_BUILD:-0}"

PASS_ITEMS=()
FIXABLE_ITEMS=()
PREREQ_ITEMS=()
REWRITE_ITEMS=()

# -- init --------------------------------------------------------
TARGET_FILE="${TARGET_FILE:-${1:-}}"
init_validator "validate-publish" "publish"
check_common_prereqs

# -- target file existence ---------------------------------------
if [ ! -f "$TARGET_FILE" ]; then
  fail_prereq "target file does not exist on disk: $TARGET_FILE (brief target_files path may be wrong)"
fi

# -- brief checks ------------------------------------------------
if [ -f "$CANDIDATE_BRIEF" ]; then
  if has_line '^current_mode:[[:space:]]*publish[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "current_mode is publish"
  else
    fail_prereq "current_mode is not publish"
  fi

  if has_line '^[[:space:]]{2}draft:' "$CANDIDATE_BRIEF" || has_line '^[[:space:]]{2}enhance:' "$CANDIDATE_BRIEF"; then
    pass_item "draft/enhance output exists in candidate brief"
  else
    fail_prereq "draft or enhance state is missing"
  fi
fi

# -- date validation by type -------------------------------------
case "$TYPE" in
  review|compare)
    last_updated="$(frontmatter_value lastUpdated "$TARGET_FILE")"
    if [ -z "$last_updated" ]; then
      fail_fixable "lastUpdated is missing"
    elif is_valid_date "$last_updated"; then
      pass_item "lastUpdated format is valid (${last_updated})"
    else
      fail_fixable "lastUpdated format is invalid (${last_updated})"
    fi
    ;;
  blog)
    date_value="$(frontmatter_value date "$TARGET_FILE")"
    if [ -z "$date_value" ]; then
      fail_fixable "date is missing"
    elif is_valid_date "$date_value"; then
      pass_item "date format is valid (${date_value})"
    else
      fail_fixable "date format is invalid (${date_value})"
    fi
    ;;
esac

# -- schema-ready frontmatter ------------------------------------
case "$TYPE" in
  review)
    pros_count="$(count_yaml_list "pros" "$TARGET_FILE")"
    if [ "$pros_count" -ge 3 ]; then
      pass_item "review pros count is ${pros_count}"
    else
      fail_fixable "review pros count is ${pros_count}; need at least 3"
    fi

    pricing_val="$(frontmatter_value pricing "$TARGET_FILE")"
    if echo "$pricing_val" | grep -Eq '^(Free|Freemium|Paid)$'; then
      pass_item "pricing enum is valid (${pricing_val})"
    else
      fail_fixable "pricing enum is invalid (${pricing_val})"
    fi

    tags_count="$(count_yaml_list "tags" "$TARGET_FILE")"
    if [ "$tags_count" -ge 1 ]; then
      pass_item "review tags count is ${tags_count}"
    else
      fail_fixable "review tags are empty"
    fi
    ;;
  compare)
    tool_a="$(frontmatter_value toolA "$TARGET_FILE")"
    tool_b="$(frontmatter_value toolB "$TARGET_FILE")"
    winner="$(frontmatter_value winner "$TARGET_FILE")"
    verdict="$(frontmatter_value verdict "$TARGET_FILE")"

    for slug in "$tool_a" "$tool_b"; do
      if [ -n "$slug" ] && [ -f "content/reviews/${slug}.mdx" ]; then
        pass_item "compare source review exists for ${slug}"
      else
        fail_fixable "compare source review is missing for ${slug}"
      fi
    done

    if [ -n "$verdict" ]; then
      pass_item "compare verdict is present"
    else
      fail_fixable "compare verdict is missing"
    fi
    if echo "$winner" | grep -Eq '^(depends|tool-a|tool-b|'"$tool_a"'|'"$tool_b"')$'; then
      pass_item "compare winner field is present"
    else
      fail_fixable "compare winner is missing or invalid (${winner})"
    fi
    ;;
  blog)
    title_val="$(frontmatter_value title "$TARGET_FILE")"
    desc_val="$(frontmatter_value description "$TARGET_FILE")"
    if [ -n "$title_val" ]; then
      pass_item "blog title is present"
    else
      fail_fixable "blog title is missing"
    fi
    if [ -n "$desc_val" ]; then
      pass_item "blog description is present"
    else
      fail_fixable "blog description is missing"
    fi
    ;;
esac

# -- article-check.sh sub-check ----------------------------------
article_check_output="$(bash scripts/article-check.sh "$TARGET_FILE" 2>&1)"
article_check_code=$?
if ! json_enabled; then
  echo "ARTICLE CHECK:"
  echo "$article_check_output"
  echo
fi
case "$article_check_code" in
  0)
    pass_item "article-check.sh passed"
    ;;
  1)
    fail_fixable "article-check.sh returned fixable issues"
    ;;
  2)
    fail_rewrite "article-check.sh returned rewrite required"
    ;;
  *)
    fail_fixable "article-check.sh returned unexpected exit code ${article_check_code}"
    ;;
esac

# -- backlink check ----------------------------------------------
backlink_output="$(bash scripts/find-link-ops.sh "$TARGET_FILE" 2>&1)"
if ! json_enabled; then
  echo "BACKLINK CHECK:"
  echo "$backlink_output"
  echo
fi
missing_backlinks="$(printf '%s\n' "$backlink_output" | sed -n 's/^MISSING BACKLINKS (\([0-9][0-9]*\)).*/\1/p' | head -n 1)"
candidate_replace="$(printf '%s\n' "$backlink_output" | sed -n 's/^CANDIDATE_REPLACE (\([0-9][0-9]*\)).*/\1/p' | head -n 1)"

article_link_path="/blog/${ARTICLE_ID}"
if [ "$TYPE" = "review" ]; then
  article_link_path="/reviews/${ARTICLE_ID}"
fi
if [ "$TYPE" = "compare" ]; then
  article_link_path="/compare/${ARTICLE_ID}"
fi

applied_targets=()
candidate_pool=()
if [ -f "$CANDIDATE_BRIEF" ]; then
  while IFS= read -r target; do
    [ -n "$target" ] && applied_targets+=("$target")
  done < <(awk '
    /^[[:space:]]{4}backlink_targets_applied:[[:space:]]*$/ {found=1; next}
    found && /^[[:space:]]{6}-[[:space:]]*/ {
      sub(/^[[:space:]]{6}-[[:space:]]*/, "")
      gsub(/^"|"$/, "")
      gsub(/^'\''|'\''$/, "")
      print
      next
    }
    found && /^[[:space:]]{4}[a-zA-Z_]/ {exit}
  ' "$CANDIDATE_BRIEF")
fi

while IFS='|' read -r marker target _rest; do
  case "$marker" in
    "  REPLACE"|"  MISSING"|"  LINKED")
      [ -n "$target" ] && candidate_pool+=("$target")
      ;;
  esac
done < <(printf '%s\n' "$backlink_output")

applied_count="${#applied_targets[@]}"
verified_applied=0
invalid_applied=0
not_in_pool=0

if [ "$applied_count" -gt 0 ]; then
  for target in "${applied_targets[@]}"; do
    if [ ! -f "$target" ]; then
      invalid_applied=$((invalid_applied + 1))
      continue
    fi
    in_pool=0
    for candidate in "${candidate_pool[@]-}"; do
      if [ "$target" = "$candidate" ]; then
        in_pool=1
        break
      fi
    done
    if [ "$in_pool" -eq 0 ]; then
      not_in_pool=$((not_in_pool + 1))
      continue
    fi
    if grep -qF "](${article_link_path})" "$target"; then
      verified_applied=$((verified_applied + 1))
    else
      invalid_applied=$((invalid_applied + 1))
    fi
  done
fi

if [ "$applied_count" -ge 3 ] && [ "$applied_count" -le 5 ] && [ "$invalid_applied" -eq 0 ] && [ "$not_in_pool" -eq 0 ]; then
  pass_item "backlink_targets_applied contains ${applied_count} verified target file(s)"
  if [ -n "$missing_backlinks" ]; then
    pass_item "backlink opportunity pool still reports ${missing_backlinks} remaining candidate(s), treated as advisory"
  fi
  if [ -n "$candidate_replace" ]; then
    pass_item "backlink candidate replace pool reports ${candidate_replace} replacement candidate(s)"
  fi
elif [ "$applied_count" -eq 0 ]; then
  fail_fixable "backlink_targets_applied is missing; record 3-5 selected backlink targets from MISSING/CANDIDATE_REPLACE in the publish brief"
elif [ "$not_in_pool" -gt 0 ]; then
  fail_fixable "backlink_targets_applied includes ${not_in_pool} file(s) outside the current MISSING/CANDIDATE_REPLACE candidate pool"
else
  fail_fixable "backlink_targets_applied must contain 3-5 verified files; got ${applied_count} target(s) with ${invalid_applied} invalid"
fi

# -- build check -------------------------------------------------
if [ "$SKIP_BUILD" = "1" ]; then
  pass_item "build check skipped via SKIP_BUILD=1"
else
  build_output="$(npm run build 2>&1)"
  build_code=$?
  if ! json_enabled; then
    echo "BUILD CHECK:"
    printf '%s\n' "$build_output" | tail -n 40
    echo
  fi
  if [ "$build_code" -eq 0 ]; then
    pass_item "npm run build passed"
  else
    fail_fixable "npm run build failed"
  fi
fi

# -- exit routing ------------------------------------------------
route_exit \
  "return to draft mode and rework the article" \
  "complete upstream mode work before attempting publish" \
  "fix publish blockers and rerun validate-publish" \
  "mark the article as delivery-ready"
