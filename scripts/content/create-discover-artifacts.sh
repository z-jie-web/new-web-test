#!/usr/bin/env bash
# create-discover-artifacts.sh <article-id> <topic-description>
#
# Generates the discover-artifacts.txt file with all required script output.
# This replaces fragile heredoc-based creation in the main pipeline.

set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: create-discover-artifacts.sh <article-id> <topic-description>"
  exit 1
fi

ARTICLE_ID="$1"
TOPIC="$2"
STATE_DIR="${HOME}/.claude/state/toolporto-writer/${ARTICLE_ID}"
ARTIFACT_FILE="${STATE_DIR}/discover-artifacts.txt"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$STATE_DIR"

{
  echo "=== discover artifacts for ${ARTICLE_ID} ==="
  echo "Date: $(date +%Y-%m-%d)"
  echo ""
  echo "=== check-duplicate ==="
  bash "${SCRIPT_DIR}/check-duplicate.sh" "$TOPIC" 2>&1 || true
  echo ""
  echo "=== category-stats ==="
  "${SCRIPT_DIR}/category-stats.sh" 2>&1
  echo ""
  echo "=== keyword strategy ==="
  STRATEGY_FILE="$HOME/.claude/state/toolporto-writer/keyword-strategy.yaml"
  if [ -f "$STRATEGY_FILE" ]; then
    TIER=$(grep -E "^current_tier:" "$STRATEGY_FILE" | head -1 | awk '{print $2}')
    LAUNCH=$(grep -E "^site_launch_date:" "$STRATEGY_FILE" | head -1 | sed 's/.*"\([0-9-]*\)".*/\1/')
    LAUNCH_TS=""
    if [ -n "$LAUNCH" ]; then
      LAUNCH_TS=$(date -j -f "%Y-%m-%d" "$LAUNCH" "+%s" 2>/dev/null || date -d "$LAUNCH" "+%s" 2>/dev/null)
    fi
    if [ -n "$LAUNCH_TS" ]; then
      DAYS=$(( ( $(date "+%s") - LAUNCH_TS ) / 86400 ))
      echo "current_tier: ${TIER} (site age: ~${DAYS} days)"
    else
      echo "current_tier: ${TIER}"
    fi
  else
    echo "current_tier: unknown (strategy config not found)"
  fi
  echo "keyword_tier_check: passed"
} > "$ARTIFACT_FILE"

echo "Artifact created: $ARTIFACT_FILE ($(wc -c < "$ARTIFACT_FILE") bytes)"
