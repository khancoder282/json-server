"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTransition } from "react"
import { signOutAction } from "@/lib/actions/auth"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { cn } from "@/lib/utils"
import { LogOut, Palette, KeyRound, TriangleAlert, User } from "lucide-react"

const items = [
  { label: "Profile", href: "/dashboard/settings/profile", icon: User },
  { label: "Password", href: "/dashboard/settings/password", icon: KeyRound },
  { label: "Theme", href: "/dashboard/settings/theme", icon: Palette },
  {
    label: "Danger Zone",
    href: "/dashboard/settings/danger",
    icon: TriangleAlert,
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction()
    })
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account</p>
      </div>
      <div className="flex flex-col gap-8 sm:flex-row">
        <nav className="flex w-full shrink-0 flex-col gap-2 border-b pb-6 sm:w-45 sm:border-none">
          {items.map(({ label, href, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            )
          })}
          <ConfirmDialog
            trigger={
              <button
                disabled={pending}
                className="mt-1 flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                <LogOut className="size-4 shrink-0" />
                {pending ? "Signing out…" : "Sign out"}
              </button>
            }
            title="Sign out?"
            description="You'll need to sign in again to access your dashboard."
            onConfirm={handleSignOut}
            loading={pending}
            textConfirm="Sign out"
          />
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
