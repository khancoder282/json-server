#!/usr/bin/env bun
/**
 * Generates favicon.ico, icon.png, apple-icon.png, and og-image.png
 * from the brand SVG using Sharp.
 *
 * Run: bun scripts/generate-favicon.ts
 */
import sharp from "sharp"
import { writeFileSync, mkdirSync } from "fs"
import { join } from "path"

const ROOT = process.cwd()
const BRAND = "#EAB308"
const BRAND_DARK = "#CA8A04"

// Rounded-square Database icon (Lucide 24×24 paths scaled to `size`)
function iconSvg(size: number): string {
  const radius = Math.round(size * 0.22)
  const pad = Math.round(size * 0.18)
  const scale = (size - pad * 2) / 24

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BRAND}"/>
      <stop offset="100%" stop-color="${BRAND_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>
  <g transform="translate(${pad},${pad}) scale(${scale.toFixed(4)})"
     fill="none" stroke="white" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v14a9 3 0 0 0 18 0V5"/>
    <path d="M3 12a9 3 0 0 0 18 0"/>
  </g>
</svg>`
}

// 1200×630 Open Graph image
function ogSvg(): string {
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FEFCE8"/>
      <stop offset="100%" stop-color="#FEF3C7"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BRAND}"/>
      <stop offset="100%" stop-color="${BRAND_DARK}"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Soft ambient circles -->
  <circle cx="1100" cy="80"  r="320" fill="${BRAND}" opacity="0.06"/>
  <circle cx="100"  cy="560" r="220" fill="${BRAND}" opacity="0.06"/>

  <!-- Logo mark (88×88) -->
  <rect x="80" y="190" width="88" height="88" rx="20" fill="url(#brand)"/>
  <g transform="translate(100,210) scale(2)"
     fill="none" stroke="white" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v14a9 3 0 0 0 18 0V5"/>
    <path d="M3 12a9 3 0 0 0 18 0"/>
  </g>

  <!-- Title -->
  <text x="80" y="355"
        font-family="system-ui,-apple-system,sans-serif"
        font-size="74" font-weight="700" fill="#1C1917">JSON Server</text>

  <!-- Tagline -->
  <text x="80" y="415"
        font-family="system-ui,-apple-system,sans-serif"
        font-size="30" fill="#78716C">
    Store, manage, and serve JSON data with a simple REST API.
  </text>

  <!-- Domain -->
  <text x="80" y="540"
        font-family="system-ui,-apple-system,sans-serif"
        font-size="22" fill="#A8A29E">json-server.denmobi.vn</text>

  <!-- Code card (right) -->
  <rect x="860" y="160" width="260" height="310" rx="16"
        fill="white" fill-opacity="0.65" stroke="#E7E5E4" stroke-width="1"/>

  <text x="882" y="205"
        font-family="ui-monospace,monospace" font-size="16" fill="#9CA3AF">GET /api/json/{id}</text>
  <line x1="878" y1="218" x2="1102" y2="218" stroke="#E7E5E4"/>

  <text x="882" y="250" font-family="ui-monospace,monospace" font-size="15" fill="#6B7280">{</text>
  <text x="902" y="278" font-family="ui-monospace,monospace" font-size="15" fill="#16A34A">"id":  </text>
  <text x="980" y="278" font-family="ui-monospace,monospace" font-size="15" fill="#7C3AED">"bb27…"</text>
  <text x="902" y="306" font-family="ui-monospace,monospace" font-size="15" fill="#16A34A">"name":</text>
  <text x="990" y="306" font-family="ui-monospace,monospace" font-size="15" fill="#7C3AED">"config"</text>
  <text x="902" y="334" font-family="ui-monospace,monospace" font-size="15" fill="#16A34A">"data":</text>
  <text x="988" y="334" font-family="ui-monospace,monospace" font-size="15" fill="#6B7280">{ … }</text>
  <text x="882" y="362" font-family="ui-monospace,monospace" font-size="15" fill="#6B7280">}</text>

  <!-- HTTP badge -->
  <rect x="878" y="400" width="64" height="26" rx="6" fill="#16A34A"/>
  <text x="910" y="418"
        font-family="ui-monospace,monospace" font-size="13"
        font-weight="700" fill="white" text-anchor="middle">200 OK</text>
</svg>`
}

// Build a valid .ico file that embeds PNG images
function buildIco(images: { png: Buffer; size: number }[]): Buffer {
  const count = images.length
  let offset = 6 + 16 * count

  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)   // reserved
  header.writeUInt16LE(1, 2)   // type = ICO
  header.writeUInt16LE(count, 4)

  const entries = images.map(({ png, size }) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)  // width  (0 → 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)  // height
    entry.writeUInt8(0, 2)    // color count
    entry.writeUInt8(0, 3)    // reserved
    entry.writeUInt16LE(1, 4) // planes
    entry.writeUInt16LE(32, 6) // bits per pixel
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += png.length
    return entry
  })

  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)])
}

async function main() {
  const appDir = join(ROOT, "app")
  const pubDir = join(ROOT, "public")
  mkdirSync(appDir, { recursive: true })
  mkdirSync(pubDir, { recursive: true })

  // ── Icon PNGs ──────────────────────────────────────────
  console.log("🎨  Generating icons…")
  const pngs: Record<number, Buffer> = {}
  for (const size of [16, 32, 48, 180, 192, 512]) {
    pngs[size] = await sharp(Buffer.from(iconSvg(size)))
      .resize(size, size)
      .png()
      .toBuffer()
    process.stdout.write(`  ✓ ${size}×${size}\n`)
  }

  // favicon.ico — 16, 32, 48
  writeFileSync(
    join(appDir, "favicon.ico"),
    buildIco([
      { png: pngs[16], size: 16 },
      { png: pngs[32], size: 32 },
      { png: pngs[48], size: 48 },
    ])
  )
  console.log("  ✓ app/favicon.ico  (16 + 32 + 48)")

  // icon.png (Next.js App Router picks this up automatically)
  writeFileSync(join(appDir, "icon.png"), pngs[512])
  console.log("  ✓ app/icon.png  (512×512)")

  // apple-icon.png
  writeFileSync(join(appDir, "apple-icon.png"), pngs[180])
  console.log("  ✓ app/apple-icon.png  (180×180)")

  // public copies for manifest / external reference
  writeFileSync(join(pubDir, "icon-192.png"), pngs[192])
  writeFileSync(join(pubDir, "icon-512.png"), pngs[512])
  console.log("  ✓ public/icon-192.png, icon-512.png")

  // ── OG image ──────────────────────────────────────────
  console.log("\n🖼️   Generating OG image…")
  const ogPng = await sharp(Buffer.from(ogSvg()))
    .resize(1200, 630)
    .png()
    .toBuffer()
  writeFileSync(join(pubDir, "og-image.png"), ogPng)
  console.log("  ✓ public/og-image.png  (1200×630)")

  console.log("\n✅  Done!")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
