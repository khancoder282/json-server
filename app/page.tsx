import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Logo } from "@/components/shared/logo"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex gap-3">
          <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Sign in
          </Link>
          <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
            Get started
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center text-center p-8 gap-6">
        <h1 className="text-4xl font-bold tracking-tight">Your personal JSON storage API</h1>
        <p className="max-w-lg text-muted-foreground text-lg">
          Store, manage, and serve JSON data with a simple REST API. Create stores, issue API keys, and track usage — all in one place.
        </p>
        <div className="flex gap-4">
          <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
            Get started free
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Sign in
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl text-left">
          {[
            { title: "JSON Stores", desc: "Create and manage JSON data stores with a Monaco editor" },
            { title: "API Keys", desc: "Issue scoped API keys with GET/PUT permissions" },
            { title: "Access Logs", desc: "Track every API call with detailed logs" },
          ].map((f) => (
            <div key={f.title} className="border rounded-lg p-4">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
