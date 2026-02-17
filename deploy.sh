#!/bin/bash
cd /Users/mario/.openclaw/workspace/games/mango-paradise-ultimate

# Sync deploy directory
rm -rf /tmp/mango-deploy
mkdir -p /tmp/mango-deploy/css /tmp/mango-deploy/js /tmp/mango-deploy/sounds /tmp/mango-deploy/assets
cp index.html manifest.json /tmp/mango-deploy/
cp css/*.css /tmp/mango-deploy/css/
cp js/*.js /tmp/mango-deploy/js/
cp -r sounds/ /tmp/mango-deploy/sounds/ 2>/dev/null
cp -r assets/ /tmp/mango-deploy/assets/ 2>/dev/null

# Deploy to surge
surge /tmp/mango-deploy mango-paradise.surge.sh
echo "$(date): Deployed to https://mango-paradise.surge.sh/" >> /tmp/mango-deploy-log.txt
