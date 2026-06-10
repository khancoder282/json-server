import Link from "next/link"
import { auth } from "@/auth"
import { buttonVariants } from "@/components/ui/button"
import { Logo } from "@/components/shared/logo"
import { BlurFade } from "@/components/shared/blur-fade"
import { TiltCard } from "@/components/shared/tilt-card"
import { HeroBackground } from "@/components/shared/hero-background"
import { ThemedImage } from "@/components/shared/themed-image"
import { CoolMode } from "@/components/shared/cool-mode"
import { ScrollProgress } from "@/components/shared/scroll-progress"
import { ScreenshotCarousel } from "@/components/shared/screenshot-carousel"
import { cn } from "@/lib/utils"
import { signOutAction } from "@/lib/actions/auth"

const features = [
  {
    title: "JSON Stores",
    desc: "Create and manage JSON data stores with a built-in code editor. Toggle public or private visibility per store.",
    light: "frame-6-json-editor-light.webp",
    dark: "frame-6-json-editor-dark.webp",
    alt: "JSON Store editor",
  },
  {
    title: "API Keys",
    desc: "Issue scoped API keys with granular GET/PUT permissions, linked to specific JSON stores.",
    light: "frame-7-keys-light.webp",
    dark: "frame-7-keys-dark.webp",
    alt: "API key management",
  },
  {
    title: "Access Logs",
    desc: "Track every API call with detailed logs — IP, user agent, request and response bodies.",
    light: "frame-8-logs-light.webp",
    dark: "frame-8-logs-dark.webp",
    alt: "Access logs",
  },
]

const steps = [
  {
    step: "01",
    title: "Create a JSON Store",
    desc: "Use the built-in code editor to define your JSON structure. Toggle public or private visibility.",
    light: "frame-9-create-store-light.webp",
    dark: "frame-9-create-store-dark.webp",
    alt: "Create JSON store",
  },
  {
    step: "02",
    title: "Generate an API Key",
    desc: "Issue a scoped key with GET or PUT permissions and link it to the stores you want to expose.",
    light: "frame-10-keys-light.webp",
    dark: "frame-10-keys-dark.webp",
    alt: "Generate API key",
  },
  {
    step: "03",
    title: "Integrate anywhere",
    desc: "Call GET /api/json/{id} from any app. Use PUT to deep-merge updates into your store.",
    light: "frame-11-integration-light.webp",
    dark: "frame-11-integration-dark.webp",
    alt: "API integration",
  },
]

