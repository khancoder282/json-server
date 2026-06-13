// PM2 config for the standalone Next.js server (+ weekly cron).
//   pm2 start ecosystem.config.cjs
// Provide env via a .env file next to server.js (Bun auto-loads it).
module.exports = {
  apps: [
    {
      name: "json-server",
      script: "server.js",
      interpreter: "bun",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      env: { NODE_ENV: "production" },
    },
    {
      name: "json-server-cron",
      script: "cron.js",
      interpreter: "bun",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      env: { NODE_ENV: "production" },
    },
  ],
}
