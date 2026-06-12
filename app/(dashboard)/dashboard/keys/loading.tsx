import { Skeleton } from "@/components/ui/skeleton"

export default function KeysLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-1.5 h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
      <div className="overflow-hidden rounded-md border">
        <div className="border-b px-4 py-3">
          <div className="flex gap-8">
            {[100, 80, 70, 70, 40].map((w, i) => (
              <Skeleton key={i} className="h-4 rounded" style={{ width: w }} />
            ))}
          </div>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-8 border-b px-4 py-3.5 last:border-0">
            {[140, 80, 36, 80, 32].map((w, j) => (
              <Skeleton key={j} className="h-4 rounded" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
