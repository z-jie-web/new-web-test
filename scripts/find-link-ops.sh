#!/usr/bin/env bash
# find-link-ops.sh — 反向链接机会检测
# 新文章写完/要写之前，找出同分类下哪些老文章还没链回来
# Usage: bash scripts/find-link-ops.sh content/reviews/speechify.mdx
#        或 bash scripts/find-link-ops.sh speechify
# 退出码: 0=始终 (信息展示)

set -uo pipefail

INPUT="${1:-}"
if [ -z "$INPUT" ]; then
  echo "Usage: $0 <new-article-path-or-slug>"
  echo "Example: $0 content/reviews/speechify.mdx"
  echo "Example: $0 speechify"
  exit 2
fi

CONTENT_ROOT="content"

# 查找文章文件
FILE=""
if [ -f "$INPUT" ]; then
  FILE="$INPUT"
else
  # 尝试按 slug 找
  for dir in reviews blog compare; do
    if [ -f "$CONTENT_ROOT/$dir/$INPUT.mdx" ]; then
      FILE="$CONTENT_ROOT/$dir/$INPUT.mdx"
      break
    fi
  done
fi

if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "❌ Article not found: $INPUT"
  echo "   Searched: content/reviews/ content/blog/"
  exit 2
fi

# 提取新文章的信息
NEW_NAME=$(awk '/^name:/{sub(/^name: */,""); gsub(/^"|"$/,""); print; exit}' "$FILE")
NEW_SLUG=$(awk '/^slug:/{sub(/^slug: */,""); gsub(/^"|"$/,""); print; exit}' "$FILE")
NEW_CATEGORY=$(awk '/^category:/{sub(/^category: */,""); gsub(/^"|"$/,""); print; exit}' "$FILE")
NEW_TYPE="review"
if [[ "$FILE" == *"/blog/"* ]]; then NEW_TYPE="blog"; fi
if [[ "$FILE" == *"/compare/"* ]]; then NEW_TYPE="compare"; fi

# Compare 文件没有 category 字段，从 toolA 的 review 推导
TOOL_A=""
TOOL_B=""
if [ "$NEW_TYPE" = "compare" ]; then
  TOOL_A=$(awk '/^toolA:/{sub(/^toolA: */,""); gsub(/^"|"$/,""); print; exit}' "$FILE")
  TOOL_B=$(awk '/^toolB:/{sub(/^toolB: */,""); gsub(/^"|"$/,""); print; exit}' "$FILE")
  if [ -n "$TOOL_A" ] && [ -f "$CONTENT_ROOT/reviews/$TOOL_A.mdx" ]; then
    NEW_CATEGORY=$(awk '/^category:/{sub(/^category: */,""); gsub(/^"|"$/,""); print; exit}' "$CONTENT_ROOT/reviews/$TOOL_A.mdx")
  fi
  if [ -z "$NEW_SLUG" ]; then
    NEW_SLUG=$(basename "$FILE" .mdx)
  fi
  if [ -z "$NEW_NAME" ] && [ -n "$TOOL_A" ] && [ -n "$TOOL_B" ]; then
    # 从 toolA/toolB 的 review 获取名字
    NAME_A=$(awk '/^name:/{sub(/^name: */,""); gsub(/^"|"$/,""); print; exit}' "$CONTENT_ROOT/reviews/$TOOL_A.mdx" 2>/dev/null || echo "$TOOL_A")
    NAME_B=$(awk '/^name:/{sub(/^name: */,""); gsub(/^"|"$/,""); print; exit}' "$CONTENT_ROOT/reviews/$TOOL_B.mdx" 2>/dev/null || echo "$TOOL_B")
    NEW_NAME="$NAME_A vs $NAME_B"
  fi
fi

if [ -z "$NEW_SLUG" ]; then
  NEW_SLUG=$(basename "$FILE" .mdx)
fi
if [ -z "$NEW_NAME" ]; then
  NEW_NAME=$(awk '/^title:/{sub(/^title: */,""); gsub(/^"|"$/,""); print; exit}' "$FILE")
fi

echo "========================================"
echo "Backlink Opportunity Finder"
echo "========================================"
echo ""
echo "New article:  $NEW_NAME ($NEW_SLUG)"
echo "Category:     ${NEW_CATEGORY:-N/A}"
echo "Type:         $NEW_TYPE"
echo ""

# 找同分类/同类型的其他文章
POTENTIAL_TARGETS=()

