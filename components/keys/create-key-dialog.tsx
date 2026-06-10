"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { type JsonStore } from "@/lib/db/schema"
import { createApiKeyAction } from "@/lib/actions/api-keys"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Props {
  stores: JsonStore[]
}

export function CreateKeyDialog({ stores }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [newKey, setNewKey] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createApiKeyAction(formData)
      if (result.success && result.key) {
        setNewKey(result.key)
        router.refresh()
      } else {
        setError(result.error ?? "Failed to create key")
      }
    })
  }

  function handleCopy() {
    navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClose() {
    setOpen(false)
    setNewKey("")
    setError("")
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create New Key</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>

          {newKey ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Copy your API key now — it will not be shown again.
              </p>
              <div className="flex gap-2">
                <code className="flex-1 bg-muted p-2 rounded text-xs break-all">{newKey}</code>
                <Button size="sm" onClick={handleCopy}>
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="key-name">Key Name</Label>
                <Input id="key-name" name="name" placeholder="My API Key" required disabled={pending} />
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox name="perm_get" value="get" id="perm-get" disabled={pending} />
                    <span className="text-sm">GET</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox name="perm_put" value="put" id="perm-put" disabled={pending} />
                    <span className="text-sm">PUT</span>
                  </label>
                </div>
              </div>

              {stores.length > 0 && (
                <div className="space-y-2">
                  <Label>Link to JSON Stores</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                    {stores.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox name="storeIds" value={s.id} disabled={pending} />
                        <span className="text-sm">{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" disabled={pending} className="w-full">
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {pending ? "Creating…" : "Create Key"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
