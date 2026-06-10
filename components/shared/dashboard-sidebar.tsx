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
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
                ? "bg-muted text-foreground"
                : "text-foreground/50 hover:text-foreground hover:bg-muted/50",
            )}
          >
            {item.label}
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

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex-1 py-3 text-center text-xs font-medium transition-colors",
            pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
              ? "text-primary"
              : "text-muted-foreground",
          )}
        >
          {item.label === "Overview"
            ? "Home"
            : item.label === "Settings"
            ? "Settings"
            : item.label.split(" ")[0]}
        </Link>
      ))}
    </nav>
  )
}
