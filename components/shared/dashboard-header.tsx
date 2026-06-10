import { signOutAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { auth } from "@/auth"

export async function DashboardHeader() {
  const session = await auth()
  const user = session?.user

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
      <form action={signOutAction}>
        <Button type="submit" variant="outline" size="sm">
          Sign out
        </Button>
      </form>
    </header>
  )
}
