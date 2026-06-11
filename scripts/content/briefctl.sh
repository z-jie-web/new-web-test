#!/usr/bin/env bash
# briefctl.sh — V2 working brief lifecycle helper
#
# Usage:
#   briefctl init    <article-id> <type>     Create new brief.candidate.yaml
#   briefctl mode    <article-id> <mode>      Switch current_mode
#   briefctl set     <article-id> <key> <val> Set a mode_outputs scalar
#   briefctl list    <article-id> <key> <val> Append to a mode_outputs list
#   briefctl commit  <article-id>             Move candidate → canonical
#   briefctl show    <article-id>             Print brief to stdout
#
# State root: ~/.claude/state/toolporto-writer/<article-id>/

set -uo pipefail

STATE_ROOT="${HOME}/.claude/state/toolporto-writer"
COMMAND="${1:-}"
ARTICLE_ID="${2:-}"

die() { echo "ERROR: $*" >&2; exit 1; }

resolve_state() {
  local id="${1:-}"
  [ -z "$id" ] && die "missing article-id"
  local dir="${STATE_ROOT}/${id}"
  echo "$dir"
}

ensure_dir() { mkdir -p "$1"; }

# ── init ────────────────────────────────────────────────────────
cmd_init() {
  local id="$1"; local type="$2"
  [ -z "$type" ] && die "usage: briefctl init <article-id> <review|compare|blog>"
  case "$type" in review|compare|blog) ;; *) die "type must be review, compare, or blog" ;; esac

  local dir; dir="$(resolve_state "$id")"
  ensure_dir "$dir"
  local brief="${dir}/brief.candidate.yaml"
  local run_id="${id}-$(date +%Y-%m-%d)"
  local now; now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  cat > "$brief" <<YAML
brief_version: 2
run_id: ${run_id}
article_id: ${id}
parent_brief_id: null
current_mode: discover
status: in_progress

intent:
  article_type: ${type}
  category: ""
  primary_keyword: ""
  search_intent: commercial investigation
  audience: ""

artifacts:
  target_files: []

decisions:
  angle: ""
  render_contract:
    auto_rendered: []
    mdx_must_not_duplicate: []

mode_outputs:
  discover: {}
  draft: {}
  enhance: {}
  publish: {}
  refresh: {}

validation:
  discover: { attempts: 0, last_exit_code: null }
  draft: { attempts: 0, last_exit_code: null }
  enhance: { attempts: 0, last_exit_code: null }
  publish: { attempts: 0, last_exit_code: null }
  refresh: { attempts: 0, last_exit_code: null }

history: []
YAML
  echo "✅ Created ${brief}"
}

# ── mode ────────────────────────────────────────────────────────
cmd_mode() {
  local id="$1"; local mode="$2"
  case "$mode" in discover|draft|enhance|publish|refresh) ;; *) die "invalid mode: $mode" ;; esac

  local dir; dir="$(resolve_state "$id")"
  local brief="${dir}/brief.candidate.yaml"
  [ -f "$brief" ] || die "brief not found: $brief — run 'briefctl init' first"

  sed -i '' "s/^current_mode: .*/current_mode: ${mode}/" "$brief"
  # Update status
  sed -i '' "s/^status: .*/status: in_progress/" "$brief"
  # If mode is refresh, set parent_brief_id if missing
  if [ "$mode" = "refresh" ]; then
    if grep -q '^parent_brief_id: null$' "$brief"; then
      sed -i '' "s/^parent_brief_id: null$/parent_brief_id: ${id}/" "$brief"
    fi
  fi
  echo "✅ ${id}: current_mode → ${mode}"
}

# ── set ─────────────────────────────────────────────────────────
cmd_set() {
  local id="$1"; local key="$2"; local value="$3"
  [ -z "$key" ] && die "usage: briefctl set <article-id> <key.path> <value>"

  local dir; dir="$(resolve_state "$id")"
  local brief="${dir}/brief.candidate.yaml"
  [ -f "$brief" ] || die "brief not found: $brief"

  # Map key paths to YAML locations (mode_outputs.<mode>.<field>)
  # e.g. "discover.category" → intent.category
  # e.g. "discover.duplicate_check_status" → mode_outputs.discover.duplicate_check_status
  local section="${key%%.*}"
  local field="${key#*.}"

  case "$section" in
    discover|draft|enhance|publish|refresh)
      # Mode output field: add/replace under mode_outputs.<section>
      # If section is still empty object, expand it first
      if grep -q "^  ${section}: {}" "$brief"; then
        awk -v sec="${section}" '
          $0 == "  " sec ": {}" { print "  " sec ":"; next }
          { print }
        ' "${brief}" > "${brief}.tmp" && mv "${brief}.tmp" "${brief}"
      fi
      # Check if field already exists under the section (4-space indent)
      if grep -q "^    ${field}:" "$brief"; then
        sed -i '' "s|^    ${field}:.*|    ${field}: \"${value}\"|" "$brief"
      else
        # Add new field after section declaration
        awk -v sec="${section}" -v fld="${field}" -v val="${value}" '
          $0 == "  " sec ":" { print; print "    " fld ": \"" val "\""; next }
          { print }
        ' "${brief}" > "${brief}.tmp" && mv "${brief}.tmp" "${brief}"
      fi
      ;;
    intent)
      # intent.<field>
      sed -i '' "s|^  ${field}:.*|  ${field}: \"${value}\"|" "$brief"
      ;;
    decisions)
      if [ "$field" = "angle" ]; then
        sed -i '' "s|^  angle:.*|  angle: \"${value}\"|" "$brief"
      fi
      ;;
    artifacts)
      if [ "$field" = "target_file" ]; then
        # Replace target_files: [] with expanded list, or append to existing
        if grep -q "^  target_files: \[\]" "$brief"; then
          sed -i '' "s|^  target_files: \[\]|  target_files:|" "$brief"
          sed -i '' "/^  target_files:\$/a\\
    - ${value}
