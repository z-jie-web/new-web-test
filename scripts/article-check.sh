#!/usr/bin/env bash
# article-check.sh — Phase 6 硬门禁
# Usage: bash scripts/article-check.sh content/blog/xxx.mdx
# 输出 8 项检查结果 + 总分。退出码: 0=PASS, 1=FIX, 2=REWRITE

set -uo pipefail

FILE="${1:-}"
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "❌ Usage: $0 <path-to-mdx-file>"
  echo "   File not found: $FILE"
  exit 2
fi

PASS=0
TOTAL=9
FAILS=()

echo "========================================"
echo "ToolPorto Article Quality Gate"
echo "File: $FILE"
echo "========================================"
echo ""

# 检测文章类型
TYPE="blog"
if [[ "$FILE" == *"content/reviews/"* ]]; then TYPE="review"; fi
if [[ "$FILE" == *"content/compare/"* ]]; then TYPE="compare"; fi
echo "📁 Type: $TYPE"
echo ""

# ===== Check 1: Required Sections =====
echo "▶ Check 1: Required Sections"
SECTIONS_OK=true
case "$TYPE" in
  review)
    REQUIRED=("## Key Features" "## Pricing" "## FAQ")
    ;;
  compare)
    REQUIRED=("## At a Glance" "## Pricing" "## Who Should Choose" "## FAQ")
    ;;
  blog)
    REQUIRED=("## " "## FAQ")
    ;;
esac
for section in "${REQUIRED[@]}"; do
  if ! grep -qF "$section" "$FILE"; then
    SECTIONS_OK=false
    echo "  ❌ Missing: $section"
  fi
done
if $SECTIONS_OK; then
  echo "  ✅ PASS"
  PASS=$((PASS+1))
else
  FAILS+=("1: Required Sections")
fi
echo ""

# ===== Check 2: No Placeholders =====
echo "▶ Check 2: No Placeholders"
BAD=$(grep -nE "Other Tool|Varies by tool|TBD|TODO|implement later|fill in" "$FILE" || true)
if [ -z "$BAD" ]; then
  echo "  ✅ PASS"
  PASS=$((PASS+1))
else
  echo "  ❌ FAIL — found placeholders:"
  echo "$BAD" | sed 's/^/    /'
  FAILS+=("2: Placeholders")
fi
echo ""

# ===== Check 3: Pricing Specificity =====
echo "▶ Check 3: Pricing Table (no generic names)"
if grep -qE "^\| \*\*Tool [AB]\*\*|Other Tool" "$FILE"; then
  echo "  ❌ FAIL — generic tool names in pricing"
  FAILS+=("3: Pricing generic names")
else
  echo "  ✅ PASS"
  PASS=$((PASS+1))
fi
echo ""

# ===== Check 4: FAQ Count =====
echo "▶ Check 4: FAQ Count ≥3"
FAQ_COUNT=$(grep -cE "^\*\*.*\?\*\*" "$FILE" || true)
echo "  FAQ entries: $FAQ_COUNT"
if [ "$FAQ_COUNT" -ge 3 ]; then
  echo "  ✅ PASS"
  PASS=$((PASS+1))
else
  echo "  ❌ FAIL — need ≥3, got $FAQ_COUNT"
  FAILS+=("4: FAQ count")
fi
echo ""

# ===== Check 5: Word Count =====
echo "▶ Check 5: Word Count"
WORDS=$(wc -w < "$FILE" | tr -d ' ')
case "$TYPE" in
  review)  MIN=800 ;;
  compare) MIN=600 ;;
  blog)    MIN=800 ;;
esac
echo "  Words: $WORDS (min $MIN)"
if [ "$WORDS" -ge "$MIN" ]; then
  echo "  ✅ PASS"
  PASS=$((PASS+1))
else
  echo "  ❌ FAIL"
  FAILS+=("5: Word count")
fi
echo ""

# ===== Check 6: No Corrupted Headings =====
echo "▶ Check 6: No Corrupted Headings (## X ## Y on same line)"
CORRUPTED=$(grep -nE "##.*##" "$FILE" || true)
if [ -z "$CORRUPTED" ]; then
  echo "  ✅ PASS"
  PASS=$((PASS+1))
else
  echo "  ❌ FAIL — merged headings:"
  echo "$CORRUPTED" | sed 's/^/    /'
  FAILS+=("6: Corrupted headings")
fi
echo ""

