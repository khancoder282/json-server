#!/usr/bin/env sh
# Pull the latest deploy snapshot and restart PM2.
# Each deploy is force-pushed, so reset to the remote (never git pull).
set -e
git fetch origin
git reset --hard origin/deploy
pm2 restart ecosystem.config.cjs
pm2 save
