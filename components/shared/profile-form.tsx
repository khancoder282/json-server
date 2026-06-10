"use client"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { updateProfileAction } from "@/lib/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function ProfileForm({ name }: { name: string }) {
  const [pending, startTransition] = useTransition()
  const [value, setValue] = useState(name)
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfileAction(formData)
      if (result.success) toast.success("Profile updated.")
      else setError(result.error ?? "Something went wrong")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          disabled={pending}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  )
}
