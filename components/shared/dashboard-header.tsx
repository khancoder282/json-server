"use client"
import { useTransition } from "react"
import { useTheme } from "@/components/theme-provider"
import { signOutAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, Monitor, Moon, Sun } from "lucide-react"

export function DashboardHeader() {
  const [pending, startTransition] = useTransition()
  const { theme, setTheme } = useTheme()

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction()
    })
  }

  return (
    <header className="flex items-center justify-end gap-2 border-b bg-background px-4 py-3 md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="sm">
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
        <DropdownMenuContent align="end">
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
      <ConfirmDialog
        trigger={
          <Button variant="outline" size="sm" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? "Signing out…" : "Sign out"}
          </Button>
        }
        title="Sign out?"
        description="You'll need to sign in again to access your dashboard."
        onConfirm={handleSignOut}
        loading={pending}
        textConfirm="Sign out"
      />
    </header>
  )
}
