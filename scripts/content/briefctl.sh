#!/usr/bin/env bash
# briefctl.sh — thin wrapper around the Node brief state tool
#
# Commands:
#   briefctl init <article-id> <review|compare|blog>
#   briefctl mode <article-id> <discover|draft|enhance|publish|refresh>
#   briefctl set <article-id> <key.path> <value>
#   briefctl list <article-id> <key.path> <value>
#   briefctl commit <article-id>
#   briefctl show <article-id>
#   briefctl validate <article-id>
#   briefctl validate --all
#
# The actual implementation lives in briefctl.mjs so state writes use
# structured YAML serialization instead of shell string concatenation.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "${SCRIPT_DIR}/briefctl.mjs" "$@"
