"use client"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { clearAllLogsAction } from "@/lib/actions/logs"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

export function ClearLogsButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleClear() {
    startTransition(async () => {
      await clearAllLogsAction()
      router.refresh()
    })
  }

  return (
    <ConfirmDialog
      trigger={
        <Button variant="destructive" disabled={pending}>
          Clear All Logs
        </Button>
      }
      title="Clear All Logs"
      description="This will permanently delete all your logs. This action cannot be undone."
      onConfirm={handleClear}
    />
  )
}
