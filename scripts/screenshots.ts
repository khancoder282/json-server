import { chromium, type Page } from "playwright"
import sharp from "sharp"
import { mkdirSync, unlinkSync, readdirSync } from "fs"
import { join } from "path"

const BASE = "http://localhost:3000"
const OUT = join(process.cwd(), "public", "screenshots")
mkdirSync(OUT, { recursive: true })

const EMAIL = "datakcoder282@gmail.com"
const PASSWORD = "Demo@123"

// Pages to capture: [route, base-filename]
const pages: [string, string][] = [
  ["/dashboard",          "frame-1-hero"],
  ["/dashboard",          "frame-2-dashboard"],
  ["/dashboard/json",     "frame-3-json"],
  ["/dashboard/keys",     "frame-4-keys"],
  ["/dashboard/logs",     "frame-5-logs"],
  ["/dashboard/json/new", "frame-6-json-editor"],
  ["/dashboard/keys",     "frame-7-keys"],
  ["/dashboard/logs",     "frame-8-logs"],
  ["/dashboard/json/new", "frame-9-create-store"],
  ["/dashboard/keys",     "frame-10-keys"],
  ["/dashboard/json",     "frame-11-integration"],
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
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 20000 })
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
