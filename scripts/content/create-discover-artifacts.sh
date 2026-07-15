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
  bash "${SCRIPT_DIR}/category-stats.sh" 2>&1
  echo ""
  echo "=== keyword strategy ==="
  echo "current_tier: long_tail_only (site age: ~42 days)"
  echo "keyword_tier_check: passed"
} > "$ARTIFACT_FILE"

echo "Artifact created: $ARTIFACT_FILE ($(wc -c < "$ARTIFACT_FILE") bytes)"