if [ -n "$NEW_CATEGORY" ]; then
  # 同分类的 review 文章
  for f in "$CONTENT_ROOT/reviews"/*.mdx; do
    [ ! -f "$f" ] && continue
    [ "$f" = "$FILE" ] && continue  # 跳过自己
    CAT=$(awk '/^category:/{sub(/^category: */,""); gsub(/^"|"$/,""); print; exit}' "$f")
    if [ "$CAT" = "$NEW_CATEGORY" ]; then
      POTENTIAL_TARGETS+=("$f")
    fi
  done

  # 同分类的 blog 文章
  for f in "$CONTENT_ROOT/blog"/*.mdx; do
    [ ! -f "$f" ] && continue
    [ "$f" = "$FILE" ] && continue  # 跳过自己
    CAT=$(awk '/^category:/{sub(/^category: */,""); gsub(/^"|"$/,""); print; exit}' "$f")
    if [ "$CAT" = "$NEW_CATEGORY" ]; then
      POTENTIAL_TARGETS+=("$f")
    fi
  done

  # 同分类的 compare 文章（从 toolA review 推导 category）
  for f in "$CONTENT_ROOT/compare"/*.mdx; do
    [ ! -f "$f" ] && continue
    [ "$f" = "$FILE" ] && continue  # 跳过自己
    TA=$(awk '/^toolA:/{sub(/^toolA: */,""); gsub(/^"|"$/,""); print; exit}' "$f")
    if [ -n "$TA" ] && [ -f "$CONTENT_ROOT/reviews/$TA.mdx" ]; then
      CAT=$(awk '/^category:/{sub(/^category: */,""); gsub(/^"|"$/,""); print; exit}' "$CONTENT_ROOT/reviews/$TA.mdx")
      if [ "$CAT" = "$NEW_CATEGORY" ]; then
        POTENTIAL_TARGETS+=("$f")
      fi
    fi
  done
fi

if [ ${#POTENTIAL_TARGETS[@]} -eq 0 ]; then
  echo "ℹ️  No other articles in the same category to check."
  exit 0
fi

echo "▶ Checking ${#POTENTIAL_TARGETS[@]} articles in '$NEW_CATEGORY'..."
echo ""

NEEDS_LINK=()
ALREADY_LINKED=()

for target in "${POTENTIAL_TARGETS[@]}"; do
  TGT_SLUG=$(awk '/^slug:/{sub(/^slug: */,""); gsub(/^"|"$/,""); print; exit}' "$target")
  TGT_NAME=$(awk '/^name:/{sub(/^name: */,""); gsub(/^"|"$/,""); print; exit}' "$target")
  if [ -z "$TGT_NAME" ]; then
    TGT_NAME=$(awk '/^title:/{sub(/^title: */,""); gsub(/^"|"$/,""); print; exit}' "$target")
  fi
  if [ -z "$TGT_SLUG" ]; then
    TGT_SLUG=$(basename "$target" .mdx)
  fi

  RELPATH=$(echo "$target" | sed 's/^content\///')

  # 检查 target 文件是否引用了 new article 的链接
  # 检查 /reviews/new-slug 或 /blog/new-slug 或 /compare/...-vs-new-slug
  LINKED=false
  if grep -qE "/reviews/$NEW_SLUG|/blog/$NEW_SLUG|/compare/$NEW_SLUG|$NEW_SLUG-vs-|vs-$NEW_SLUG" "$target" 2>/dev/null; then
    LINKED=true
  fi

  if $LINKED; then
    ALREADY_LINKED+=("  ✅ $RELPATH ($TGT_NAME)")
  else
    NEEDS_LINK+=("  📄 $RELPATH ($TGT_NAME)")
  fi
done

echo "========================================"
echo "MISSING BACKLINKS (${#NEEDS_LINK[@]})"
echo "========================================"
if [ ${#NEEDS_LINK[@]} -eq 0 ]; then
  echo "  🎉 All linked! No opportunities found."
else
  printf '%s\n' "${NEEDS_LINK[@]}"
  echo ""
  echo "💡 Suggested locations to add links:"
  echo "   In reviews:  \"## vs [Competitor]\" section"
  echo "   In blogs:    Related mentions or summary sections"
  echo ""
  LINK_PREFIX="/reviews"
  if [ "$NEW_TYPE" = "compare" ]; then LINK_PREFIX="/compare"; fi
  if [ "$NEW_TYPE" = "blog" ]; then LINK_PREFIX="/blog"; fi
  echo "   Run:  code [file] and add:"
  echo "   [Link to $NEW_NAME]($LINK_PREFIX/$NEW_SLUG)"
fi

echo ""
echo "========================================"
echo "ALREADY LINKED (${#ALREADY_LINKED[@]})"
echo "========================================"
if [ ${#ALREADY_LINKED[@]} -gt 0 ]; then
  printf '%s\n' "${ALREADY_LINKED[@]}"
else
  echo "  (none)"
fi
