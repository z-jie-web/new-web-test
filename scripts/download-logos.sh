#!/usr/bin/env bash
# Download favicons from tool websites
set -euo pipefail
cd "$(dirname "$0")/../public/logos"

declare -A TOOLS
TOOLS=(
  ["adobe-firefly"]="www.adobe.com"
  ["capcut-international"]="www.capcut.com"
  ["captions"]="www.captions.ai"
  ["d-id"]="www.d-id.com"
  ["dall-e-3"]="openai.com"
  ["deepswapper"]="deepswapper.com"
  ["descript"]="www.descript.com"
  ["facefusion"]="github.com"
  ["facemagic"]="facemagic.ai"
  ["happy-scribe"]="www.happyscribe.com"
  ["invideo-ai"]="invideo.io"
  ["kapwing"]="www.kapwing.com"
  ["kling-ai"]="klingai.com"
  ["leonardo-ai"]="leonardo.ai"
  ["luma-dream-machine"]="lumalabs.ai"
  ["midjourney"]="www.midjourney.com"
  ["murf-ai"]="murf.ai"
  ["pika-2-0"]="pika.art"
  ["pixverse"]="pixverse.ai"
  ["play-ht"]="play.ht"
  ["reface"]="reface.ai"
  ["remaker-face-swap"]="remaker.ai"
  ["runway-gen-3"]="runwayml.com"
  ["stable-diffusion"]="stability.ai"
  ["swapface"]="swapface.org"
  ["topaz-video-ai"]="www.topazlabs.com"
  ["veed"]="www.veed.io"
)

FAILED=()

for slug in "${!TOOLS[@]}"; do
  domain="${TOOLS[$slug]}"
  printf "%-30s → " "$slug"
  ok=false

  for path in "/favicon.ico" "/favicon-32x32.png" "/favicon.png" "/apple-touch-icon.png"; do
    if curl -sL --max-time 10 -o "${slug}.png" "https://${domain}${path}" 2>/dev/null; then
      size=$(wc -c < "${slug}.png" | tr -d ' ')
      if [ "$size" -gt 500 ]; then
        echo "OK ${size}B (${path})"
        ok=true
        break
      fi
    fi
  done

  if ! $ok; then
    echo "FAIL"
    FAILED+=("$slug")
  fi
done

echo ""
echo "=== Summary ==="
echo "Total: ${#TOOLS[@]}"
echo "Failed: ${#FAILED[@]}"
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "Missing:"
  for s in "${FAILED[@]}"; do
    echo "  - $s"
  done
fi
