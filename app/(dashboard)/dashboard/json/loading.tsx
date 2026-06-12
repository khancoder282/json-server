import { Skeleton } from "@/components/ui/skeleton"

export default function JsonListLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <Skeleton className="h-8 w-44" />
          <Skeleton className="mt-1.5 h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <TableSkeleton cols={5} rows={8} />
    </div>
  )
}

function TableSkeleton({ cols, rows }: { cols: number; rows: number }) {
  return (
    <div className="overflow-hidden rounded-md border">
      <div className="border-b px-4 py-3">
        <div className="flex gap-8">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4" style={{ width: `${[80, 60, 50, 60, 40][i] ?? 60}px` }} />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-8 border-b px-4 py-3 last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className="h-4 rounded"
              style={{ width: `${[120, 80, 50, 80, 32][j] ?? 60}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
