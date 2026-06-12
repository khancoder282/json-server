import { chromium, type Page } from "playwright"
import sharp from "sharp"
import { mkdirSync, unlinkSync, readdirSync } from "fs"
import { join } from "path"

const BASE = "http://localhost:3000"
const OUT = join(process.cwd(), "public", "screenshots")
mkdirSync(OUT, { recursive: true })

const EMAIL = "datakcoder282@gmail.com"
const PASSWORD = "Demo@123"

// frame-1  : hero (json list — first page after login)
// frame-2-4: carousel slides
// frame-5-7: features section
// frame-8-10: "how it works" steps
const pages: [string, string][] = [
  ["/dashboard/json",     "frame-1-hero"],
  ["/dashboard/json",     "frame-2-json"],
  ["/dashboard/keys",     "frame-3-keys"],
  ["/dashboard/logs",     "frame-4-logs"],
  ["/dashboard/json/new", "frame-5-json-editor"],
  ["/dashboard/keys",     "frame-6-keys"],
  ["/dashboard/logs",     "frame-7-logs"],
  ["/dashboard/json/new", "frame-8-create-store"],
  ["/dashboard/keys",     "frame-9-keys"],
  ["/dashboard/json",     "frame-10-integration"],
]

async function shot(page: Page, url: string, file: string) {
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" })
  await page.waitForTimeout(900)
  await page.screenshot({ path: join(OUT, file), fullPage: false })
  process.stdout.write(`  ✓ ${file}\n`)
}

async function convertToWebp(pngPath: string, webpPath: string) {
  await sharp(pngPath).webp({ quality: 82 }).toFile(webpPath)
  unlinkSync(pngPath)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1280, height: 720 })

  // ── Login ──────────────────────────────────────────────
  console.log("Logging in...")
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" })
  await page.fill('[name="email"]', EMAIL)
  await page.fill('[name="password"]', PASSWORD)
  await page.click('[type="submit"]')
  await page.waitForURL(`${BASE}/dashboard/json`, { timeout: 20000 })
  await page.waitForLoadState("networkidle")
  console.log("✓ Logged in\n")

  // ── Light mode ─────────────────────────────────────────
  console.log("📸  Light mode:")
  await page.evaluate(() => localStorage.setItem("theme", "light"))

  for (const [url, name] of pages) {
    await shot(page, url, `${name}-light.png`)
  }

  // ── Dark mode ──────────────────────────────────────────
  console.log("\n📸  Dark mode:")
  await page.evaluate(() => localStorage.setItem("theme", "dark"))

  for (const [url, name] of pages) {
    await shot(page, url, `${name}-dark.png`)
  }

  await browser.close()

  // ── Convert PNG → WebP ─────────────────────────────────
  console.log("\n🔄  Converting to WebP...")
  const pngs = readdirSync(OUT).filter((f) => f.endsWith(".png"))
  await Promise.all(
    pngs.map((f) => {
      const base = f.replace(".png", "")
      const webp = join(OUT, `${base}.webp`)
      process.stdout.write(`  ✓ ${base}.webp\n`)
      return convertToWebp(join(OUT, f), webp)
    }),
  )

  console.log(`\n✅  Done — ${pngs.length} WebP files in public/screenshots/`)
}

main().catch((err) => {
  console.error("Error:", err.message)
  process.exit(1)
})
