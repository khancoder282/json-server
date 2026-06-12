"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import {
  Database,
  FlaskConical,
  Key,
  LayoutDashboard,
  ScrollText,
  Settings,
} from "lucide-react"

interface NavEntry {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const nav: NavEntry[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "JSON Management", href: "/dashboard/json", icon: Database },
  { label: "Key Management", href: "/dashboard/keys", icon: Key },
  { label: "Playground", href: "/dashboard/playground", icon: FlaskConical },
  { label: "Log Management", href: "/dashboard/logs", icon: ScrollText },
]

// Pinned to the bottom of the menu, separate from the main group.
const settingsItem: NavEntry = {
  label: "Settings",
  href: "/dashboard/settings",
  icon: Settings,
}

function NavItem({ item, pathname }: { item: NavEntry; pathname: string }) {
  const { label, href, icon: Icon } = item
  const isActive =
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "text-foreground"
          : "text-foreground/50 hover:text-foreground"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="absolute inset-0 rounded-md bg-muted"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <Icon className="relative z-10 size-4 shrink-0" />
      <span className="relative z-10">{label}</span>
    </Link>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user

  return (
    <aside className="hidden h-full min-h-screen border-r bg-background md:flex md:w-56 md:shrink-0 md:flex-col">
      <div className="px-6 py-4.5">
        <Logo />
      </div>
      <nav className="flex flex-col gap-1 p-3">
        <p className="px-3 pb-1 text-xs font-semibold tracking-wider text-muted-foreground/60 uppercase">
          Menu
        </p>
        {nav.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="mt-auto">
        <nav className="flex flex-col gap-1 p-3">
          <NavItem item={settingsItem} pathname={pathname} />
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm leading-none font-medium">
                {user?.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

const mobileNav: NavEntry[] = [...nav, settingsItem]

const mobileLabel: Record<string, string> = {
  Overview: "Home",
  "JSON Management": "JSON",
  "Key Management": "Keys",
  "Log Management": "Logs",
  Playground: "Play",
  Settings: "Settings",
}

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed right-0 bottom-0 left-0 flex border-t bg-background md:hidden">
      {mobileNav.map(({ label, href, icon: Icon }) => {
        const active =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground"
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
