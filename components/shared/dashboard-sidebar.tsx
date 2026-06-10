"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import { Database, Key, LayoutDashboard, ScrollText, Settings } from "lucide-react"

const nav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "JSON Management", href: "/dashboard/json", icon: Database },
  { label: "Key Management", href: "/dashboard/keys", icon: Key },
  { label: "Log Management", href: "/dashboard/logs", icon: ScrollText },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user

  return (
    <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 border-r bg-background h-full min-h-screen">
      <div className="p-4">
        <Logo />
      </div>
      <nav className="flex flex-col gap-1 p-3">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
          Menu
        </p>
        {nav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === href ||
                (href !== "/dashboard" && pathname.startsWith(href))
                ? "bg-muted text-foreground"
                : "text-foreground/50 hover:text-foreground hover:bg-muted/50",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-none truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

const mobileLabel: Record<string, string> = {
  "Overview": "Home",
  "JSON Management": "JSON",
  "Key Management": "Keys",
  "Log Management": "Logs",
  "Settings": "Settings",
}

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex">
      {nav.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
            {mobileLabel[label]}
          </Link>
        )
      })}
    </nav>
  )
}
