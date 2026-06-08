#!/usr/bin/env bash
# Download favicons from tool websites (proxy-aware)
set -euo pipefail
cd "$(dirname "$0")/../public/logos"

# Auto-detect proxy (common ports for 艾可云/Clash/V2Ray)
PROXY_PORT="${PROXY_PORT:-}"
if [ -z "$PROXY_PORT" ]; then
  for port in 33210 33211 7890 7891; do
    if curl -x "http://127.0.0.1:$port" -sI https://www.google.com --max-time 3 > /dev/null 2>&1; then
      PROXY_PORT="$port"
      export https_proxy="http://127.0.0.1:$port"
      echo "✅ Proxy detected on port $port"
      break
    fi
  done
fi

if [ -z "$PROXY_PORT" ]; then
  echo "⚠️  No proxy detected. Downloads may fail. Start 艾可云 and retry."
fi

CURL_ARGS="-sL --max-time 10"
if [ -n "$PROXY_PORT" ]; then
  CURL_ARGS="$CURL_ARGS -x http://127.0.0.1:$PROXY_PORT"
fi

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
    if curl $CURL_ARGS -o "${slug}.png" "https://${domain}${path}" 2>/dev/null; then
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
