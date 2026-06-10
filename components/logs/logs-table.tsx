"use client"
import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { type Log } from "@/lib/db/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Props {
  data: { rows: Log[]; total: number; page: number; limit: number }
}

export function LogsTable({ data }: Props) {
  const { rows, total, page, limit } = data
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [expandedLog, setExpandedLog] = useState<Log | null>(null)
  const totalPages = Math.ceil(total / limit)

  function goToPage(p: number) {
    const params = new URLSearchParams(sp.toString())
    params.set("page", String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  if (rows.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No logs found.</div>
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>User Agent</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <code className="text-xs">{log.action}</code>
                </TableCell>
                <TableCell>
                  <Badge variant={log.result === "success" ? "secondary" : "destructive"} className="text-xs">
                    {log.result}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{log.ip}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                  {log.userAgent}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setExpandedLog(log)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {expandedLog && (
        <Dialog open onOpenChange={(o) => !o && setExpandedLog(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <Row label="Time" value={new Date(expandedLog.createdAt).toLocaleString()} />
              <Row label="Action" value={<code>{expandedLog.action}</code>} />
              <Row label="Result" value={expandedLog.result} />
              <Row label="IP" value={expandedLog.ip} />
              <Row label="User Agent" value={expandedLog.userAgent} />
              {expandedLog.requestBody && (
                <div>
                  <p className="font-medium mb-1">Request Body</p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                    {tryFormat(expandedLog.requestBody)}
                  </pre>
                </div>
              )}
              {expandedLog.responseBody && (
                <div>
                  <p className="font-medium mb-1">Response Body</p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                    {tryFormat(expandedLog.responseBody)}
                  </pre>
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
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
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
