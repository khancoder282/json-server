"use client"
import { useState } from "react"
import dynamic from "next/dynamic"
import { type Log } from "@/lib/db/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pagination } from "@/components/shared/pagination"
import { SortableHeader } from "@/components/shared/sortable-header"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

function EditorSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4" style={{ height: 200 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 rounded"
          style={{ width: `${[60, 80, 72, 55, 90][i]}%` }}
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

interface Props {
  data: { rows: Log[]; total: number; page: number; limit: number }
}

export function LogsTable({ data }: Props) {
  const { rows, total, page, limit } = data
  const [expandedLog, setExpandedLog] = useState<Log | null>(null)
  const { resolvedTheme } = useTheme()
  const monacoTheme = resolvedTheme === "dark" ? "dracula" : "vs"

  if (rows.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No logs found.
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortableHeader column="createdAt">Time</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="action">Action</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="result">Result</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="ip">IP</SortableHeader>
              </TableHead>
              <TableHead>User Agent</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <ActionLabel action={log.action} />
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      log.result === "success" ? "secondary" : "destructive"
                    }
                    className={cn("text-xs capitalize", {
                      "bg-green-700 text-green-50": log.result === "success",
                    })}
                  >
                    • {log.result}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {log.ip}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                  {log.userAgent}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedLog(log)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination page={page} total={total} limit={limit} />

      {expandedLog && (
        <Dialog open onOpenChange={(o) => !o && setExpandedLog(null)}>
          <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <Row
                label="Time"
                value={new Date(expandedLog.createdAt).toLocaleString()}
              />
              <Row label="Action" value={<code>{expandedLog.action}</code>} />
              <Row label="Result" value={expandedLog.result} />
              <Row label="IP" value={expandedLog.ip} />
              <Row label="User Agent" value={expandedLog.userAgent} />
              {expandedLog.requestBody && (
                <div>
                  <p className="mb-1 font-medium">Request Body</p>
                  <MonacoJsonEditor
                    value={tryFormat(expandedLog.requestBody)}
                    readOnly
                    monacoTheme={monacoTheme}
                    height="200px"
                  />
                </div>
              )}
              {expandedLog.responseBody && (
                <div>
                  <p className="mb-1 font-medium">Response Body</p>
                  <MonacoJsonEditor
                    value={tryFormat(expandedLog.responseBody)}
                    readOnly
                    monacoTheme={monacoTheme}
                    height="200px"
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className="break-all">{value}</span>
    </div>
  )
}

function tryFormat(str: string) {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}

// Color only the HTTP method in an action like "GET /api/json/{id}"; the URL
// part keeps the muted style.
const METHOD_COLOR: Record<string, string> = {
  GET: "text-green-600 dark:text-green-400",
  PUT: "text-amber-600 dark:text-amber-400",
  POST: "text-blue-600 dark:text-blue-400",
  DELETE: "text-red-600 dark:text-red-400",
}

function ActionLabel({ action }: { action: string }) {
  const spaceIdx = action.indexOf(" ")
  const method = spaceIdx === -1 ? action : action.slice(0, spaceIdx)
  const rest = spaceIdx === -1 ? "" : action.slice(spaceIdx + 1)
  return (
    <code className="text-xs">
      <span className={cn("font-semibold", METHOD_COLOR[method])}>
        {method}
      </span>
      {rest && <span className="text-muted-foreground"> {rest}</span>}
    </code>
  )
}
