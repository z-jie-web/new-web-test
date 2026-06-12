#!/usr/bin/env bash
# validate-enhance.sh — V2 enhance mode validator
#
# Usage:
#   bash scripts/content/validators/validate-enhance.sh <target-file>
#   TARGET_FILE=<target-file> ARTICLE_ID=<article-id> bash scripts/content/validators/validate-enhance.sh
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

PASS_ITEMS=()
FIXABLE_ITEMS=()
PREREQ_ITEMS=()
REWRITE_ITEMS=()

# -- init --------------------------------------------------------
TARGET_FILE="${TARGET_FILE:-${1:-}}"
init_validator "validate-enhance" "enhance"
check_common_prereqs

# -- brief checks ------------------------------------------------
if [ -f "$CANDIDATE_BRIEF" ]; then
  if has_line '^current_mode:[[:space:]]*enhance[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "current_mode is enhance"
  else
    fail_prereq "current_mode is not enhance"
  fi

  if has_line '^[[:space:]]{2}render_contract:[[:space:]]*$' "$CANDIDATE_BRIEF"; then
    pass_item "render_contract exists in brief"
  else
    fail_prereq "render_contract is missing from brief"
  fi

  if has_line '^[[:space:]]{2}draft:' "$CANDIDATE_BRIEF" || has_line '^[[:space:]]{4}target_file:[[:space:]]*.+$' "$CANDIDATE_BRIEF"; then
    pass_item "draft output exists in candidate brief"
  else
    fail_prereq "draft output state is missing"
  fi
fi

# -- internal links ----------------------------------------------
internal_links="$(grep -oE '\]\((/reviews/[^)]*|/compare/[^)]*|/blog/[^)]*|/categories/[^)]*)\)' "$TARGET_FILE" | wc -l | tr -d ' ')"
if [ "$internal_links" -ge 2 ]; then
  pass_item "internal links count is ${internal_links}"
else
  fail_fixable "internal links count is ${internal_links}; need at least 2"
fi

# -- external links ----------------------------------------------
external_links_raw="$(grep -oE '\[[^]]+\]\(https?://[^)]+\)' "$TARGET_FILE" | sed -E 's/.*\((https?:\/\/[^)]+)\)/\1/' || true)"
external_count=0
third_party_count=0
if [ -n "$external_links_raw" ]; then
  external_count="$(printf '%s\n' "$external_links_raw" | sed '/^$/d' | wc -l | tr -d ' ')"
fi

official_hosts=()
site_host="toolporto.com"

case "$TYPE" in
  review)
    review_url="$(frontmatter_value url "$TARGET_FILE")"
    if [ -n "$review_url" ]; then
      official_hosts+=("$(host_from_url "$review_url")")
    fi
    ;;
  compare)
    tool_a="$(frontmatter_value toolA "$TARGET_FILE")"
    tool_b="$(frontmatter_value toolB "$TARGET_FILE")"
    for slug in "$tool_a" "$tool_b"; do
      if [ -n "$slug" ] && [ -f "content/reviews/${slug}.mdx" ]; then
        review_url="$(frontmatter_value url "content/reviews/${slug}.mdx")"
        if [ -n "$review_url" ]; then
          official_hosts+=("$(host_from_url "$review_url")")
        fi
      fi
    done
    ;;
  blog)
    while IFS= read -r rel_slug; do
      if [ -n "$rel_slug" ] && [ -f "content/reviews/${rel_slug}.mdx" ]; then
        review_url="$(frontmatter_value url "content/reviews/${rel_slug}.mdx")"
        if [ -n "$review_url" ]; then
          official_hosts+=("$(host_from_url "$review_url")")
        fi
      fi
    done < <(awk '/^relatedReviews:/{found=1; next} found && /^  - /{gsub(/^  - /,""); gsub(/^"|"$/,""); print} found && /^[a-zA-Z]/ {exit}' "$TARGET_FILE")
    ;;
esac

KNOWN_THIRD_PARTY='producthunt\.com|reddit\.com|news\.ycombinator\.com|trends\.google\.com|g2\.com|capterra\.com|statista\.com|gartner\.com|forrester\.com'

if [ -n "$external_links_raw" ]; then
  while IFS= read -r url; do
    [ -z "$url" ] && continue
    host="$(host_from_url "$url")"
    if echo "$host" | grep -Eq "$KNOWN_THIRD_PARTY"; then
      third_party_count=$((third_party_count + 1))
      continue
    fi
    is_official=0
    for official_host in "${official_hosts[@]-}"; do
      if [ -n "$official_host" ] && [ "$host" = "$official_host" ]; then
        is_official=1
        break
      fi
    done
    if [ "$host" != "$site_host" ] && [ "$is_official" -eq 0 ]; then
      third_party_count=$((third_party_count + 1))
    fi
  done < <(printf '%s\n' "$external_links_raw")
fi

if [ "$external_count" -ge 3 ]; then
  pass_item "external links count is ${external_count}"
else
  fail_fixable "external links count is ${external_count}; need at least 3"
fi

if [ "$third_party_count" -ge 1 ]; then
  pass_item "third-party source count is ${third_party_count}"
else
  fail_fixable "third-party source count is ${third_party_count}; need at least 1"
fi

# -- images and alt text -----------------------------------------
image_refs="$(grep -oE '!\[[^]]*\]\((/logos/[^)]*|/images/[^)]*|[^)]*screenshot[^)]*|[^)]*diagram[^)]*)\)' "$TARGET_FILE" || true)"
image_count=0
invalid_image_paths=0
short_alt_count=0
missing_image_files=0

