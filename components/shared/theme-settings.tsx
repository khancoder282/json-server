"use client"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Monitor, Moon, Sun } from "lucide-react"

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

export function ThemeSettings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex gap-3">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex flex-col justify-center items-center gap-2 rounded-lg border-2 size-20 text-sm font-medium transition-colors",
            theme === value
              ? "border-primary bg-primary/5 text-foreground"
              : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-5" />
          {label}
        </button>
      ))}
    </div>
  )
}
