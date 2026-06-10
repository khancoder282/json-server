"use client"
import { useActionState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { registerAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

type State = { success: boolean; error?: string; email?: string } | null

export function RegisterForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (_, formData) => {
      const result = await registerAction(formData)
      if (result.success && result.email) {
        router.push(`/verify-email?email=${encodeURIComponent(result.email)}`)
      }
      return result
    },
    null,
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="John Doe" required disabled={pending} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" required disabled={pending} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="Min. 8 characters" required minLength={8} disabled={pending} />
      </div>
      {state && !state.success && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  )
}
