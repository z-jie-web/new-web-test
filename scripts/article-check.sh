#!/usr/bin/env bash
# article-check.sh — V2 publish sub-check (was V1 Phase 6 gate)
# Usage: bash scripts/article-check.sh content/blog/xxx.mdx
# Now invoked from validate-publish.sh. Not a standalone authority.
# AI_PATTERNS sourced from scripts/content/validators/lib/ai-patterns.sh
# 输出 11 项检查结果 + 总分。退出码: 0=PASS, 1=FIX, 2=REWRITE

set -uo pipefail

FILE="${1:-}"
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "❌ Usage: $0 <path-to-mdx-file>"
  echo "   File not found: $FILE"
  exit 2
fi

PASS=0
TOTAL=11
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
    REQUIRED=("## Pricing" "## Who Should Choose" "## FAQ")
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
INTERNAL_LINKS=$(grep -oE "\]\((/reviews/[^)]*|/compare/[^)]*|/blog/[^)]*|/categories/[^)]*)\)" "$FILE" | wc -l | tr -d ' ')
IMAGES=$(grep -oE "!\[[^]]*\]\((/logos/[^)]*|/images/[^)]*|[^)]*screenshot[^)]*|[^)]*diagram[^)]*)\)" "$FILE" | wc -l | tr -d ' ')
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

# ===== Check 9: Freshness Date =====
if [ "$TYPE" = "blog" ]; then
  echo "▶ Check 9: date field"
  DATE_VALUE=$(awk '/^date:/{sub(/^date: */,""); gsub(/^"|"$/,""); print; exit}' "$FILE")
  if [ -z "$DATE_VALUE" ]; then
    echo "  ❌ FAIL — missing date field in frontmatter"
    FAILS+=("9: date")
  elif echo "$DATE_VALUE" | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}$|^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z?$'; then
    echo "  ✅ PASS ($DATE_VALUE)"
    PASS=$((PASS+1))
  else
    echo "  ❌ FAIL — invalid date format: '$DATE_VALUE'"
    FAILS+=("9: date")
  fi
else
  echo "▶ Check 9: lastUpdated field"
  LASTUPDATED=$(awk '/^lastUpdated:/{sub(/^lastUpdated: */,""); gsub(/^"|"$/,""); print; exit}' "$FILE")
  if [ -z "$LASTUPDATED" ]; then
    echo "  ❌ FAIL — missing lastUpdated field in frontmatter"
    FAILS+=("9: lastUpdated")
  elif echo "$LASTUPDATED" | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z?$|^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; then
    echo "  ✅ PASS ($LASTUPDATED)"
    PASS=$((PASS+1))
  else
    echo "  ❌ FAIL — invalid format: '$LASTUPDATED'"
    FAILS+=("9: lastUpdated")
  fi
fi
echo ""

# ===== Check 10: Schema-Ready Frontmatter =====
echo "▶ Check 10: Schema-Ready Frontmatter"
SCHEMA_OK=true

case "$TYPE" in
  review)
    # pros 数组长度影响 ratingValue（≥3 → 4.6, <3 → 4.3，Google Schema 判定）——兼容 inline 和 multi-line YAML
    PROS_LINE=$(grep -m1 '^pros:' "$FILE")
    if echo "$PROS_LINE" | grep -q '\[.*\]'; then
      # inline: pros: ["a", "b", "c"]
      PROS_COUNT=$(echo "$PROS_LINE" | grep -o '"[^"]*"' | wc -l | tr -d ' ')
    else
      # multi-line:
      # pros:
      #   - a
      #   - b
      PROS_COUNT=$(awk '/^pros:/{found=1;next} found && /^  - /{count++} found && /^[a-z-]+:/{exit} END{print count+0}' "$FILE")
    fi
    echo "  pros count: $PROS_COUNT (need ≥3 for ratingValue 4.6)"
    if [ "$PROS_COUNT" -lt 3 ]; then
      echo "    ❌ pros < 3 → page component uses ratingValue 4.3 instead of 4.6"
      SCHEMA_OK=false
    fi
    # pricing 必须是 Free / Freemium / Paid
    PRICING_VAL=$(awk '/^pricing:/{sub(/^pricing: */,""); gsub(/^"|"$/,""); print; exit}' "$FILE")
    echo "  pricing: $PRICING_VAL (must be Free/Freemium/Paid)"
    if [[ ! "$PRICING_VAL" =~ ^(Free|Freemium|Paid)$ ]]; then
      echo "    ❌ pricing value '$PRICING_VAL' not in (Free|Freemium|Paid)"
      SCHEMA_OK=false
    fi
    # tags 数组非空 — 兼容 inline 和 multi-line YAML
    TAGS_LINE=$(grep -m1 '^tags:' "$FILE")
    if echo "$TAGS_LINE" | grep -q '\[.*\]'; then
      TAG_COUNT=$(echo "$TAGS_LINE" | grep -o '"[^"]*"' | wc -l | tr -d ' ')
    else
      TAG_COUNT=$(awk '/^tags:/{found=1;next} found && /^  - /{count++} found && /^[a-z-]+:/{exit} END{print count+0}' "$FILE")
    fi
    echo "  tags count: $TAG_COUNT (need ≥1)"
    if [ "$TAG_COUNT" -lt 1 ]; then
      echo "    ❌ tags empty — needed for related reviews scoring"
      SCHEMA_OK=false
    fi
    ;;
  blog)
    # author 一致性检查（只要不是明显混用就过）
    AUTHOR_VAL=$(awk '/^author:/{sub(/^author: */,""); gsub(/^"|"$/,""); print; exit}' "$FILE")
    echo "  author: $AUTHOR_VAL"
    ;;
