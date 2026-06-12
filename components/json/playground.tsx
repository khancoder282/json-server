"use client"
import { useState, useTransition, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type JsonStore } from "@/lib/db/schema"
import { updateJsonStoreAction } from "@/lib/actions/json-stores"
import {
  ApiKeyCombobox,
  type KeyItem,
} from "@/components/json/api-key-combobox"
import { StoreCombobox } from "@/components/json/store-combobox"
import { useTheme } from "@/components/theme-provider"
import { Skeleton } from "@/components/ui/skeleton"

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

const MonacoJsonEditor = dynamic(
  () =>
    import("@/components/json/monaco-json-editor").then(
      (m) => m.MonacoJsonEditor
    ),
  { ssr: false, loading: () => <EditorSkeleton /> }
)
import { PlaygroundTourTrigger } from "@/components/json/playground-tour"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn, formatSize } from "@/lib/utils"
import { Check, Loader2, Send } from "lucide-react"

function validatePath(path: string): string | null {
  if (!path) return null
  const opens = (path.match(/\[/g) ?? []).length
  const closes = (path.match(/\]/g) ?? []).length
  if (opens !== closes) return "Unmatched bracket — every [ must have a closing ]"
  const badIndex = path.match(/\[([^\]]*[^\d\]][^\]]*)\]/)
  if (badIndex) return `Index must be a number, got [${badIndex[1]}]`
  if (path.startsWith(".")) return "Path cannot start with '.'"
  if (path.endsWith(".")) return "Path cannot end with '.'"
  if (/\.{2,}/.test(path)) return "Consecutive dots are not allowed"
  return null
}

interface StoreOption {
  id: string
  name: string
  isPublic: boolean
}

interface Props {
  store: JsonStore | null
  apiKeys: KeyItem[]
  stores: StoreOption[]
}

interface ApiResult {
  status: number
  ok: boolean
  body: string
}

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2)
}

// Vibrant status styling: green = success, blue = redirect,
// amber = client error, red = server error.
function statusMeta(status: number): {
  pill: string
  dot: string
  label: string
} {
  if (status >= 200 && status < 300)
    return { pill: "bg-green-600 text-white", dot: "bg-green-500", label: "OK" }
  if (status >= 300 && status < 400)
    return { pill: "bg-sky-600 text-white", dot: "bg-sky-500", label: "" }
  if (status >= 400 && status < 500) {
    const label =
      status === 400
        ? "Bad Request"
        : status === 401
          ? "Unauthorized"
          : status === 403
            ? "Forbidden"
            : status === 404
              ? "Not Found"
              : status === 429
                ? "Rate Limited"
                : ""
    return { pill: "bg-amber-500 text-white", dot: "bg-amber-500", label }
  }
  return {
    pill: "bg-red-600 text-white",
    dot: "bg-red-500",
    label: "Server Error",
  }
}

