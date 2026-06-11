import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Emit a self-contained server (.next/standalone) for deploys — bundles a
  // pruned node_modules so the deploy branch runs without `bun install`.
  output: "standalone",
  // No user-uploaded images, so skip server-side image optimization.
  images: { unoptimized: true },
  // unoptimized:true means sharp is never required at runtime, but Next still
  // traces it into the standalone bundle — exclude it to drop ~16M.
  outputFileTracingExcludes: {
    "*": ["node_modules/sharp/**", "node_modules/@img/**"],
  },
}

export default nextConfig
