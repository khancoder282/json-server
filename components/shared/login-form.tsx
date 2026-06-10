"use client"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { loginAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type State = { success: boolean; error?: string; email?: string } | null

export function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState<State, FormData>(
    async (_, formData) => {
      const result = await loginAction(formData)
      if (!result.success && result.error === "EMAIL_NOT_VERIFIED" && result.email) {
        router.push(`/verify-email?email=${encodeURIComponent(result.email)}`)
        return result
      }
      if (result.success) {
        await signIn("credentials", {
          email: formData.get("email"),
          password: formData.get("password"),
          callbackUrl: "/dashboard",
        })
      }
      return result
    },
    null,
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {state && !state.success && state.error !== "EMAIL_NOT_VERIFIED" && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" className="w-full">
        Sign in
      </Button>
    </form>
  )
}
