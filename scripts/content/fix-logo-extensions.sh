#!/usr/bin/env bash
# fix-logo-extensions.sh <target-file>
#
# Scans an MDX file for /logos/*.svg references and checks whether the file
# actually exists. If only the .png variant exists, fixes the reference.
# Silently passes if both .svg and .png exist or if neither exists.

set -euo pipefail

TARGET="$1"
PUBLIC_DIR="$(cd "$(dirname "$0")/../../public" && pwd)"
TMP="$(mktemp /tmp/fix-logos.XXXXXX)"
trap 'rm -f "$TMP"' EXIT

changed=0

while IFS= read -r line; do
  if [[ "$line" =~ (/logos/[^\)[:space:]]+\.svg) ]]; then
    svg_path="${BASH_REMATCH[1]}"
    svg_basename="$(basename "$svg_path" .svg)"
    svg_file="${PUBLIC_DIR}/logos/${svg_basename}.svg"
    png_file="${PUBLIC_DIR}/logos/${svg_basename}.png"

    if [ ! -f "$svg_file" ] && [ -f "$png_file" ]; then
      new_line="${line//\/logos\/${svg_basename}\.svg/\/logos\/${svg_basename}\.png}"
      echo "$new_line" >> "$TMP"
      echo "  FIXED: $svg_path → /logos/${svg_basename}.png (SVG missing, PNG exists)"
      changed=$((changed + 1))
    else
      echo "$line" >> "$TMP"
    fi
  else
    echo "$line" >> "$TMP"
  fi
done < "$TARGET"

if [ $changed -gt 0 ]; then
  mv "$TMP" "$TARGET"
  echo "$(basename "$TARGET"): $changed logo reference(s) fixed ($(wc -c < "$TARGET") bytes)"
else
  echo "$(basename "$TARGET"): all logo references valid"
fi
