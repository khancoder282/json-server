"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTransition } from "react"
import { signOutAction } from "@/lib/actions/auth"
import { cn } from "@/lib/utils"
import { LogOut, Palette, KeyRound, User } from "lucide-react"

const items = [
  { label: "Profile", href: "/dashboard/settings/profile", icon: User },
  { label: "Password", href: "/dashboard/settings/password", icon: KeyRound },
  { label: "Theme", href: "/dashboard/settings/theme", icon: Palette },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction()
    })
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account</p>
      </div>
      <div className="flex gap-8">
        <nav className="w-44 shrink-0 flex flex-col gap-0.5">
          {items.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            disabled={pending}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-left disabled:opacity-50 mt-1"
          >
            <LogOut className="size-4 shrink-0" />
            {pending ? "Signing out…" : "Sign out"}
          </button>
        </nav>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
