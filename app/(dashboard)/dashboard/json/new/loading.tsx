import { Skeleton } from "@/components/ui/skeleton"

export default function NewJsonLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center border-b pb-6 gap-2">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-8 w-48" />
      </div>
      {/* Editor skeleton */}
      <div className="flex flex-col rounded-lg border" style={{ height: "calc(100vh - 11rem)" }}>
        <div className="flex flex-1 flex-col gap-2 p-4">
          {[60, 80, 72, 55, 90, 65, 78, 50, 68, 82, 58, 74].map((w, i) => (
            <Skeleton key={i} className="h-4 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="flex shrink-0 items-center justify-between rounded-b-lg border-t bg-background px-3 py-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-9 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  )
}
