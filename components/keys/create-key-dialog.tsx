"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { type JsonStore } from "@/lib/db/schema"
import { createApiKeyAction } from "@/lib/actions/api-keys"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Plus } from "lucide-react"
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
    setTimeout(() => {
      setCopied(false)
      setOpen(false)
    }, 2000)
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Create New Key
      </Button>
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
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-hidden rounded bg-muted px-1">
                  {newKey}
                </code>
                <Button onClick={handleCopy}>
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      name="perm_get"
                      value="get"
                      id="perm-get"
                      disabled={pending}
                    />
                    <span className="text-sm">GET</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      name="perm_put"
                      value="put"
                      id="perm-put"
                      disabled={pending}
                    />
                    <span className="text-sm">PUT</span>
                  </label>
                </div>
              </div>

              {stores.length > 0 && (
                <div className="space-y-2">
                  <Label>Link to JSON Stores</Label>
                  <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-2">
                    {stores.map((s) => (
                      <label
                        key={s.id}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Checkbox
                          name="storeIds"
                          value={s.id}
                          disabled={pending}
                        />
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
