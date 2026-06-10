"use client"
import { Toaster as Sonner } from "sonner"
import { useTheme } from "@/components/theme-provider"
import { AlertCircle, AlertTriangle, Check, Info } from "lucide-react"

export function Toaster() {
  const { resolvedTheme } = useTheme()
  return (
    <Sonner
      theme={resolvedTheme}
      icons={{
        success: <Check className="size-3 text-green-600" />,
        error: <AlertTriangle className="size-3 text-red-400" />,
        warning: <AlertCircle className="size-3 text-yellow-600" />,
        info: <Info className="size-3 text-blue-500" />,
      }}
    />
  )
}
