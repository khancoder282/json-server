# Deploy snapshot (Next.js standalone)

- Source: `main` @ `98822db`
- Built: 2026-06-13T02:09:19.698Z

Self-contained — no install needed. Put your secrets in a `.env` file
next to `server.js` (Bun auto-loads it; set `PORT` there too).

Run the web server directly:

```sh
bun server.js        # or: bun run start
```

Run with PM2 (requires `bun` in PATH on the server):

```sh
./start.sh        # pm2 start ecosystem.config.cjs && pm2 save
```

The cron process (`cron.js`) handles weekly log cleanup.

## Updating

Each deploy is a fresh force-pushed snapshot, so `git pull` reports
diverged branches. Use the bundled script (resets to the remote, then
restarts PM2 — your untracked `.env` is preserved):

```sh
./update.sh
```

It runs:

```sh
git fetch origin
git reset --hard origin/deploy
pm2 restart ecosystem.config.cjs
```
