#!/usr/bin/env bash
# Thin wrapper around the Node backlink opportunity finder

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "${SCRIPT_DIR}/find-link-ops.mjs" "$@"
