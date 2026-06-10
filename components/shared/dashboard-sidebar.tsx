"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTransition } from "react"
import { useSession } from "next-auth/react"
import { useTheme } from "@/components/theme-provider"
import { signOutAction } from "@/lib/actions/auth"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Monitor, Moon, Sun } from "lucide-react"

const nav = [
  { label: "Overview", href: "/dashboard" },
  { label: "JSON Management", href: "/dashboard/json" },
  { label: "Key Management", href: "/dashboard/keys" },
  { label: "Log Management", href: "/dashboard/logs" },
  { label: "Profile", href: "/dashboard/profile" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user
  const [pending, startTransition] = useTransition()
  const { theme, setTheme } = useTheme()

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction()
    })
  }

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
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                ? "bg-muted text-foreground"
                : "text-foreground/50 hover:text-foreground hover:bg-muted/50",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-3 border-t">
        <div className="flex items-center gap-2 px-2 py-2 mb-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-none truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {theme === "dark" ? (
                    <Moon className="size-4" />
                  ) : theme === "light" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Monitor className="size-4" />
                  )}
                </Button>
              }
            />
            <DropdownMenuContent align="start" side="top">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="size-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="size-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="size-4" /> System
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 text-muted-foreground hover:text-foreground"
            disabled={pending}
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
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
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
              ? "text-primary"
              : "text-muted-foreground",
          )}
        >
          {item.label === "Overview"
            ? "Home"
            : item.label === "Profile"
            ? "Profile"
            : item.label.split(" ")[0]}
        </Link>
      ))}
    </nav>
  )
}