export default async function HomePage() {
  const session = await auth()
  const isLoggedIn = !!session?.user

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgress />
      {/* ── Header ─────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur-md">
        <Logo />
        <div className="flex gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" })
                )}
              >
                Dashboard
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" })
                )}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        {/* ── Hero ───────────────────────────────── */}
        <section className="relative flex flex-col items-center gap-6 overflow-hidden px-6 pt-24 pb-20 text-center">
          <HeroBackground />

          <BlurFade delay={0.05} direction="none">
            <div className="relative inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              Simple · Reliable · Fast
            </div>
          </BlurFade>

          <BlurFade delay={0.18} yOffset={28}>
            <h1 className="relative max-w-2xl text-5xl leading-tight font-bold tracking-tight md:text-6xl">
              Your personal{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, oklch(0.852 0.199 91.936), oklch(0.681 0.162 75.834), oklch(0.852 0.199 91.936))",
                  backgroundSize: "200% auto",
                  animation: "gradient-pan 6s linear infinite",
                }}
              >
                JSON storage
              </span>{" "}
              API
            </h1>
          </BlurFade>

          <BlurFade delay={0.32} yOffset={22}>
            <p className="relative max-w-xl text-lg leading-relaxed text-muted-foreground">
              Store, manage, and serve JSON data with a simple REST API. Create
              stores, issue API keys, and track usage — all in one place.
            </p>
          </BlurFade>

          <BlurFade delay={0.44}>
            <div className="relative flex flex-wrap justify-center gap-3">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <CoolMode>
                  <Link
                    href="/register"
                    className={cn(buttonVariants({ size: "lg" }))}
                  >
                    Get started free
                  </Link>
                </CoolMode>
              )}
            </div>
          </BlurFade>

          {/* ── Hero image ── */}
          <BlurFade
            delay={0.58}
            yOffset={36}
            className="relative mt-4 w-full max-w-4xl"
          >
            <TiltCard strength={4} className="w-full">
              <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-black/15">
                {/* Browser chrome */}
                <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-3">
                  <div className="flex shrink-0 gap-1.5">
                    <div className="size-3 rounded-full bg-red-400/80" />
                    <div className="size-3 rounded-full bg-yellow-400/80" />
                    <div className="size-3 rounded-full bg-green-400/80" />
                  </div>
                  <div className="mx-auto max-w-xs flex-1 rounded-md bg-background/70 px-3 py-1 text-center font-mono text-xs text-muted-foreground">
                    app.json-server.com/dashboard
                  </div>
                </div>
                <div className="relative aspect-[16/9]">
                  <ThemedImage
                    lightSrc="/screenshots/frame-1-hero-light.webp"
                    darkSrc="/screenshots/frame-1-hero-dark.webp"
                    alt="JSON Server dashboard"
                    fill
                    priority
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 896px"
                  />
                </div>
              </div>
            </TiltCard>
          </BlurFade>
        </section>

        {/* ── Carousel ───────────────────────────── */}
        <section className="border-t px-6 py-24">
          <div className="mx-auto max-w-4xl space-y-10">
            <BlurFade triggerOnView direction="none">
              <div className="space-y-2 text-center">
                <p className="text-xs font-semibold tracking-widest text-primary/70 uppercase">
                  Tour
                </p>
                <h2 className="text-3xl font-bold">See it in action</h2>
                <p className="text-muted-foreground">
                  Browse every section of the dashboard.
                </p>
              </div>
            </BlurFade>
            <BlurFade triggerOnView delay={0.1} yOffset={28}>
              <ScreenshotCarousel />
            </BlurFade>
          </div>
        </section>

        {/* ── Features ───────────────────────────── */}
        <section className="border-t bg-muted/20 px-6 py-28">
          <div className="mx-auto max-w-5xl space-y-16">
            <BlurFade triggerOnView direction="none" delay={0.5} duration={1}>
              <div className="space-y-3 text-center">
                <p className="text-xs font-semibold tracking-widest text-primary/70 uppercase">
                  Features
                </p>
                <h2 className="text-3xl font-bold">
                  Everything you need to manage JSON data
                </h2>
                <p className="mx-auto max-w-md text-muted-foreground">
                  A complete toolkit for storing, securing, and serving JSON
                  data via REST.
                </p>
              </div>
            </BlurFade>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {features.map(({ title, desc, light, dark, alt }, i) => (
                <BlurFade
                  key={title}
                  triggerOnView
                  delay={i * 0.35}
                  yOffset={36}
                >
                  <TiltCard strength={8} className="h-full">
                    <div className="h-full overflow-hidden rounded-xl border bg-card transition-shadow duration-300 hover:shadow-xl">
                      <div className="relative aspect-video overflow-hidden border-b">
                        <div className="relative h-full w-full origin-top-left scale-[1.5]">
                          <ThemedImage
                            lightSrc={`/screenshots/${light}`}
                            darkSrc={`/screenshots/${dark}`}
                            alt={alt}
                            fill
                            className="object-cover object-left-top"
                            sizes="(max-width: 768px) 100vw, 340px"
                          />
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold">{title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {desc}
                        </p>
                      </div>
                    </div>
                  </TiltCard>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────── */}
        <section className="px-6 py-28">
          <div className="mx-auto max-w-5xl space-y-16">
            <BlurFade triggerOnView direction="none">
              <div className="space-y-3 text-center">
                <p className="text-xs font-semibold tracking-widest text-primary/70 uppercase">
                  How it works
                </p>
                <h2 className="text-3xl font-bold">
                  From store to API in 3 steps
                </h2>
              </div>
            </BlurFade>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              {steps.map(({ step, title, desc, light, dark, alt }, i) => (
                <BlurFade
                  key={step}
                  triggerOnView
                  delay={i * 0.35}
                  yOffset={44}
                  direction={i === 0 ? "left" : i === 2 ? "right" : "up"}
                >
                  <div className="flex flex-col gap-5">
                    <TiltCard strength={6}>
                      <div className="relative aspect-video overflow-hidden rounded-xl border shadow-sm">
                        {/* scale-[1.5] origin-top-left → chỉ hiện 2/3 góc trên bên trái */}
                        <div className="relative h-full w-full origin-top-left scale-[1.5]">
                          <ThemedImage
                            lightSrc={`/screenshots/${light}`}
                            darkSrc={`/screenshots/${dark}`}
                            alt={alt}
                            fill
                            className="object-cover object-top-left"
                            sizes="(max-width: 768px) 100vw, 340px"
                          />
                        </div>
                      </div>
                    </TiltCard>
                    <div>
                      <div className="mb-1.5 flex items-baseline gap-2.5">
                        <span className="text-xs font-bold text-primary/50 tabular-nums">
                          {step}
                        </span>
                        <h3 className="font-semibold">{title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {desc}
                      </p>
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────── */}
        <section className="relative flex flex-col items-center gap-5 overflow-hidden border-t px-6 py-28 text-center">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 50% 100%, oklch(0.852 0.199 91.936 / 0.07), transparent)",
            }}
          />
          <BlurFade triggerOnView direction="none">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
          </BlurFade>
          <BlurFade triggerOnView delay={0.08}>
            <p className="max-w-sm text-muted-foreground">
              Free to use. No credit card required. Set up your first JSON store
              in minutes.
            </p>
          </BlurFade>
          <BlurFade triggerOnView delay={0.16}>
            <div className="flex flex-wrap justify-center gap-3">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <CoolMode>
                  <Link
                    href="/register"
                    className={cn(buttonVariants({ size: "lg" }))}
                  >
                    Get started free
                  </Link>
                </CoolMode>
              )}
            </div>
          </BlurFade>
        </section>

        {/* ── About / Educational ────────────────── */}
        <section className="border-t px-6 py-24">
          <div className="max-w-5xl mx-auto space-y-16">

            {/* heading */}
            <BlurFade triggerOnView direction="none">
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3.5 py-1 text-xs font-medium text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary/60" />
                  Educational Project
                </div>
                <h2 className="text-3xl font-bold">Built for learning</h2>
                <p className="text-muted-foreground leading-relaxed">
                  JSON Server is a hands-on project designed to demonstrate the architecture of a modern, production-grade full-stack web application — from authentication and data modeling to API design and access control.
                </p>
              </div>
            </BlurFade>

            {/* concepts grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  num: "01",
                  title: "REST API Design",
                  body: "Learn how to structure a clean REST API with proper HTTP methods, status codes, and JSON response formats. Practice GET and PUT endpoints with deep-merge logic.",
                },
                {
                  num: "02",
                  title: "Authentication Flows",
                  body: "Explore a complete auth system — user registration, email verification via Resend, credential login with NextAuth v5, and session-protected routes using middleware.",
                },
                {
                  num: "03",
                  title: "Access Control",
                  body: "Understand API key management: generating scoped keys, linking them to specific resources, and enforcing GET/PUT permissions per request at the API layer.",
                },
                {
                  num: "04",
                  title: "Database & ORM",
                  body: "Practice schema design with Drizzle ORM and MySQL — relationships, migrations, and efficient queries using a type-safe ORM in a TypeScript codebase.",
                },
                {
                  num: "05",
                  title: "Server Components",
                  body: "Discover Next.js 15 App Router patterns: Server Components for data fetching, Server Actions for mutations, and how to mix server and client rendering efficiently.",
                },
                {
                  num: "06",
                  title: "Audit & Observability",
                  body: "See how every API call can be logged with metadata — IP, user agent, request/response body — and how to build a filterable, paginated log viewer on top of that data.",
                },
              ].map(({ num, title, body }, i) => (
                <BlurFade key={num} triggerOnView delay={i * 0.07} yOffset={24}>
                  <div className="group rounded-xl border bg-card p-6 h-full transition-shadow duration-300 hover:shadow-md">
                    <span className="text-xs font-bold tabular-nums text-primary/50">{num}</span>
                    <h3 className="mt-2 font-semibold">{title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                </BlurFade>
              ))}
            </div>

            {/* tech stack */}
            <BlurFade triggerOnView direction="none">
              <div className="space-y-5 text-center">
                <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/60">
                  Tech stack
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "Next.js 15", "React 19", "TypeScript",
                    "Tailwind CSS v4", "shadcn/ui",
                    "Drizzle ORM", "MySQL",
                    "NextAuth v5", "Resend",
                    "Bun", "Motion",
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border bg-muted/40 px-3.5 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </BlurFade>

          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────── */}
      <footer className="flex items-center justify-between border-t px-6 py-5 text-sm text-muted-foreground">
        <Logo />
        <p>© 2025 JSON Server</p>
      </footer>
    </div>
  )
}
