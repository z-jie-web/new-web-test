#!/usr/bin/env bash
# check-duplicate.sh — 内容查重
# Usage: bash scripts/check-duplicate.sh "Midjourney"
# 支持 tool name / slug / blog title 输入
# 输出: 精确匹配 / 模糊匹配 / 无匹配
# 退出码: 0=无匹配, 1=找到相似, 2=精确匹配

set -uo pipefail

QUERY="${1:-}"
if [ -z "$QUERY" ]; then
  echo "Usage: $0 <tool-name-or-topic>"
  echo "Example: $0 Midjourney"
  exit 2
fi

CONTENT_ROOT="content"
EXACT_MATCHES=()
FUZZY_MATCHES=()

# 生成 slug 化的查询键 (Midjourney → midjourney, AI Image → ai-image)
slugify() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g'
}

QUERY_SLUG=$(slugify "$QUERY")
QUERY_LOWER=$(echo "$QUERY" | tr '[:upper:]' '[:lower:]')

echo "========================================"
echo "Content Duplicate Check"
echo "Query: \"$QUERY\" (slug: $QUERY_SLUG)"
echo "========================================"
echo ""

# ===== 1. Check reviews =====
echo "▶ Checking reviews..."
for f in "$CONTENT_ROOT/reviews"/*.mdx; do
  [ ! -f "$f" ] && continue
  FILENAME=$(basename "$f" .mdx)
  NAME=$(awk '/^name:/{sub(/^name: */,""); gsub(/^"|"$/,""); print; exit}' "$f")
  SLUG=$(awk '/^slug:/{sub(/^slug: */,""); gsub(/^"|"$/,""); print; exit}' "$f")
  NAME_LOWER=$(echo "$NAME" | tr '[:upper:]' '[:lower:]')

  # 精确 slug 匹配
  if [ "$FILENAME" = "$QUERY_SLUG" ] || [ "$SLUG" = "$QUERY_SLUG" ]; then
    EXACT_MATCHES+=("📄 Review: $f → $NAME")
    continue
  fi

  # 名称包含匹配
  if echo "$NAME_LOWER" | grep -qF "$QUERY_LOWER" 2>/dev/null; then
    FUZZY_MATCHES+=("🔍 Review (name match): $f → $NAME")
    continue
  fi
  if echo "$QUERY_LOWER" | grep -qF "$NAME_LOWER" 2>/dev/null; then
    FUZZY_MATCHES+=("🔍 Review (name match): $f → $NAME")
  fi
done

# ===== 2. Check blog posts =====
echo "▶ Checking blog posts..."
for f in "$CONTENT_ROOT/blog"/*.mdx; do
  [ ! -f "$f" ] && continue
  FILENAME=$(basename "$f" .mdx)
  TITLE=$(awk '/^title:/{sub(/^title: */,""); gsub(/^"|"$/,""); print; exit}' "$f")
  TITLE_LOWER=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]')

  # 精确 slug 匹配
  if [ "$FILENAME" = "$QUERY_SLUG" ]; then
    EXACT_MATCHES+=("📝 Blog: $f → $TITLE")
    continue
  fi

  # 标题包含匹配
  if echo "$TITLE_LOWER" | grep -qF "$QUERY_LOWER" 2>/dev/null; then
    FUZZY_MATCHES+=("🔍 Blog (title match): $f → $TITLE")
  fi
done

# ===== 3. Check compare pages =====
echo "▶ Checking compare pages..."
for f in "$CONTENT_ROOT/compare"/*.mdx; do
  [ ! -f "$f" ] && continue
  FILENAME=$(basename "$f" .mdx)

  # compare 文件名是 toolA-vs-toolB 格式
  if echo "$FILENAME" | grep -q "$QUERY_SLUG" 2>/dev/null; then
    FUZZY_MATCHES+=("🔍 Compare: $f (mentions '$QUERY_SLUG' in filename)")
  fi
done

echo ""

# ===== Output =====
if [ ${#EXACT_MATCHES[@]} -gt 0 ]; then
  echo "========================================"
  echo "⚠️  EXACT MATCH — already published:"
  echo "========================================"
  printf '  %s\n' "${EXACT_MATCHES[@]}"
  echo ""
fi

if [ ${#FUZZY_MATCHES[@]} -gt 0 ]; then
  echo "========================================"
  echo "🔍 SIMILAR — may overlap:"
  echo "========================================"
  printf '  %s\n' "${FUZZY_MATCHES[@]}"
  echo ""
fi

if [ ${#EXACT_MATCHES[@]} -eq 0 ] && [ ${#FUZZY_MATCHES[@]} -eq 0 ]; then
  echo "========================================"
  echo "✅ NO MATCHES — \"$QUERY\" is free to write."
  echo "========================================"
  exit 0
elif [ ${#EXACT_MATCHES[@]} -gt 0 ]; then
  echo "========================================"
  echo "⛔ DECISION REQUIRED:"
  echo "   This topic ALREADY EXISTS."
  echo "   Options:"
  echo "   A) Edit/update the existing article"
  echo "   B) Write a NEW article anyway (different angle)"
  echo "   C) Abandon"
  echo "========================================"
  exit 2
else
  echo "========================================"
  echo "⚠️  DECISION REQUIRED:"
  echo "   Similar content found — may overlap."
  echo "   Options:"
  echo "   A) Proceed with new article (different angle)"
  echo "   B) Edit/update existing similar article"
  echo "   C) Abandon"
  echo "========================================"
  exit 1
fi
