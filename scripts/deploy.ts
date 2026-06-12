/**
 * Build Next.js (standalone) and force-push a self-contained server to a
 * deploy branch — no `bun install` needed on the server.
 *
 * Usage:
 *   bun run deploy                      → deploys to branch "deploy"
 *   bun run deploy -b=branch-deploy     → deploys to branch "branch-deploy"
 *   bun run deploy --dry-run            → build + stage everything, skip the push
 *   bun run deploy --remote=<name|url>  → push to another remote (default: origin)
 *
 * Requires `output: "standalone"` in next.config.ts. The deploy branch is a
 * fresh snapshot on every run (single commit, force-pushed). To run it:
 *   PORT=3000 bun server.js
 */
import { $ } from "bun"
import { existsSync } from "node:fs"
import { cp, mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

const DEFAULT_BRANCH = "deploy"

// `next build` with output:"standalone" emits a minimal server here, with a
// pruned node_modules bundled in — but NOT the static assets or public/, which
// Next expects to be copied alongside the server. We assemble all three.
const STANDALONE_DIR = ".next/standalone"
const CRON_SRC = "scripts/cron.ts"

function fail(message: string): never {
  console.error(`✖ ${message}`)
  process.exit(1)
}

function parseArgs(argv: string[]) {
  let branch = DEFAULT_BRANCH
  let remote = "origin"
  let dryRun = false
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--dry-run") dryRun = true
    else if (arg.startsWith("-b=")) branch = arg.slice("-b=".length)
    else if (arg.startsWith("--branch=")) branch = arg.slice("--branch=".length)
    else if (arg === "-b" || arg === "--branch") branch = argv[++i] ?? ""
    else if (arg.startsWith("--remote=")) remote = arg.slice("--remote=".length)
    else fail(`Unknown argument: ${arg}`)
  }
  if (!branch) fail("Missing branch name after -b")
  return { branch, remote, dryRun }
}

