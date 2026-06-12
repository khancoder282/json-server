import { Skeleton } from "@/components/ui/skeleton"

export default function LogsLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-1.5 h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[120, 100, 90, 80].map((w, i) => (
          <Skeleton key={i} className="h-9 rounded-md" style={{ width: w }} />
        ))}
      </div>
      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <div className="border-b px-4 py-3">
          <div className="flex gap-6">
            {[80, 120, 60, 60, 100, 40].map((w, i) => (
              <Skeleton key={i} className="h-4 rounded" style={{ width: w }} />
            ))}
          </div>
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 border-b px-4 py-3 last:border-0">
            {[80, 120, 60, 60, 100, 40].map((w, j) => (
              <Skeleton key={j} className="h-4 rounded" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
