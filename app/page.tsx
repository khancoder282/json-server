import Link from "next/link"
import { auth } from "@/auth"
import { buttonVariants } from "@/components/ui/button"
import { Logo } from "@/components/shared/logo"
import { BlurFade } from "@/components/shared/blur-fade"
import { TiltCard } from "@/components/shared/tilt-card"
import { HeroBackground } from "@/components/shared/hero-background"
import { ImageFrame } from "@/components/shared/image-frame"
import { ScreenshotCarousel } from "@/components/shared/screenshot-carousel"
import { cn } from "@/lib/utils"
import { signOutAction } from "@/lib/actions/auth"

const features = [
  {
    title: "JSON Stores",
    desc: "Create and manage JSON data stores with a built-in code editor. Toggle public or private visibility per store.",
    imageLabel: "JSON Editor",
    tag: "Frame 6",
  },
  {
    title: "API Keys",
    desc: "Issue scoped API keys with granular GET/PUT permissions, linked to specific JSON stores.",
    imageLabel: "Key Management",
    tag: "Frame 7",
  },
  {
    title: "Access Logs",
    desc: "Track every API call with detailed logs — IP, user agent, request and response bodies.",
    imageLabel: "Access Logs",
    tag: "Frame 8",
  },
]

const steps = [
  {
    step: "01",
    title: "Create a JSON Store",
    desc: "Use the built-in code editor to define your JSON structure. Toggle public or private visibility.",
    imageLabel: "Create store",
    tag: "Frame 9",
  },
  {
    step: "02",
    title: "Generate an API Key",
    desc: "Issue a scoped key with GET or PUT permissions and link it to the stores you want to expose.",
    imageLabel: "Generate key",
    tag: "Frame 10",
  },
  {
    step: "03",
    title: "Integrate anywhere",
    desc: "Call GET /api/json/{id} from any app. Use PUT to deep-merge updates into your store.",
    imageLabel: "API integration",
    tag: "Frame 11",
  },
]

