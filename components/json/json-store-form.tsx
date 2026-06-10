"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { type JsonStore } from "@/lib/db/schema"
import { createJsonStoreAction, updateJsonStoreAction } from "@/lib/actions/json-stores"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

const DEFAULT_JSON = `{
  "example": "value"
}`

interface Props {
  store?: JsonStore
}

export function JsonStoreForm({ store }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [content, setContent] = useState(store?.content ?? DEFAULT_JSON)
  const [isPublic, setIsPublic] = useState(store?.isPublic ?? false)
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    try {
      JSON.parse(content)
    } catch {
      setError("Invalid JSON: please fix before saving")
      return
    }

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set("content", content)
    formData.set("isPublic", String(isPublic))

    startTransition(async () => {
      const result = store
        ? await updateJsonStoreAction(store.id, formData)
        : await createJsonStoreAction(formData)

      if (result.success) {
        router.push("/dashboard/json")
      } else {
        setError(result.error ?? "Something went wrong")
      }
    })
  }

  function handleFormat() {
    try {
      setContent(JSON.stringify(JSON.parse(content), null, 2))
    } catch {
      setError("Cannot format: invalid JSON")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={store?.name} placeholder="My JSON Store" required disabled={pending} />
      </div>

      <div className="flex items-center gap-3">
        <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} disabled={pending} />
        <Label htmlFor="isPublic">
          {isPublic ? "Public — accessible without an API key" : "Private — requires an API key"}
        </Label>
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label>JSON Content</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleFormat} disabled={pending}>
            Format
          </Button>
        </div>
        <Card>
          <CardContent className="p-0 overflow-hidden rounded-md">
            <MonacoEditor
              height="400px"
              language="json"
              value={content}
              onChange={(v) => setContent(v ?? "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                tabSize: 2,
                wordWrap: "on",
                scrollBeyondLastLine: false,
              }}
            />
          </CardContent>
        </Card>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {pending ? "Saving…" : store ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={() => router.push("/dashboard/json")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