async function main() {
  const { branch, remote, dryRun } = parseArgs(Bun.argv.slice(2))

  const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
  process.chdir(repoRoot)

  const refCheck = await $`git check-ref-format --branch ${branch}`
    .nothrow()
    .quiet()
  if (refCheck.exitCode !== 0) fail(`"${branch}" is not a valid branch name`)

  const currentBranch = (await $`git rev-parse --abbrev-ref HEAD`.text()).trim()
  if (branch === currentBranch)
    fail(
      `Refusing to deploy to "${branch}" — it is the currently checked-out branch`
    )
  if (branch === "main" || branch === "master")
    fail(`Refusing to force-push build output to "${branch}"`)

  // Resolve the remote to a URL so the temp repo can push without any setup.
  const remoteUrl = /[/:]/.test(remote)
    ? remote
    : (await $`git remote get-url ${remote}`.text()).trim()

  console.log("▶ Building Next.js…")
  await $`bun run build`

  if (!existsSync(join(STANDALONE_DIR, "server.js")))
    fail(
      `${STANDALONE_DIR}/server.js missing — set output: "standalone" in next.config.ts`
    )

  console.log("▶ Staging standalone server…")
  const stage = await mkdtemp(join(tmpdir(), "json-server-deploy-"))

  try {
    // 1. The standalone server + its bundled node_modules become the root.
    await cp(STANDALONE_DIR, stage, { recursive: true })
    // 2. Static assets and public/ aren't included in standalone — Next loads
    //    them from .next/static and public/ relative to server.js.
    await cp(".next/static", join(stage, ".next/static"), { recursive: true })
    if (existsSync("public"))
      await cp("public", join(stage, "public"), { recursive: true })

    // 3. The cron job (weekly log cleanup) imports mysql2/drizzle/node-cron +
    //    the DB schema — none of which are in the pruned standalone
    //    node_modules. Bundle it into a single self-contained cron.js.
    // --format=cjs: PM2's bun fork container loads the entry with require(),
    // which can't load an async/ESM module — so emit CommonJS like server.js.
    const hasCron = existsSync(CRON_SRC)
    if (hasCron)
      await $`bun build ${CRON_SRC} --target=bun --format=cjs --outfile=${join(stage, "cron.js")}`.quiet()

    // Slim the standalone package.json down to a clean start script — its
    // dependencies are irrelevant since node_modules is already bundled.
    const pkg = (await Bun.file(
      join(STANDALONE_DIR, "package.json")
    ).json()) as {
      name?: string
      version?: string
      type?: string
    }
    await Bun.write(
      join(stage, "package.json"),
      JSON.stringify(
        {
          name: pkg.name,
          version: pkg.version,
          private: true,
          type: pkg.type,
          scripts: { start: "bun server.js" },
        },
        null,
        2
      ) + "\n"
    )

    // PM2 process config. Must be .cjs: package.json is type:module, so a .js
    // file with module.exports would be parsed as ESM and fail. Secrets + PORT
    // come from a .env placed next to server.js — Bun auto-loads it at startup.
    const appName = pkg.name ?? "json-server"
    // exec_mode "fork": cluster mode needs node's cluster module; bun uses fork.
    const pm2App = (name: string, script: string) =>
      [
        "    {",
        `      name: "${name}",`,
        `      script: "${script}",`,
        '      interpreter: "bun",',
        "      cwd: __dirname,",
        "      instances: 1,",
        '      exec_mode: "fork",',
        "      autorestart: true,",
        '      env: { NODE_ENV: "production" },',
        "    },",
      ].join("\n")
    const apps = [pm2App(appName, "server.js")]
    if (hasCron) apps.push(pm2App(`${appName}-cron`, "cron.js"))
    await Bun.write(
      join(stage, "ecosystem.config.cjs"),
      [
        "// PM2 config for the standalone Next.js server (+ weekly cron).",
        "//   pm2 start ecosystem.config.cjs",
        "// Provide env via a .env file next to server.js (Bun auto-loads it).",
        "module.exports = {",
        "  apps: [",
        apps.join("\n"),
        "  ],",
        "}",
        "",
      ].join("\n")
    )

    // Convenience scripts, committed so `git reset --hard` keeps them.
    // A local `.env` (untracked) survives the reset.
    await Bun.write(
      join(stage, "start.sh"),
      [
        "#!/usr/bin/env sh",
        "# First-time start: launch under PM2 and persist the process list.",
        "set -e",
        "pm2 start ecosystem.config.cjs",
        "pm2 save",
        "",
      ].join("\n")
    )
    await Bun.write(
      join(stage, "update.sh"),
      [
        "#!/usr/bin/env sh",
        "# Pull the latest deploy snapshot and restart PM2.",
        "# Each deploy is force-pushed, so reset to the remote (never git pull).",
        "set -e",
        "git fetch origin",
        `git reset --hard origin/${branch}`,
        "pm2 restart ecosystem.config.cjs",
        "pm2 save",
        "",
      ].join("\n")
    )
    await $`chmod +x ${join(stage, "start.sh")} ${join(stage, "update.sh")}`

    const sha = (await $`git rev-parse --short HEAD`.text()).trim()
    const date = new Date().toISOString()
    await Bun.write(
      join(stage, "README.md"),
      [
        "# Deploy snapshot (Next.js standalone)",
        "",
        `- Source: \`${currentBranch}\` @ \`${sha}\``,
        `- Built: ${date}`,
        "",
        "Self-contained — no install needed. Put your secrets in a `.env` file",
        "next to `server.js` (Bun auto-loads it; set `PORT` there too).",
        "",
        "Run the web server directly:",
        "",
        "```sh",
        "bun server.js        # or: bun run start",
        "```",
        "",
        "Run with PM2 (requires `bun` in PATH on the server):",
        "",
        "```sh",
        "./start.sh        # pm2 start ecosystem.config.cjs && pm2 save",
        "```",
        "",
        ...(hasCron
          ? ["The cron process (`cron.js`) handles weekly log cleanup.", ""]
          : []),
        "## Updating",
        "",
        "Each deploy is a fresh force-pushed snapshot, so `git pull` reports",
        "diverged branches. Use the bundled script (resets to the remote, then",
        "restarts PM2 — your untracked `.env` is preserved):",
        "",
        "```sh",
        "./update.sh",
        "```",
        "",
        "It runs:",
        "",
        "```sh",
        "git fetch origin",
        `git reset --hard origin/${branch}`,
        "pm2 restart ecosystem.config.cjs",
        "```",
        "",
      ].join("\n")
    )

    // Commit identity: reuse the repo's, with a fallback for bare environments.
    const userName =
      (await $`git config user.name`.nothrow().text()).trim() || "deploy-script"
    const userEmail =
      (await $`git config user.email`.nothrow().text()).trim() ||
      "deploy@localhost"
    const message = `Deploy ${date} (source ${currentBranch}@${sha})`

    await $`git -C ${stage} init -q -b ${branch}`
    // -f: ignore any global/nested .gitignore rules (e.g. for .next/)
    await $`git -C ${stage} add -A -f`
    await $`git -C ${stage} -c user.name=${userName} -c user.email=${userEmail} commit -q -m ${message}`

    const fileCount = (await $`git -C ${stage} ls-files`.text())
      .trim()
      .split("\n").length
    const size = (await $`du -sh ${stage}`.text()).split("\t")[0].trim()
    console.log(`  ${fileCount} files, ${size}`)

    if (dryRun) {
      console.log(`▶ Dry run — skipping push. Staged at: ${stage}`)
      console.log(`  Would push to ${remoteUrl} → ${branch}`)
      return
    }

    console.log(`▶ Pushing to ${remoteUrl} → ${branch}…`)
    await $`git -C ${stage} push --force ${remoteUrl} HEAD:refs/heads/${branch}`
    console.log(`✔ Deployed "${message}"`)
  } finally {
    // Keep the staging dir on dry runs so it can be inspected.
    if (!dryRun) await rm(stage, { recursive: true, force: true })
  }
}

await main()
