#!/bin/bash
# Mango Paradise — persistent serve + Cloudflare tunnel
# Keeps game accessible from China via trycloudflare.com

PORT=8765
DIR="$(cd "$(dirname "$0")" && pwd)"
TUNNEL_LOG="/tmp/mango-tunnel.log"

# Kill existing
pkill -f "http.server $PORT" 2>/dev/null
pkill -f "cloudflared tunnel.*$PORT" 2>/dev/null
sleep 1

# Start local server
cd "$DIR"
python3 -m http.server $PORT &>/dev/null &
sleep 2

# Start Cloudflare tunnel
cloudflared tunnel --url http://localhost:$PORT &>"$TUNNEL_LOG" &
sleep 8

# Extract URL
URL=$(grep -o 'https://[a-z\-]*\.trycloudflare\.com' "$TUNNEL_LOG" | head -1)
if [ -n "$URL" ]; then
    echo "✅ Mango Paradise is live at: $URL"
    echo "$URL" > /tmp/mango-paradise-url.txt
else
    echo "❌ Failed to get tunnel URL. Check $TUNNEL_LOG"
fi
