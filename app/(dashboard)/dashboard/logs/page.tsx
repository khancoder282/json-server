import { auth } from "@/auth"
import { getLogsByUser } from "@/lib/data/logs"
import { LogsTable } from "@/components/logs/logs-table"
import { ClearLogsButton } from "@/components/logs/clear-logs-button"

interface Props {
  searchParams: Promise<{
    page?: string
    result?: string
    action?: string
    from?: string
    to?: string
    sort?: string
    order?: string
  }>
}

export default async function LogManagementPage({ searchParams }: Props) {
  const session = await auth()
  const sp = await searchParams
  const userId = session!.user!.id!

  const data = await getLogsByUser(userId, {
    page: sp.page ? parseInt(sp.page) : 1,
    limit: 20,
    result: sp.result || undefined,
    action: sp.action || undefined,
    from: sp.from ? new Date(sp.from) : undefined,
    to: sp.to ? new Date(sp.to) : undefined,
    sort: (sp.sort as "createdAt" | "action" | "result" | "ip") || "createdAt",
    order: (sp.order as "asc" | "desc") || "desc",
  })

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold">Log Management</h1>
          <p className="text-muted-foreground">View and manage API call logs</p>
        </div>
        <ClearLogsButton />
      </div>
      <LogsTable data={data} />
    </div>
  )
}
