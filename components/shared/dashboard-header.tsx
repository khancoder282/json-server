"use client"
import { useTransition } from "react"
import { signOutAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"

export function DashboardHeader() {
  const { data: session } = useSession()
  const user = session?.user
  const [pending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction()
    })
  }

  return (
    <header className="border-b bg-background px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
          {user?.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium leading-none">{user?.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" disabled={pending} onClick={handleSignOut}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {pending ? "Signing out…" : "Sign out"}
      </Button>
    </header>
  )
}
