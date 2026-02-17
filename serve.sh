#!/bin/bash
cd /Users/mario/.openclaw/workspace/games/mango-paradise-ultimate

# Start HTTP server
python3 -m http.server 8765 &
HTTP_PID=$!

# Start tunnel and capture URL
/opt/homebrew/bin/cloudflared tunnel --url http://localhost:8765 2>&1 | tee /tmp/cf-tunnel-current.log &
TUNNEL_PID=$!

# Wait for URL and save it
for i in $(seq 1 30); do
  sleep 1
  URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/cf-tunnel-current.log 2>/dev/null | head -1)
  if [ -n "$URL" ]; then
    echo "$URL" > /tmp/mango-game-url.txt
    echo "$(date): $URL" >> /tmp/mango-game-url-history.txt
    break
  fi
done

# Wait for either to exit
wait $HTTP_PID $TUNNEL_PID