" "$brief"
        else
          sed -i '' "/^  target_files:\$/a\\
    - ${value}
" "$brief"
        fi
      fi
      ;;
    *)
      die "unknown section: ${section} (use discover/draft/enhance/publish/refresh/intent/decisions/artifacts)"
      ;;
  esac
  echo "✅ ${id}: ${key} → ${value}"
}

# ── list ────────────────────────────────────────────────────────
cmd_list() {
  local id="$1"; local key="$2"; local value="$3"
  [ -z "$value" ] && die "usage: briefctl list <article-id> <key.path> <value>"

  local dir; dir="$(resolve_state "$id")"
  local brief="${dir}/brief.candidate.yaml"
  [ -f "$brief" ] || die "brief not found: $brief"

  local section="${key%%.*}"
  local field="${key#*.}"

  case "$section" in
    discover|draft|enhance|publish|refresh)
      # Replace section: {} with expanded field+list, or append to existing list
      if grep -q "^  ${section}: {}" "$brief"; then
        # First item: expand empty object into field with list
        awk -v sec="${section}" -v fld="${field}" -v val="${value}" '
          $0 == "  " sec ": {}" {
            print "  " sec ":"
            print "    " fld ":"
            print "      - \"" val "\""
            next
          }
          { print }
        ' "${brief}" > "${brief}.tmp" && mv "${brief}.tmp" "${brief}"
      elif grep -q "^    ${field}:" "$brief"; then
        # Field exists: append after last list item under this field
        awk -v fld="${field}" -v val="${value}" '
          BEGIN { in_field = 0; last_list = 0; inserted = 0 }
          $0 == "    " fld ":" { in_field = 1; print; next }
          in_field && /^      - / { last_list = NR; print; next }
          in_field && /^    [a-z]/ { in_field = 0; if (!inserted) { print "      - \"" val "\""; inserted = 1 }; print; next }
          in_field && /^  [a-z]/ { in_field = 0; if (!inserted) { print "      - \"" val "\""; inserted = 1 }; print; next }
          in_field && /^$/ { in_field = 0; if (!inserted) { print "      - \"" val "\""; inserted = 1 }; print; next }
          { print }
          END { if (in_field && !inserted) { print "      - \"" val "\"" } }
        ' "${brief}" > "${brief}.tmp" && mv "${brief}.tmp" "${brief}"
      else
        # Section expanded but field missing: add field + first item after section
        awk -v sec="${section}" -v fld="${field}" -v val="${value}" '
          $0 == "  " sec ":" { print; print "    " fld ":"; print "      - \"" val "\""; next }
          { print }
        ' "${brief}" > "${brief}.tmp" && mv "${brief}.tmp" "${brief}"
      fi
      ;;
    *)
      die "list-add only supports mode_outputs sections (discover/draft/enhance/publish/refresh)"
      ;;
  esac
  echo "✅ ${id}: appended '${value}' to ${key}"
}

# ── commit ──────────────────────────────────────────────────────
cmd_commit() {
  local id="$1"
  local dir; dir="$(resolve_state "$id")"
  local candidate="${dir}/brief.candidate.yaml"
  local canonical="${dir}/brief.yaml"

  [ -f "$candidate" ] || die "candidate brief not found: $candidate"
  cp "$candidate" "$canonical"
  echo "✅ ${id}: brief.candidate.yaml → brief.yaml (committed)"
}

# ── show ────────────────────────────────────────────────────────
cmd_show() {
  local id="$1"
  local dir; dir="$(resolve_state "$id")"
  local brief="${dir}/brief.yaml"
  [ -f "$brief" ] || brief="${dir}/brief.candidate.yaml"
  [ -f "$brief" ] || die "no brief found for ${id}"
  cat "$brief"
}

# ── router ──────────────────────────────────────────────────────
case "$COMMAND" in
  init)   cmd_init   "$ARTICLE_ID" "${3:-}" ;;
  mode)   cmd_mode   "$ARTICLE_ID" "${3:-}" ;;
  set)    cmd_set    "$ARTICLE_ID" "${3:-}" "${4:-}" ;;
  list)   cmd_list   "$ARTICLE_ID" "${3:-}" "${4:-}" ;;
  commit) cmd_commit "$ARTICLE_ID" ;;
  show)   cmd_show   "$ARTICLE_ID" ;;
  *)
    echo "Usage: briefctl <command> <article-id> [args...]"
    echo ""
    echo "Commands:"
    echo "  init    <id> <review|compare|blog>   Create new brief.candidate.yaml"
    echo "  mode    <id> <mode>                  Switch current_mode"
    echo "  set     <id> <key.path> <value>      Set a scalar field"
    echo "  list    <id> <key.path> <value>      Append to a list field"
    echo "  commit  <id>                         Candidate → canonical"
    echo "  show    <id>                         Print brief to stdout"
    echo ""
    echo "Key paths:"
    echo "  intent.<field>          article_type, category, primary_keyword, etc."
    echo "  decisions.angle         Editorial angle"
    echo "  artifacts.target_file   Target MDX path"
    echo "  discover.<field>        duplicate_check_status, serp_decision, hub_spoke_role"
    echo "  draft.<field>           target_file, word_count, known_gaps"
    echo "  enhance.<field>         ai_pattern_score, images_present, internal_links_count"
    echo "  publish.<field>         article_check_status, build_status, delivery_ready"
    echo "  refresh.<field>         refresh_reason (use 'list' for multi-value)"
    exit 1
    ;;
esac
