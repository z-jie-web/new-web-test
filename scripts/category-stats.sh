#!/usr/bin/env bash
# category-stats.sh — 分类健康度仪表盘
# 展示每个分类的评测数、博客数、对比数 + 最后更新时间
# Usage: bash scripts/category-stats.sh
# 退出码: 0=始终 (信息展示)

set -uo pipefail

CONTENT_ROOT="content"

echo "========================================"
echo "Category Health Dashboard"
echo "========================================"
echo ""

printf "  %-18s  %7s  %5s  %7s  %8s\n" "CATEGORY" "REVIEWS" "BLOG" "COMPARE" "LAST UPD"
printf "  %-18s  %7s  %5s  %7s  %8s\n" "------------------" "-------" "-----" "-------" "--------"

cats=(
  "video-generation|AI Video"
  "ai-avatars|AI Avatars"
  "ai-subtitles|AI Subtitles"
  "face-swap|AI Face Swap"
  "ai-image|AI Image"
  "ai-voice|AI Voice"
)

for entry in "${cats[@]}"; do
  SLUG="${entry%%|*}"
  NAME="${entry##*|}"

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
echo "💡 Run when planning content calendar."
echo "   Focus new articles on 🔴 categories first."
