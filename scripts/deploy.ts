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
        "Self-contained — no install needed. Provide env vars and run:",
        "",
        "```sh",
        "PORT=3000 bun server.js   # or: bun run start",
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
