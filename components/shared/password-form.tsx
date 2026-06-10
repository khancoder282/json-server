"use client"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { updatePasswordAction } from "@/lib/actions/profile"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Loader2 } from "lucide-react"

export function PasswordForm() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    const form = e.currentTarget
    const formData = new FormData(form)
    startTransition(async () => {
      const result = await updatePasswordAction(formData)
      if (result.success) {
        toast.success("Password updated.")
        form.reset()
      } else {
        setError(result.error ?? "Something went wrong")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <PasswordInput id="currentPassword" name="currentPassword" required disabled={pending} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <PasswordInput id="newPassword" name="newPassword" required disabled={pending} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput id="confirmPassword" name="confirmPassword" required disabled={pending} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  )
}
