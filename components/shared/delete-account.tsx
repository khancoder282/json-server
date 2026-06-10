"use client"
import { useTransition } from "react"
import { deleteAccountAction } from "@/lib/actions/profile"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"

export function DeleteAccount() {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteAccountAction()
    })
  }

  return (
    <ConfirmDialog
      trigger={
        <Button variant="destructive" disabled={pending}>
          Delete account
        </Button>
      }
      title="Delete account"
      description="This will permanently delete your account, all JSON stores, API keys, and logs. This action cannot be undone."
      onConfirm={handleDelete}
      loading={pending}
    />
  )
}
