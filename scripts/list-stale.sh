#!/usr/bin/env bash
# list-stale.sh — 内容保鲜检测
# 列出所有文章按 lastUpdated 排序，标记超过 180 天未更新的
# Usage: bash scripts/list-stale.sh [--days=180]
# 退出码: 总是 0（信息展示）

set -uo pipefail

STALE_DAYS="${STALE_DAYS:-180}"
CONTENT_ROOT="content"
NOW=$(date +%s)

# 解析 lastUpdated 或 date 字段，返回 Unix 时间戳
parse_date() {
  local file="$1"
  local date=""
  # 先查 lastUpdated (reviews/compare), 再查 date (blogs)
  date=$(awk '/^lastUpdated:/{sub(/^lastUpdated: */,""); gsub(/^"|"$/,""); print; exit}' "$file")
  if [ -z "$date" ]; then
    date=$(awk '/^date:/{sub(/^date: */,""); gsub(/^"|"$/,""); print; exit}' "$file")
  fi
  if [ -z "$date" ]; then
    echo "0"
    return
  fi
  # 支持 ISO 8601 和纯日期
  if [[ "$OSTYPE" == "darwin"* ]]; then
    date -jf "%Y-%m-%dT%H:%M:%SZ" "$date" +%s 2>/dev/null || date -jf "%Y-%m-%d" "$date" +%s 2>/dev/null || echo "0"
  else
    date -d "$date" +%s 2>/dev/null || echo "0"
  fi
}

days_ago() {
  local ts="$1"
  if [ "$ts" = "0" ]; then echo "N/A"; return; fi
  echo $(( (NOW - ts) / 86400 ))
}

get_name() {
  local file="$1"
  awk '/^name:/{sub(/^name: */,""); gsub(/^"|"$/,""); print; exit}' "$file"
  awk '/^title:/{sub(/^title: */,""); gsub(/^"|"$/,""); print; exit}' "$file"
  # 如果都没有就返回文件名
  basename "$file" .mdx
}

get_name() {
  local file="$1"
  local n
  n=$(awk '/^name:/{sub(/^name: */,""); gsub(/^"|"$/,""); print; exit}' "$file")
  if [ -n "$n" ]; then echo "$n"; return; fi
  n=$(awk '/^title:/{sub(/^title: */,""); gsub(/^"|"$/,""); print; exit}' "$file")
  if [ -n "$n" ]; then echo "$n"; return; fi
  basename "$file" .mdx
}

echo "========================================"
echo "Content Freshness Report"
echo "Stale threshold: $STALE_DAYS days"
echo "========================================"
echo ""

ALL_ENTRIES=()

for type in reviews blog; do
  for f in "$CONTENT_ROOT/$type"/*.mdx; do
    [ ! -f "$f" ] && continue
    TS=$(parse_date "$f")
    DAYS=$(days_ago "$TS")
    NAME=$(get_name "$f")
    RELPATH=$(echo "$f" | sed 's/^content\///')
    ALL_ENTRIES+=("$TS|$NAME|$RELPATH|$type|$DAYS")
  done
done

# 按时间戳从旧到新排列（最旧的排最前）
IFS=$'\n' SORTED=($(sort -t'|' -k1 -n <<<"${ALL_ENTRIES[*]}"))
unset IFS

# 统计
STALE_COUNT=0
FRESH_COUNT=0
MISSING_COUNT=0

echo "  STATUS  DAYS    FILE"
echo "  ------  ------  ----"

for entry in "${SORTED[@]}"; do
  IFS='|' read -r TS NAME RELPATH TYPE DAYS <<<"$entry"

  if [ "$TS" = "0" ]; then
    STATUS="⚠️  NODATE"
    MISSING_COUNT=$((MISSING_COUNT + 1))
  elif [ "$DAYS" -gt "$STALE_DAYS" ]; then
    STATUS="🔴 STALE"
    STALE_COUNT=$((STALE_COUNT + 1))
  elif [ "$DAYS" -gt 90 ]; then
    STATUS="🟡 AGING"
    FRESH_COUNT=$((FRESH_COUNT + 1))
  else
    STATUS="🟢 FRESH"
    FRESH_COUNT=$((FRESH_COUNT + 1))
  fi

  printf "  %-8s %-7s %s\n" "$STATUS" "${DAYS}d" "$RELPATH ($NAME)"
done

echo ""
echo "========================================"
echo "SUMMARY"
echo "========================================"
echo "  🟢 Fresh  (<90d)   : $FRESH_COUNT"
echo "  🟡 Aging  (90-${STALE_DAYS}d) : $(( $(echo "${SORTED[@]}" | grep -c "AGING") ))"
echo "  🔴 Stale  (>${STALE_DAYS}d)  : $STALE_COUNT"
echo "  ⚠️  NoDate            : $MISSING_COUNT"
echo "  Total                 : ${#SORTED[@]}"
echo ""
echo "💡 Run monthly. Stale articles lose Google ranking."
echo "   Focus updates on 🔴 and 🟡 items first."
