#!/usr/bin/env sh
# First-time start: launch under PM2 and persist the process list.
set -e
pm2 start ecosystem.config.cjs
pm2 save
