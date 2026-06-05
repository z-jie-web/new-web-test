#!/usr/bin/env bash
# category-stats.sh — 分类健康度仪表盘（动态派生）
# 从实际内容中提取所有分类，不硬编码
# Usage: bash scripts/category-stats.sh
# 退出码: 0=始终 (信息展示)

set -uo pipefail

CONTENT_ROOT="content"

# 从所有 review 和 blog 文件中收集唯一的 category slug
get_category_name() {
  local slug="$1"
  local f="$CONTENT_ROOT/categories/${slug}.mdx"
  if [ -f "$f" ]; then
    awk '/^name:/{sub(/^name: */,""); gsub(/^"|"$/,""); print; exit}' "$f"
  else
    # 没有 category MDX 就用 slug 生成名字
    echo "$slug" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1'
  fi
}

# 收集所有分类 slug
ALL_SLUGS=()

# 从 reviews 收集
for f in "$CONTENT_ROOT/reviews"/*.mdx; do
  [ ! -f "$f" ] && continue
  CAT=$(awk '/^category:/{sub(/^category: */,""); gsub(/^"|"$/,""); print; exit}' "$f")
  [ -n "$CAT" ] && ALL_SLUGS+=("$CAT")
done

# 从 blogs 收集
for f in "$CONTENT_ROOT/blog"/*.mdx; do
  [ ! -f "$f" ] && continue
  CAT=$(awk '/^category:/{sub(/^category: */,""); gsub(/^"|"$/,""); print; exit}' "$f")
  [ -n "$CAT" ] && ALL_SLUGS+=("$CAT")
done

# 去重
SLUGS=($(printf '%s\n' "${ALL_SLUGS[@]}" | sort -u))

echo "========================================"
echo "Category Health Dashboard"
echo "  (derived from content — ${#SLUGS[@]} categories)"
echo "========================================"
echo ""

printf "  %-18s  %7s  %5s  %7s  %8s\n" "CATEGORY" "REVIEWS" "BLOG" "COMPARE" "LAST UPD"
printf "  %-18s  %7s  %5s  %7s  %8s\n" "------------------" "-------" "-----" "-------" "--------"

for SLUG in "${SLUGS[@]}"; do
  NAME=$(get_category_name "$SLUG")

  # 统计评测
  REVIEWS=0
  LATEST_REVIEW=""
  for f in "$CONTENT_ROOT/reviews"/*.mdx; do
    [ ! -f "$f" ] && continue
    CAT=$(awk '/^category:/{sub(/^category: */,""); gsub(/^"|"$/,""); print; exit}' "$f")
    if [ "$CAT" = "$SLUG" ]; then
      REVIEWS=$((REVIEWS + 1))
      LU=$(awk '/^lastUpdated:/{sub(/^lastUpdated: */,""); gsub(/^"|"$/,""); print; exit}' "$f")
      if [ -n "$LU" ] && { [ -z "$LATEST_REVIEW" ] || [[ "$LU" > "$LATEST_REVIEW" ]]; }; then
        LATEST_REVIEW="$LU"
      fi
    fi
  done

  # 统计博客
  BLOGS=0
  LATEST_BLOG=""
  for f in "$CONTENT_ROOT/blog"/*.mdx; do
    [ ! -f "$f" ] && continue
    CAT=$(awk '/^category:/{sub(/^category: */,""); gsub(/^"|"$/,""); print; exit}' "$f")
    if [ "$CAT" = "$SLUG" ]; then
      BLOGS=$((BLOGS + 1))
      D=$(awk '/^date:/{sub(/^date: */,""); gsub(/^"|"$/,""); print; exit}' "$f")
      if [ -n "$D" ] && { [ -z "$LATEST_BLOG" ] || [[ "$D" > "$LATEST_BLOG" ]]; }; then
        LATEST_BLOG="$D"
      fi
    fi
  done

  # 统计对比
  COMPARES=0
  LATEST_COMPARE=""
  for f in "$CONTENT_ROOT/compare"/*.mdx; do
    [ ! -f "$f" ] && continue
    LU=$(awk '/^lastUpdated:/{sub(/^lastUpdated: */,""); gsub(/^"|"$/,""); print; exit}' "$f")
    [ -z "$LU" ] && continue
    FILENAME=$(basename "$f" .mdx)
    MATCH=0
    for rf in "$CONTENT_ROOT/reviews"/*.mdx; do
      [ ! -f "$rf" ] && continue
      RCAT=$(awk '/^category:/{sub(/^category: */,""); gsub(/^"|"$/,""); print; exit}' "$rf")
      if [ "$RCAT" = "$SLUG" ]; then
        RSLUG=$(basename "$rf" .mdx)
        if echo "$FILENAME" | grep -q "$RSLUG"; then
          MATCH=1
          break
        fi
      fi
    done
    if [ "$MATCH" = "1" ]; then
      COMPARES=$((COMPARES + 1))
      if [ -n "$LU" ] && { [ -z "$LATEST_COMPARE" ] || [[ "$LU" > "$LATEST_COMPARE" ]]; }; then
        LATEST_COMPARE="$LU"
      fi
    fi
  done

  # 选最新的日期
  LATEST=""
  for d in "$LATEST_REVIEW" "$LATEST_BLOG" "$LATEST_COMPARE"; do
    if [ -n "$d" ] && { [ -z "$LATEST" ] || [[ "$d" > "$LATEST" ]]; }; then
      LATEST="$d"
    fi
  done
  if [ -n "$LATEST" ]; then
    LATEST="${LATEST:0:10}"
  else
    LATEST="—"
  fi

  # 健康度
  TOTAL=$((REVIEWS + BLOGS))
  if [ "$TOTAL" -ge 8 ]; then
    HEALTH="🟢"
  elif [ "$TOTAL" -ge 4 ]; then
    HEALTH="🟡"
  else
    HEALTH="🔴"
  fi

  printf "  %s %-16s  %7d  %5d  %7d  %8s\n" "$HEALTH" "$NAME" "$REVIEWS" "$BLOGS" "$COMPARES" "$LATEST"
done

echo ""
echo "========================================"
echo "LEGEND"
echo "========================================"
echo "  🟢 ≥8 articles — healthy, maintain cadence"
echo "  🟡 4-7 articles — growing, 1-2 more needed"
echo "  🔴 <4 articles — thin, priority for new content"
echo ""
echo "📋 To add a new category:"
echo "   1. Write a review with: category: \"your-new-category\""
echo "   2. (Optional) Create content/categories/your-new-category.mdx"
echo "      with name and description in frontmatter"
