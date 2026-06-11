/**
 * Build Next.js and force-push only the runtime files to a deploy branch.
 *
 * Usage:
 *   bun run deploy                      → deploys to branch "deploy"
 *   bun run deploy -b=branch-deploy     → deploys to branch "branch-deploy"
 *   bun run deploy --dry-run            → build + stage everything, skip the push
 *   bun run deploy --remote=<name|url>  → push to another remote (default: origin)
 *
 * The deploy branch is a fresh snapshot on every run (single commit,
 * force-pushed). To run the app from it:
 *   bun install --production && bun run start
 */
import { $ } from "bun"
import { existsSync } from "node:fs"
import { cp, mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

const DEFAULT_BRANCH = "deploy"

// Everything `next start` needs at runtime — nothing else gets pushed.
// Note: .env* files are intentionally excluded; the server provides its own.
const INCLUDE = [
  ".next",
  "public",
  "package.json",
  "bun.lock",
  "next.config.ts",
]
const REQUIRED = [".next", "package.json"]
// Dev/build-cache leftovers inside .next that `next start` never reads.
const EXCLUDE_AFTER_COPY = [
  ".next/cache",
  ".next/dev",
  ".next/types",
  ".next/diagnostics",
  ".next/trace",
]

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

  console.log("▶ Staging deploy files…")
  const stage = await mkdtemp(join(tmpdir(), "json-server-deploy-"))

  try {
    for (const file of INCLUDE) {
      if (!existsSync(file)) {
        if (REQUIRED.includes(file))
          fail(`Required file/folder missing after build: ${file}`)
        console.warn(`  (skipping missing ${file})`)
        continue
      }
      await cp(file, join(stage, file), { recursive: true })
    }
    for (const file of EXCLUDE_AFTER_COPY) {
      await rm(join(stage, file), { recursive: true, force: true })
    }

    const sha = (await $`git rev-parse --short HEAD`.text()).trim()
    const date = new Date().toISOString()
    await Bun.write(
      join(stage, "README.md"),
      [
        "# Deploy snapshot",
        "",
        `- Source: \`${currentBranch}\` @ \`${sha}\``,
        `- Built: ${date}`,
        "",
        "Run it:",
        "",
        "```sh",
        "bun install --production",
        "bun run start",
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