export function Playground({ store, apiKeys, stores }: Props) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const monacoTheme = resolvedTheme === "dark" ? "dracula" : "vs"

  // No auto-selection: the user must explicitly pick a key (keyChosen) before
  // the request builder is revealed.
  const [apiKey, setApiKey] = useState("")
  const [keyChosen, setKeyChosen] = useState(false)
  const [path, setPath] = useState("")
  const [pathError, setPathError] = useState<string | null>(null)
  const [putBody, setPutBody] = useState("{\n  \n}")
  const [serverContent, setServerContent] = useState(() =>
    store ? pretty(JSON.parse(store.content)) : ""
  )
  const [result, setResult] = useState<ApiResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [outputTab, setOutputTab] = useState<"response" | "current">("current")
  const [saving, startSaving] = useTransition()
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(
    null
  )
  const [serverSyntaxError, setServerSyntaxError] = useState("")

  useEffect(() => {
    if (!saveMsg) return
    const t = setTimeout(() => setSaveMsg(null), 3000)
    return () => clearTimeout(t)
  }, [saveMsg])

  const ready = !!store && keyChosen

  const getUrl = store
    ? `/api/json/${store.id}` +
      (path ? `?${new URLSearchParams({ path }).toString()}` : "")
    : ""
  const putUrl = store ? `/api/json/${store.id}` : ""

  function authHeaders(): HeadersInit {
    return apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
  }

  async function runRequest(fn: () => Promise<Response>) {
    setError("")
    setLoading(true)
    try {
      const res = await fn()
      const text = await res.text()
      let body = text
      try {
        body = pretty(JSON.parse(text))
      } catch {
        // leave as raw text if not JSON
      }
      setResult({ status: res.status, ok: res.ok, body })
      setOutputTab("response") // jump to the Response tab to show the result
      return res.ok ? body : null
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed")
      return null
    } finally {
      setLoading(false)
    }
  }

  function sendGet() {
    if (!store) return
    runRequest(() => fetch(getUrl, { headers: authHeaders() }))
  }

  function sendPut() {
    if (!store) return
    try {
      JSON.parse(putBody)
    } catch {
      setError("Request body is not valid JSON")
      return
    }
    runRequest(async () => {
      const res = await fetch(putUrl, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: putBody,
      })
      // On success the API returns the full merged content — reflect it.
      if (res.ok) {
        const clone = res.clone()
        try {
          setServerContent(pretty(await clone.json()))
        } catch {
          /* ignore */
        }
      }
      return res
    })
  }

  async function refreshServer() {
    if (!store) return
    setError("")
    setSaveMsg(null)
    try {
      const res = await fetch(`/api/json/${store.id}`, {
        headers: authHeaders(),
      })
      if (res.ok) setServerContent(pretty(await res.json()))
    } catch {
      /* ignore */
    }
  }

  // Overwrites the whole content via the dashboard action (not the merge API).
  function saveServer() {
    if (!store) return
    setSaveMsg(null)
    try {
      JSON.parse(serverContent)
    } catch {
      setSaveMsg({ ok: false, text: "Invalid JSON" })
      return
    }
    startSaving(async () => {
      const formData = new FormData()
      formData.set("content", serverContent)
      formData.set("isPublic", String(store.isPublic))
      const res = await updateJsonStoreAction(store.id, formData)
      setSaveMsg(
        res.success
          ? { ok: true, text: "Saved" }
          : { ok: false, text: res.error ?? "Save failed" }
      )
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_24rem]">
      {/* ── LEFT: output ──────────────────────────────── */}
      {ready ? (
        <Tabs
          data-tour="output-panel"
          value={outputTab}
          onValueChange={(v) => setOutputTab(v as "response" | "current")}
          className="h-fit"
        >
          <div className="flex items-center justify-between gap-2">
            <TabsList>
              <TabsTrigger value="response">
                Response
                {result && (
                  <span
                    className={cn(
                      "ml-1.5 size-2 rounded-full",
                      statusMeta(result.status).dot
                    )}
                  />
                )}
              </TabsTrigger>
              <TabsTrigger value="current">Current JSON</TabsTrigger>
            </TabsList>

            {outputTab === "response" && result && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatSize(result.body)}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums shadow-sm",
                    statusMeta(result.status).pill
                  )}
                >
                  {result.status} {statusMeta(result.status).label}
                </span>
              </div>
            )}
          </div>

          {/* Response */}
          <TabsContent
            value="response"
            className="pt-2 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200"
          >
            {result ? (
              <MonacoJsonEditor
                value={result.body}
                readOnly
                monacoTheme={monacoTheme}
                height="60dvh"
              />
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border text-sm text-muted-foreground">
                Send a request to see the response.
              </div>
            )}
          </TabsContent>

          {/* Current JSON on server */}
          <TabsContent
            value="current"
            className="pt-2 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200"
          >
            <div className="flex flex-col" style={{ height: "60dvh" }}>
              <MonacoJsonEditor
                value={serverContent}
                onChange={setServerContent}
                onSyntaxError={setServerSyntaxError}
                monacoTheme={monacoTheme}
                className="flex-1 min-h-0 rounded-b-none border-b-0"
              />
              <div className="flex shrink-0 items-center justify-between rounded-b-lg border border-t-0 bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  Replaces whole content (not a merge)
                </p>
                <div className="flex items-center gap-2">
                  {saveMsg && (
                    <span
                      className={cn(
                        "text-xs",
                        saveMsg.ok ? "text-green-600" : "text-destructive"
                      )}
                    >
                      {saveMsg.text}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshServer}
                    disabled={saving}
                  >
                    Refresh
                  </Button>
                  <Button size="sm" onClick={saveServer} disabled={saving || !!serverSyntaxError}>
                    {saving && <Loader2 className="size-4 animate-spin" />}
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div
          data-tour="output-panel"
          className="flex items-center justify-center rounded-lg border py-12 text-center text-sm text-muted-foreground"
        >
          {!store
            ? "Select a JSON store to begin."
            : "Choose an API key to start sending requests."}
        </div>
      )}

      {/* ── RIGHT: store + key, then the request builder ── */}
      <div className="space-y-4">
        {ready && (
          <div className="flex justify-end">
            <PlaygroundTourTrigger />
          </div>
        )}
        <div className="space-y-4 rounded-lg border p-4">
          {/* JSON store + size */}
          <div data-tour="store-selector" className="grid gap-1.5">
            <Label>JSON store</Label>
            <StoreCombobox
              stores={stores}
              value={store?.id ?? ""}
              onChange={(id) =>
                router.push(`/dashboard/playground?store=${id}`)
              }
            />
            {store ? (
              <p className="flex w-full items-center gap-2 overflow-auto text-xs text-muted-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono font-medium text-nowrap text-foreground">
                  {formatSize(store.content)}
                </span>
                <code className="truncate font-mono">{store.id}</code>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Pick a store to see its size and start.
              </p>
            )}
          </div>

          {/* API key */}
          <div data-tour="api-key-selector" className="grid gap-1.5">
            <Label htmlFor="pg-key">API key</Label>
            {!store ? (
              <p className="text-sm text-muted-foreground">
                Select a JSON store first.
              </p>
            ) : apiKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You have no API keys yet.{" "}
                {store.isPublic
                  ? "GET works without a key, but PUT needs one. "
                  : "A private store needs a key with the right permission for every request. "}
                <Link
                  href="/dashboard/keys"
                  className="text-foreground underline underline-offset-2"
                >
                  Create & link a key
                </Link>
                .
              </p>
            ) : (
              <ApiKeyCombobox
                keys={apiKeys}
                value={apiKey}
                onChange={(k) => {
                  setApiKey(k)
                  setKeyChosen(true)
                }}
                allowNone={store.isPublic}
              />
            )}
            {store && !store.isPublic && keyChosen && !apiKey && (
              <p className="text-xs text-amber-600 dark:text-amber-500">
                This private store needs a key — requests without one return
                401.
              </p>
            )}
          </div>
        </div>

        {ready && (
          <Tabs data-tour="request-builder" defaultValue="get">
            <TabsList className="w-full md:w-fit">
              <TabsTrigger value="get">GET</TabsTrigger>
              <TabsTrigger value="put">PUT</TabsTrigger>
            </TabsList>

            {/* GET */}
            <TabsContent value="get" className="space-y-4 pt-2 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200">
              <div className="grid gap-1.5">
                <Label htmlFor="pg-path">
                  Path param{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="pg-path"
                  value={path}
                  onChange={(e) => {
                    const v = e.target.value
                    setPath(v)
                    setPathError(validatePath(v))
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (!pathError) sendGet()
                    }
                  }}
                  placeholder="user[0].role"
                  className={cn(
                    "font-mono",
                    pathError && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {pathError ? (
                  <p className="text-xs text-destructive">{pathError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    e.g.{" "}
                    <code className="font-mono">user.name</code>
                    {" · "}
                    <code className="font-mono">items[0].title</code>
                    {" · "}
                    <code className="font-mono">config.db.host</code>
                  </p>
                )}
              </div>
              <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs">
                GET {getUrl}
              </code>
              <div className="flex justify-end">
                <Button
                  onClick={sendGet}
                  disabled={loading || !!pathError}
                  className="w-full md:w-fit"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Send GET
                </Button>
              </div>
            </TabsContent>

            {/* PUT */}
            <TabsContent value="put" className="space-y-4 pt-2 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200">
              <div className="grid gap-1.5">
                <Label>Request body (deep-merged into content)</Label>
                <MonacoJsonEditor
                  value={putBody}
                  onChange={setPutBody}
                  monacoTheme={monacoTheme}
                  height="240px"
                />
                <p className="text-xs text-muted-foreground">
                  Objects merge recursively; arrays and primitives are replaced.
                </p>
              </div>
              <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs">
                PUT {putUrl}
              </code>
              <div className="flex justify-end">
                <Button onClick={sendPut} disabled={loading}>
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Send PUT
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  )
}
