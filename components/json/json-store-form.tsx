"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useTheme } from "@/components/theme-provider"
import { json } from "@codemirror/lang-json"
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode"
import { type JsonStore } from "@/lib/db/schema"
import {
  createJsonStoreAction,
  updateJsonStoreAction,
} from "@/lib/actions/json-stores"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
})

const DEFAULT_JSON = `{}`

interface Props {
  store?: JsonStore
}

export function JsonStoreForm({ store }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [content, setContent] = useState(
    JSON.stringify(JSON.parse(store?.content ?? DEFAULT_JSON), null, 2)
  )
  const [isPublic, setIsPublic] = useState(store?.isPublic ?? false)
  const [error, setError] = useState("")
  const { resolvedTheme } = useTheme()

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <Switch
          id="isPublic"
          checked={isPublic}
          onCheckedChange={setIsPublic}
          disabled={pending}
        />
        <Label htmlFor="isPublic">
          {isPublic
            ? "Public — accessible without an API key"
            : "Private — requires an API key"}
        </Label>
      </div>

      <div className="grid gap-1.5">
        <Label>JSON Content</Label>
        <CodeMirror
          value={content}
          height="60dvh"
          extensions={[json()]}
          theme={resolvedTheme === "dark" ? vscodeDark : vscodeLight}
          onChange={(v) => setContent(v)}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            tabSize: 2,
          }}
          className={cn("overflow-auto rounded-lg border", {
            "border-destructive": error,
          })}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="w-full sm:w-fit">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {pending
            ? "Saving…"
            : store
              ? "Update json store"
              : "Create json store"}
        </Button>
      </div>
    </form>
  )
}
