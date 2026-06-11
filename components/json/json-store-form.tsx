"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useTheme } from "@/components/theme-provider"
import { type JsonStore } from "@/lib/db/schema"
import {
  createJsonStoreAction,
  updateJsonStoreAction,
} from "@/lib/actions/json-stores"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Phase 1 skeleton — shown while the JS chunk containing Monaco is downloading
function EditorSkeleton() {
  return (
    <div className="flex h-full flex-col gap-2 rounded-lg border p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 rounded"
          style={{ width: `${[60, 80, 72, 55, 90, 65, 78, 50][i]}%` }}
        />
      ))}
    </div>
  )
}

// Dynamically imported so Monaco never runs on the server
const MonacoJsonEditor = dynamic(
  () =>
    import("@/components/json/monaco-json-editor").then(
      (m) => m.MonacoJsonEditor
    ),
  { ssr: false, loading: () => <EditorSkeleton /> }
)

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
  const [syntaxError, setSyntaxError] = useState("")
  const { resolvedTheme } = useTheme()

  const monacoTheme = resolvedTheme === "dark" ? "dracula" : "vs"

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (syntaxError) {
      setError(`JSON syntax error: ${syntaxError}`)
      return
    }

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

  const displayError = error || syntaxError

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col"
      style={{ height: "calc(100vh - 11rem)" }}
    >
      <MonacoJsonEditor
        value={content}
        onChange={setContent}
        onSyntaxError={setSyntaxError}
        monacoTheme={monacoTheme}
        height="100%"
        paddingTop={12}
        paddingBottom={12}
        className="flex-1 rounded-b-none border-b-0"
      />

      {/* Toolbar attached as footer — no overlay, no z-index conflict */}
      <div className="flex shrink-0 items-center justify-between gap-3 rounded-b-lg border border-t-0 bg-background px-3 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <Switch
            id="isPublic"
            checked={isPublic}
            onCheckedChange={setIsPublic}
            disabled={pending}
          />
          <Label htmlFor="isPublic" className="cursor-pointer truncate text-sm">
            {isPublic ? "Public" : "Private"}
          </Label>
          {displayError && (
            <p className="truncate text-xs text-destructive">{displayError}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={pending || !!syntaxError}
          size="sm"
          className="shrink-0"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? "Saving…" : store ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  )
}
