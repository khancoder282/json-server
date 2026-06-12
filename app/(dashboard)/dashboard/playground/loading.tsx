import { Skeleton } from "@/components/ui/skeleton"

export default function PlaygroundLoading() {
  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="mt-1.5 h-4 w-52" />
      </div>
      <div className="grid gap-6 md:grid-cols-[1fr_24rem]">
        {/* Left: editor area */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
          <Skeleton className="h-[60dvh] w-full rounded-lg" />
        </div>
        {/* Right: controls */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-lg border p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