export default async function HomePage() {
  const session = await auth()
  const isLoggedIn = !!session?.user

  return (
    <div className="flex min-h-screen flex-col">

      {/* ── Header ─────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex gap-3">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Dashboard</Link>
              <form action={signOutAction}>
                <button type="submit" className={cn(buttonVariants({ size: "sm" }))}>Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Sign in</Link>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>Get started</Link>
            </>
          )}
        </div>
      </header>

      <main>
        {/* ── Hero ───────────────────────────────── */}
        <section className="relative flex flex-col items-center text-center px-6 pt-24 pb-20 gap-6 overflow-hidden">
          <HeroBackground />

          <BlurFade delay={0.02} direction="none">
            <div className="relative inline-flex items-center gap-2 rounded-full border bg-background/60 backdrop-blur-sm px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Simple · Reliable · Fast
            </div>
          </BlurFade>

          <BlurFade delay={0.1} yOffset={24}>
            <h1 className="relative max-w-2xl text-5xl font-bold tracking-tight leading-tight md:text-6xl">
              Your personal{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, oklch(0.852 0.199 91.936), oklch(0.681 0.162 75.834), oklch(0.852 0.199 91.936))",
                  backgroundSize: "200% auto",
                  animation: "gradient-pan 4s linear infinite",
                }}
              >
                JSON storage
              </span>{" "}
              API
            </h1>
          </BlurFade>

          <BlurFade delay={0.2} yOffset={20}>
            <p className="relative max-w-xl text-muted-foreground text-lg leading-relaxed">
              Store, manage, and serve JSON data with a simple REST API. Create stores, issue API keys, and track usage — all in one place.
            </p>
          </BlurFade>

          <BlurFade delay={0.28}>
            <div className="relative flex flex-wrap gap-3 justify-center">
              {isLoggedIn ? (
                <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>Go to Dashboard</Link>
              ) : (
                <>
                  <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>Get started free</Link>
                  <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>Sign in</Link>
                </>
              )}
            </div>
          </BlurFade>

          {/* ── Frame 1 : Hero ── */}
          <BlurFade delay={0.38} yOffset={30} className="relative w-full max-w-4xl mt-4">
            <TiltCard strength={4} className="w-full">
              <div className="rounded-2xl border shadow-2xl shadow-black/15 overflow-hidden bg-card">
                {/* Browser chrome */}
                <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-3">
                  <div className="flex gap-1.5 shrink-0">
                    <div className="size-3 rounded-full bg-red-400/80" />
                    <div className="size-3 rounded-full bg-yellow-400/80" />
                    <div className="size-3 rounded-full bg-green-400/80" />
                  </div>
                  <div className="flex-1 max-w-xs mx-auto rounded-md bg-background/70 px-3 py-1 text-xs text-center text-muted-foreground font-mono">
                    app.json-server.com/dashboard
                  </div>
                </div>
                {/* ↓ Replace with: <Image src="/img/hero.png" width={1280} height={720} alt="Dashboard" className="w-full" /> */}
                <div className="aspect-[16/9]">
                  <ImageFrame label="Dashboard overview" tag="Frame 1" />
                </div>
              </div>
            </TiltCard>
          </BlurFade>
        </section>

        {/* ── Carousel (Frames 2–5) ───────────────── */}
        <section className="border-t px-6 py-24">
          <div className="max-w-4xl mx-auto space-y-10">
            <BlurFade triggerOnView direction="none">
              <div className="text-center space-y-2">
                <p className="text-xs font-semibold tracking-widest uppercase text-primary/70">Tour</p>
                <h2 className="text-3xl font-bold">See it in action</h2>
                <p className="text-muted-foreground">Browse every section of the dashboard.</p>
              </div>
            </BlurFade>
            <BlurFade triggerOnView delay={0.1} yOffset={28}>
              <ScreenshotCarousel />
            </BlurFade>
          </div>
        </section>

        {/* ── Features (Frames 6–8) ──────────────── */}
        <section className="border-t bg-muted/20 px-6 py-28">
          <div className="max-w-5xl mx-auto space-y-16">
            <BlurFade triggerOnView direction="none">
              <div className="text-center space-y-3">
                <p className="text-xs font-semibold tracking-widest uppercase text-primary/70">Features</p>
                <h2 className="text-3xl font-bold">Everything you need to manage JSON data</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  A complete toolkit for storing, securing, and serving JSON data via REST.
                </p>
              </div>
            </BlurFade>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map(({ title, desc, imageLabel, tag }, i) => (
                <BlurFade key={title} triggerOnView delay={i * 0.1} yOffset={32}>
                  <TiltCard strength={8} className="h-full">
                    <div className="rounded-xl border bg-card overflow-hidden h-full transition-shadow duration-300 hover:shadow-xl">
                      {/* ↓ Replace with: <Image src="/img/feature-N.png" width={800} height={450} alt={title} className="w-full object-cover" /> */}
                      <div className="aspect-video border-b">
                        <ImageFrame label={imageLabel} tag={tag} />
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold">{title}</h3>
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  </TiltCard>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works (Frames 9–11) ─────────── */}
        <section className="px-6 py-28">
          <div className="max-w-5xl mx-auto space-y-16">
            <BlurFade triggerOnView direction="none">
              <div className="text-center space-y-3">
                <p className="text-xs font-semibold tracking-widest uppercase text-primary/70">How it works</p>
                <h2 className="text-3xl font-bold">From store to API in 3 steps</h2>
              </div>
            </BlurFade>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {steps.map(({ step, title, desc, imageLabel, tag }, i) => (
                <BlurFade
                  key={step}
                  triggerOnView
                  delay={i * 0.12}
                  yOffset={40}
                  direction={i === 0 ? "left" : i === 2 ? "right" : "up"}
                >
                  <div className="flex flex-col gap-5">
                    {/* ↓ Replace with: <Image src="/img/step-N.png" width={800} height={600} alt={title} className="w-full rounded-xl object-cover shadow-sm" /> */}
                    <TiltCard strength={6}>
                      <div className="aspect-[4/3] rounded-xl overflow-hidden border shadow-sm">
                        <ImageFrame label={imageLabel} tag={tag} />
                      </div>
                    </TiltCard>
                    <div>
                      <div className="flex items-baseline gap-2.5 mb-1.5">
                        <span className="text-xs font-bold tabular-nums text-primary/50">{step}</span>
                        <h3 className="font-semibold">{title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────── */}
        <section className="relative border-t overflow-hidden px-6 py-28 flex flex-col items-center text-center gap-5">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 60% at 50% 100%, oklch(0.852 0.199 91.936 / 0.07), transparent)" }}
          />
          <BlurFade triggerOnView direction="none">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
          </BlurFade>
          <BlurFade triggerOnView delay={0.08}>
            <p className="text-muted-foreground max-w-sm">
              Free to use. No credit card required. Set up your first JSON store in minutes.
            </p>
          </BlurFade>
          <BlurFade triggerOnView delay={0.16}>
            <div className="flex flex-wrap gap-3 justify-center">
              {isLoggedIn ? (
                <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>Go to Dashboard</Link>
              ) : (
                <>
                  <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>Get started free</Link>
                  <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>Sign in</Link>
                </>
              )}
            </div>
          </BlurFade>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────── */}
      <footer className="border-t px-6 py-5 flex items-center justify-between text-sm text-muted-foreground">
        <Logo />
        <p>© 2025 JSON Server</p>
      </footer>
    </div>
  )
}
