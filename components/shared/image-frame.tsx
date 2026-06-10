import { ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageFrameProps {
  label: string
  tag?: string          // e.g. "Frame 1"
  className?: string
}

export function ImageFrame({ label, tag, className }: ImageFrameProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden",
        "bg-gradient-to-br from-muted/30 to-muted/10",
        className,
      )}
    >
      {/* subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* dashed inner border */}
      <div className="pointer-events-none absolute inset-[10px] rounded-lg border-2 border-dashed border-border/40" />

      {/* tag badge */}
      {tag && (
        <span className="absolute left-4 top-4 rounded-md bg-background/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground/50 backdrop-blur-sm">
          {tag}
        </span>
      )}

      {/* icon + label */}
      <div className="relative flex flex-col items-center gap-2.5 text-center">
        <div className="flex size-11 items-center justify-center rounded-xl border border-dashed border-muted-foreground/20 bg-background/60 shadow-sm">
          <ImageIcon className="size-5 text-muted-foreground/35" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground/50">{label}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/30">Image goes here</p>
        </div>
      </div>
    </div>
  )
}
