"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"

const nav = [
  { label: "Overview", href: "/dashboard" },
  { label: "JSON Management", href: "/dashboard/json" },
  { label: "Key Management", href: "/dashboard/keys" },
  { label: "Log Management", href: "/dashboard/logs" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 border-r bg-background h-full min-h-screen">
      <div className="p-4 border-b">
        <Logo />
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
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
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
              ? "text-primary"
              : "text-muted-foreground",
          )}
        >
          {item.label === "Overview" ? "Home" : item.label.split(" ")[0]}
        </Link>
      ))}
    </nav>
  )
}