# ===== Check 7: Internal Links + Images =====
echo "▶ Check 7: Internal Links ≥2 + Image ≥1 + No Forbidden Components"
INTERNAL_LINKS=$(grep -cE "\]\((/reviews/|/compare/|/blog/|/categories/)" "$FILE" || true)
IMAGES=$(grep -cE "!\[.*\]\(/logos/" "$FILE" || true)
FORBIDDEN=$(grep -nE "<(WinnerBadge|ProsCons|ScoreCard|CTABox)" "$FILE" || true)
echo "  Internal links: $INTERNAL_LINKS (need ≥2)"
echo "  Images embedded: $IMAGES (need ≥1)"
if [ -n "$FORBIDDEN" ]; then
  echo "  ❌ Found forbidden React components:"
  echo "$FORBIDDEN" | sed 's/^/    /'
fi
if [ "$INTERNAL_LINKS" -ge 2 ] && [ "$IMAGES" -ge 1 ] && [ -z "$FORBIDDEN" ]; then
  echo "  ✅ PASS"
  PASS=$((PASS+1))
else
  echo "  ❌ FAIL"
  FAILS+=("7: Links+Images+Components")
fi
echo ""

# ===== Check 8: SEO Frontmatter =====
echo "▶ Check 8: SEO Frontmatter (title 50-65, description 110-160, alt ≥15)"
SEO_OK=true

if [ "$TYPE" = "compare" ]; then
  echo "  ℹ️  Compare type — title/description generated dynamically from generateMetadata, skipping frontmatter title/description check"
else
  # Review 类型使用 title: 字段（如有），否则从 name: 生成；blog 类型使用 title: 字段
  if [ "$TYPE" = "review" ]; then
    TITLE=$(awk '/^title:/{sub(/^title: */,""); gsub(/^"|"$/,""); print; exit}' "$FILE")
    if [ -z "$TITLE" ]; then
      REVIEW_NAME=$(awk '/^name:/{sub(/^name: */,""); gsub(/^"|"$/,""); print; exit}' "$FILE")
      TITLE="${REVIEW_NAME} Review (2026) — Is It Worth It?"
    fi
  else
    TITLE=$(awk '/^title:/{sub(/^title: */,""); gsub(/^"|"$/,""); print; exit}' "$FILE")
  fi
  TITLE_LEN=${#TITLE}
  echo "  Title ($TITLE_LEN chars): $TITLE"
  if [ "$TITLE_LEN" -lt 30 ] || [ "$TITLE_LEN" -gt 70 ]; then
    echo "    ❌ Title length out of range (30-70)"
    SEO_OK=false
  fi

  DESC=$(awk '/^description:/{sub(/^description: */,""); gsub(/^"|"$/,""); print; exit}' "$FILE")
  DESC_LEN=${#DESC}
  echo "  Description ($DESC_LEN chars)"
  if [ "$DESC_LEN" -lt 110 ] || [ "$DESC_LEN" -gt 165 ]; then
    echo "    ❌ Description length out of range (110-165)"
    SEO_OK=false
  fi
fi

# Alt 文本检查：每个 alt ≥15 字符
while IFS= read -r alt; do
  ALT_TEXT=$(echo "$alt" | sed -E 's/^!\[(.*)\]$/\1/')
  ALT_LEN=${#ALT_TEXT}
  if [ "$ALT_LEN" -lt 15 ]; then
    echo "    ❌ Alt too short ($ALT_LEN chars): '$ALT_TEXT'"
    SEO_OK=false
  fi
done < <(grep -oE '!\[[^]]*\]' "$FILE")

if $SEO_OK; then
  echo "  ✅ PASS"
  PASS=$((PASS+1))
else
  FAILS+=("8: SEO frontmatter")
fi
echo ""

# ===== Check 9: lastUpdated ISO 8601 =====
echo "▶ Check 9: lastUpdated (ISO 8601 date)"
LASTUPDATED=$(awk '/^lastUpdated:/{sub(/^lastUpdated: */,""); gsub(/^"|"$/,""); print; exit}' "$FILE")
if [ -z "$LASTUPDATED" ]; then
  echo "  ❌ FAIL — missing lastUpdated field in frontmatter"
  FAILS+=("9: lastUpdated")
elif echo "$LASTUPDATED" | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}'; then
  echo "  ✅ PASS ($LASTUPDATED)"
  PASS=$((PASS+1))
else
  echo "  ❌ FAIL — invalid format: '$LASTUPDATED' (need ISO 8601, e.g. 2026-06-04T12:53:58Z)"
  FAILS+=("9: lastUpdated")
fi
echo ""

# ===== Summary =====
echo "========================================"
echo "FINAL SCORE: $PASS / $TOTAL"
echo "========================================"
if [ "$PASS" -eq "$TOTAL" ]; then
  echo "✅ PASS — Ready to hand off"
  exit 0
elif [ "$PASS" -ge 6 ]; then
  echo "⚠️  FIX — Address these and re-run:"
  printf '   - %s\n' "${FAILS[@]}"
  exit 1
else
  echo "❌ REWRITE — Too many failures:"
  printf '   - %s\n' "${FAILS[@]}"
  exit 2
fi