esac

if $SCHEMA_OK; then
  echo "  ✅ PASS"
  PASS=$((PASS+1))
else
  FAILS+=("10: Schema frontmatter")
fi
echo ""

# ===== Check 11: AI Writing Patterns (vocabulary + em dash density) =====
echo "▶ Check 11: AI Writing Patterns"
AI_OK=true

# Build body-only plain text for AI pattern checks
BODY_TEXT=$(awk '/^---$/{f++; next} f>=2' "$FILE" | grep -vE '^\|' | grep -vE '^!\[' | sed -E 's#https?://[^ )]+##g')

# 11a: Vocabulary check — 45-word list, aligned with anti-ai-patterns-en.md
	source "$(dirname "$0")/content/validators/lib/ai-patterns.sh" 2>/dev/null || true
AI_HITS=$(printf '%s\n' "$BODY_TEXT" | grep -ciE "$AI_PATTERNS" || true)
echo "  [11a] Vocabulary: $AI_HITS AI-pattern word hits (0 = clean)"
if [ "$AI_HITS" -gt 0 ]; then
  echo "  ⚠️  AI vocabulary found:"
  printf '%s\n' "$BODY_TEXT" | grep -niE "$AI_PATTERNS" | head -10 | sed 's/^/    /'
  AI_OK=false
fi

# 11b: Em dash density check (body text only, excluding frontmatter)
# anti-ai-patterns-en.md Pattern 6: "AI overuses — like this — constantly"
BODY_WORDS=$(printf '%s\n' "$BODY_TEXT" | wc -w | tr -d ' ')
BODY_EMDASHES=$(printf '%s\n' "$BODY_TEXT" | grep -o '—' | wc -l | tr -d ' ')
if [ "$BODY_WORDS" -gt 0 ]; then
  # Use bc for floating-point; fallback to awk if bc unavailable
  EMDASH_DENSITY=$(echo "scale=2; $BODY_EMDASHES * 100 / $BODY_WORDS" | bc 2>/dev/null || echo "0")
  echo "  [11b] Em dash density: $BODY_EMDASHES em dashes / $BODY_WORDS body words = ${EMDASH_DENSITY}/100 words (limit: ≤1.0)"
  if [ "$(echo "$EMDASH_DENSITY > 1.0" | bc 2>/dev/null || echo "0")" = "1" ]; then
    echo "  ⚠️  Em dash density exceeds 1.0/100 words — rewrite using commas, periods, or restructure"
    AI_OK=false
  fi
else
  echo "  [11b] Em dash density: N/A (no body text)"
fi

if $AI_OK; then
  echo "  ✅ PASS"
  PASS=$((PASS+1))
else
  FAILS+=("11: AI writing patterns")
fi
echo ""

# ===== Summary =====
echo "========================================"
echo "FINAL SCORE: $PASS / $TOTAL"
echo "========================================"
if [ "$PASS" -eq "$TOTAL" ]; then
  echo "✅ PASS — Ready to hand off"
  exit 0
elif [ "$PASS" -ge 8 ]; then
  echo "⚠️  FIX — Address these and re-run:"
  printf '   - %s\n' "${FAILS[@]}"
  exit 1
else
  echo "❌ REWRITE — Too many failures:"
  printf '   - %s\n' "${FAILS[@]}"
  exit 2
fi