if [ -n "$image_refs" ]; then
  while IFS= read -r ref; do
    [ -z "$ref" ] && continue
    image_count=$((image_count + 1))
    alt="$(printf '%s' "$ref" | sed -E 's/^!\[([^]]*)\]\([^)]+\)$/\1/')"
    src="$(printf '%s' "$ref" | sed -E 's/^!\[[^]]*\]\(([^)]+)\)$/\1/')"
    alt_len="${#alt}"
    if [ "$alt_len" -lt 15 ]; then
      short_alt_count=$((short_alt_count + 1))
    fi
    if ! echo "$src" | grep -Eq '^(/logos/|/images/|[^)]*screenshot[^)]*|[^)]*diagram[^)]*)'; then
      invalid_image_paths=$((invalid_image_paths + 1))
    fi
    if [[ "$src" == /* ]]; then
      local_path="public${src}"
      if [ ! -f "$local_path" ]; then
        missing_image_files=$((missing_image_files + 1))
      fi
    else
      missing_image_files=$((missing_image_files + 1))
    fi
  done < <(printf '%s\n' "$image_refs")
fi

if [ "$image_count" -ge 1 ]; then
  pass_item "image count is ${image_count}"
  if [ "$short_alt_count" -eq 0 ]; then
    pass_item "all image alt texts meet minimum length"
  else
    fail_fixable "${short_alt_count} image alt text(s) are shorter than 15 characters"
  fi

  if [ "$invalid_image_paths" -eq 0 ]; then
    pass_item "all image paths are in approved path families"
  else
    fail_fixable "${invalid_image_paths} image path(s) fall outside approved path families"
  fi

  if [ "$missing_image_files" -eq 0 ]; then
    pass_item "all referenced image files exist on disk"
  else
    fail_fixable "${missing_image_files} referenced image file(s) are missing on disk"
  fi
else
  fail_fixable "no markdown images found"
fi

# -- render contract conflict detection ---------------------------
if [ "$TYPE" = "compare" ] && grep -q '^## At a Glance' "$TARGET_FILE"; then
  fail_fixable 'compare draft duplicates the auto-rendered quick summary surface ("## At a Glance")'
fi
if [ "$TYPE" = "review" ] && grep -qE '^## (TL;DR|Key Takeaways)$' "$TARGET_FILE"; then
  fail_fixable 'review draft duplicates the auto-rendered TL;DR surface'
fi
if grep -qE '<CTABox|CTA_PLACEHOLDER' "$TARGET_FILE"; then
  fail_fixable "manual CTA placeholder/component found despite auto-rendered CTA surfaces"
fi

# -- AI pattern scoring ------------------------------------------
body_plain="$(extract_body_text "$TARGET_FILE")"
body_words="$(printf '%s\n' "$body_plain" | wc -w | tr -d ' ')"
body_intro="$(printf '%s' "$body_plain" | tr '\n' ' ' | awk '{for(i=1;i<=100 && i<=NF;i++) printf $i " "}')"
body_outro="$(printf '%s\n' "$body_plain" | awk -v RS='' 'NF{last=$0} END{print last}')"

	source "${SCRIPT_DIR}/lib/ai-patterns.sh"

total_hits=0
intro_hits=0
outro_hits=0
strong_hits=0
emdash_count=0
emdash_density="0"
ai_score="0"

if [ -n "$AI_PATTERNS" ]; then
  total_hits="$(printf '%s\n' "$body_plain" | grep -ioE "$AI_PATTERNS" | wc -l | tr -d ' ' || true)"
  intro_hits="$(printf '%s\n' "$body_intro" | grep -ioE "$AI_PATTERNS" | wc -l | tr -d ' ' || true)"
  outro_hits="$(printf '%s\n' "$body_outro" | grep -ioE "$AI_PATTERNS" | wc -l | tr -d ' ' || true)"
  strong_hits="$(printf '%s\n' "$body_plain" | grep -ioE "$STRONG_PATTERNS" | wc -l | tr -d ' ' || true)"
fi

if [ "$body_words" -gt 0 ]; then
  emdash_count="$(printf '%s\n' "$body_plain" | grep -o '—' | wc -l | tr -d ' ')"
  emdash_density="$(awk -v e="$emdash_count" -v w="$body_words" 'BEGIN { printf "%.2f", (w > 0 ? e * 100 / w : 0) }')"
fi

ai_score="$(awk -v total="$total_hits" -v intro="$intro_hits" -v outro="$outro_hits" -v strong="$strong_hits" 'BEGIN { printf "%.2f", total*0.5 + intro*0.5 + outro*0.5 + strong*1.5 }')"
pass_item "AI pattern score is ${ai_score}"
pass_item "em dash density is ${emdash_density}/100 words"

if awk -v score="$ai_score" 'BEGIN { exit !(score > 3.5) }'; then
  fail_rewrite "AI pattern score is ${ai_score}; rewrite required"
elif awk -v score="$ai_score" 'BEGIN { exit !(score >= 2.0) }'; then
  fail_fixable "AI pattern score is ${ai_score}; reduce intro/outro pattern density"
fi

if awk -v density="$emdash_density" 'BEGIN { exit !(density > 2.0) }'; then
  fail_rewrite "em dash density is ${emdash_density}/100 words; rewrite required"
elif awk -v density="$emdash_density" 'BEGIN { exit !(density > 1.0) }'; then
  fail_fixable "em dash density is ${emdash_density}/100 words; reduce punctuation density"
elif awk -v density="$emdash_density" 'BEGIN { exit !(density >= 0.80) }'; then
  pass_item "em dash density is ${emdash_density}/100 words (advisory: slightly elevated)"
fi

# -- exit routing ------------------------------------------------
route_exit \
  "return to draft mode and rewrite the conflicting sections" \
  "complete draft prerequisites before running enhance validation" \
  "apply editorial fixes and rerun validate-enhance" \
  "advance to publish mode"
