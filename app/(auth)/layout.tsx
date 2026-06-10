import { Logo } from "@/components/shared/logo"
import { BlurFade } from "@/components/shared/blur-fade"
import { Database, Key, ScrollText } from "lucide-react"

const features = [
  { icon: Database, text: "Create and manage JSON data stores" },
  { icon: Key, text: "Issue API keys with GET/PUT permissions" },
  { icon: ScrollText, text: "Track every request with access logs" },
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left branding panel — desktop only */}
      <div className="hidden flex-col justify-between bg-zinc-950 px-6 py-4.5 text-zinc-50 lg:flex">
        <Logo className="text-zinc-50" />

        <div className="space-y-8">
          <BlurFade delay={0.1}>
            <div className="space-y-3">
              <h2 className="text-3xl leading-snug font-bold">
                Your personal JSON storage API
              </h2>
              <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
                Store, manage, and serve JSON data with a simple REST API.
                Create stores, issue keys, and monitor usage — all in one place.
              </p>
            </div>
          </BlurFade>

          <div className="space-y-3">
            {features.map(({ icon: Icon, text }, i) => (
              <BlurFade key={text} delay={0.22 + i * 0.08}>
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                    <Icon className="size-4" />
                  </div>
                  {text}
                </div>
              </BlurFade>
            ))}
          </div>
        </div>

        <BlurFade delay={0.55}>
          <p className="text-xs text-zinc-700">© 2025 JSON Server</p>
        </BlurFade>
      </div>

      {/* Right form panel */}
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-6">
        <div className="w-full max-w-[420px] space-y-6">
          <BlurFade
            className="flex justify-center lg:hidden"
            duration={0.3}
            yOffset={0}
          >
            <Logo />
          </BlurFade>
          <BlurFade delay={0.12} yOffset={18}>
            {children}
          </BlurFade>
        </div>
      </div>
    </div>
  )
}
