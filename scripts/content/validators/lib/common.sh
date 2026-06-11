#!/usr/bin/env bash
# lib/common.sh — V2 content validator shared helpers
#
# Source this file from validator scripts:
#   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
#   source "${SCRIPT_DIR}/lib/common.sh"
#
# Do not execute directly.

# ── Constants ───────────────────────────────────────────────────

STATE_ROOT_DEFAULT="${HOME}/.claude/state/toolporto-writer"

# ── Array tracking ──────────────────────────────────────────────

fail_fixable() { FIXABLE_ITEMS+=("$1"); }
fail_prereq()  { PREREQ_ITEMS+=("$1"); }
fail_rewrite() { REWRITE_ITEMS+=("$1"); }
pass_item()    { PASS_ITEMS+=("$1"); }

# ── Safe array count (set -u tolerant) ──────────────────────────

safe_array_count() {
  local name="$1"
  local count
  set +u
  eval "count=\${#${name}[@]}"
  set -u
  echo "$count"
}

# ── Formatted output ────────────────────────────────────────────

print_list() {
  local label="$1"
  shift
  local items=("$@")
  if [ ${#items[@]} -eq 0 ]; then
    return
  fi
  echo "${label}:"
  for item in "${items[@]}"; do
    echo "- ${item}"
  done
  echo
}

# ── Pattern matching ────────────────────────────────────────────

has_line() {
  local pattern="$1"
  local file="$2"
  grep -Eq "$pattern" "$file" 2>/dev/null
}

# ── MDX frontmatter extraction ──────────────────────────────────

# awk-based: expects "key: value" on its own line (YAML frontmatter)
frontmatter_value() {
  local key="$1"
  local file="$2"
  awk -F': ' -v k="$key" '$1 == k {sub(/^"/,"",$2); sub(/"$/,"",$2); print $2; exit}' "$file"
}

# ── YAML scalar extraction (grep-based, for brief.yaml) ─────────

# Usage: extract_yaml_scalar "pattern_with_capture" "file"
# Pattern must have exactly one capture group: \1
extract_yaml_scalar() {
  local pattern="$1"
  local file="$2"
  grep -E "${pattern}" "$file" 2>/dev/null | head -n 1 | sed -E "s/${pattern}/\1/"
}

# ── Article type detection ──────────────────────────────────────

detect_article_type() {
  local target_file="$1"
  if [[ "$target_file" == *"content/reviews/"* ]]; then echo "review"
  elif [[ "$target_file" == *"content/compare/"* ]]; then echo "compare"
  else echo "blog"
  fi
}

# ── URL helpers ─────────────────────────────────────────────────

host_from_url() {
  echo "$1" | sed -E 's#^https?://##; s#/.*$##; s/^www\.//'
}

# ── Date validation ─────────────────────────────────────────────

is_valid_date() {
  local value="$1"
  echo "$value" | grep -Eq '^[0-9]{4}-[0-9]{2}-[0-9]{2}$|^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z?$'
}

# ── Body text extraction (for AI pattern scanning) ──────────────

# Strips frontmatter, tables, images, and URLs; outputs plain text
extract_body_text() {
  local file="$1"
  awk '/^---$/{f++; next} f>=2' "$file" \
    | grep -vE '^\|' \
    | grep -vE '^!\[' \
    | sed -E 's#https?://[^ )]+##g'
}

# ── Count YAML list items (inline [...] or multi-line - list) ───

count_yaml_list() {
  local key="$1"
  local file="$2"
  local first_line
  first_line="$(grep -m1 "^${key}:" "$file" 2>/dev/null || true)"
  if echo "$first_line" | grep -q '\[.*\]'; then
    # inline: key: ["a", "b", "c"]
    echo "$first_line" | grep -o '"[^"]*"' | wc -l | tr -d ' '
  else
    # multi-line:
    # key:
    #   - a
    #   - b
    awk -v k="$key" "
      \$0 ~ \"^\" k \":\" {found=1; next}
      found && /^  - / {count++}
      found && /^[a-zA-Z-]+:/ {exit}
      END {print count+0}
    " "$file"
  fi
}

# ── Extract list items from brief candidate YAML -----------------

# Usage: extract_brief_list <section> <field> <file>
# Example:
#   extract_brief_list refresh stale_claims_removed brief.candidate.yaml
extract_brief_list() {
  local section="$1"
  local field="$2"
  local file="$3"
  awk -v sec="$section" -v fld="$field" '
    BEGIN { in_section = 0; in_field = 0 }
    $0 == "  " sec ":" { in_section = 1; next }
    in_section && /^  [a-zA-Z_][a-zA-Z0-9_]*:/ && $0 != "  " sec ":" { in_section = 0 }
    in_section && $0 == "    " fld ":" { in_field = 1; next }
    in_field && /^      - / {
      sub(/^[[:space:]]{6}-[[:space:]]*/, "")
      gsub(/^"|"$/, "")
      print
      next
    }
    in_field && /^[[:space:]]{4}[a-zA-Z_][a-zA-Z0-9_]*:/ { exit }
  ' "$file"
}

# ── Header printer ──────────────────────────────────────────────

print_header() {
  local name="${1:-}"
  local mode="${2:-}"
  echo "========================================"
  echo "Validator: ${name}"
  echo "Mode: ${mode}"
  echo "========================================"
}

# ── Validator initialisation ────────────────────────────────────

# Sets: SCRIPT_NAME, TARGET_FILE, ARTICLE_ID, STATE_DIR, CANDIDATE_BRIEF, TYPE
# Usage: init_validator <script-name> <mode> [need-target]
#   need-target: "1" (default, modes with a target file) or "0" (discover)
# Usage: init_validator <script-name> <mode>
# Before calling, the script must set TARGET_FILE and/or ARTICLE_ID from its
# own $1 / env.  This function validates, resolves STATE_DIR, and prints the
# banner.  It sets: SCRIPT_NAME, ARTICLE_ID, STATE_DIR, CANDIDATE_BRIEF, TYPE.
init_validator() {
  SCRIPT_NAME="$1"
  local mode="$2"

  # Ensure TARGET_FILE / ARTICLE_ID at least one is set (set -u safe)
  local _tf="${TARGET_FILE:-}"
  local _aid="${ARTICLE_ID:-}"

  if [ -z "$_tf" ] && [ -z "$_aid" ]; then
    echo "========================================"
    echo "Validator: ${SCRIPT_NAME}"
    echo "Mode: ${mode}"
    echo "========================================"
    echo "FAIL:"
    echo "- missing target file or article id"
    echo
    echo "RECOMMENDED ACTION:"
    echo "- pass <target-file> or <article-id> as the first argument,"
    echo "  or set TARGET_FILE / ARTICLE_ID"
    echo
    echo "EXIT CODE: 2"
    exit 2
  fi

  local _sd="${STATE_DIR:-}"

  # Resolve state directory
  if [ -z "$_sd" ]; then
    if [ -n "$_aid" ] && [ -d "$_aid" ]; then
      STATE_DIR="$_aid"
      ARTICLE_ID="$(basename "$STATE_DIR")"
    elif [ -n "$_aid" ]; then
      STATE_DIR="${STATE_ROOT_DEFAULT}/${_aid}"
      ARTICLE_ID="$_aid"
    elif [ -n "$_tf" ]; then
      ARTICLE_ID="$(basename "$_tf" .mdx)"
      STATE_DIR="${STATE_ROOT_DEFAULT}/${ARTICLE_ID}"
    fi
  else
    STATE_DIR="$_sd"
    if [ -z "$_aid" ] && [ -n "$_tf" ]; then
      ARTICLE_ID="$(basename "$_tf" .mdx)"
    fi
  fi

  CANDIDATE_BRIEF="${STATE_DIR}/brief.candidate.yaml"

  # Detect article type from target file
  _tf="${TARGET_FILE:-}"
  if [ -n "$_tf" ]; then
    TYPE="$(detect_article_type "$_tf")"
  else
    TYPE=""
  fi

  echo "========================================"
  echo "Validator: ${SCRIPT_NAME}"
  echo "Mode: ${mode}"
  echo "========================================"
  if [ -n "$_tf" ]; then
    echo "Target file: ${_tf}"
  fi
  echo "Article ID: ${ARTICLE_ID}"
  echo "State dir: ${STATE_DIR}"
  echo "Candidate brief: ${CANDIDATE_BRIEF}"
  echo
}

# ── Common prerequisite checks ──────────────────────────────────

check_common_prereqs() {
  local need_target="${1:-1}"
  if [ ! -d "$STATE_DIR" ]; then
    fail_prereq "state directory is missing"
  fi
  if [ ! -f "$CANDIDATE_BRIEF" ]; then
    fail_prereq "brief.candidate.yaml is missing"
  fi
  if [ "$need_target" = "1" ] && [ ! -f "$TARGET_FILE" ]; then
    fail_prereq "target file does not exist"
  fi
}

# ── Git diff helpers ────────────────────────────────────────────

resolve_repo_root() {
  local start_dir="${1:-$(pwd)}"
  git -C "$start_dir" rev-parse --show-toplevel 2>/dev/null
}

file_has_git_diff() {
  local repo_root="$1"
  local relpath="$2"
  local unstaged staged
  unstaged="$(git -C "$repo_root" diff --stat -- "$relpath" 2>/dev/null || true)"
  staged="$(git -C "$repo_root" diff --cached --stat -- "$relpath" 2>/dev/null || true)"
  if [ -n "$unstaged" ] || [ -n "$staged" ]; then
    return 0
  fi
  return 1
}

# ── Exit code router ────────────────────────────────────────────

# Prints PASS/FAIL/BLOCKED/REWRITE lists, then routes to exit code.
# Usage: route_exit <rewrite-action> <prereq-action> <fixable-action> <pass-action>
route_exit() {
  local rewrite_action="$1"
  local prereq_action="$2"
  local fixable_action="$3"
  local pass_action="$4"

  local rewrite_count prereq_count fixable_count pass_count
  rewrite_count="$(safe_array_count REWRITE_ITEMS)"
  prereq_count="$(safe_array_count PREREQ_ITEMS)"
  fixable_count="$(safe_array_count FIXABLE_ITEMS)"
  pass_count="$(safe_array_count PASS_ITEMS)"

  if [ "$pass_count" -gt 0 ]; then
    print_list "PASS" "${PASS_ITEMS[@]}"
  fi
  if [ "$fixable_count" -gt 0 ]; then
    print_list "FAIL" "${FIXABLE_ITEMS[@]}"
  fi
  if [ "$prereq_count" -gt 0 ]; then
    print_list "BLOCKED" "${PREREQ_ITEMS[@]}"
  fi
  if [ "$rewrite_count" -gt 0 ]; then
    print_list "REWRITE" "${REWRITE_ITEMS[@]}"
  fi

  if [ "$rewrite_count" -gt 0 ]; then
    echo "RECOMMENDED ACTION:"
    echo "- ${rewrite_action}"
    echo
    echo "EXIT CODE: 3"
    exit 3
  fi

  if [ "$prereq_count" -gt 0 ]; then
    echo "RECOMMENDED ACTION:"
    echo "- ${prereq_action}"
    echo
    echo "EXIT CODE: 2"
    exit 2
  fi

  if [ "$fixable_count" -gt 0 ]; then
    echo "RECOMMENDED ACTION:"
    echo "- ${fixable_action}"
    echo
    echo "EXIT CODE: 1"
    exit 1
  fi

  echo "RECOMMENDED ACTION:"
  echo "- ${pass_action}"
  echo
  echo "EXIT CODE: 0"
  exit 0
}
