"use client"
import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmDialogProps {
  trigger: React.ReactNode
  title: string
  description: string
  onConfirm: () => void
  destructive?: boolean
  loading?: boolean
  textConfirm?: string
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
  destructive = true,
  loading = false,
  textConfirm = "Confirm",
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const v = () => {
      if (!open && !loading) {
        setOpen(false)
      }
    }
    v()
  }, [open, loading])

  return (
    <>
      <div onClick={() => setOpen(true)} style={{ display: "contents" }}>
        {trigger}
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={onConfirm}
              className={
                destructive
                  ? "text-destructive-foreground bg-destructive hover:bg-destructive/90"
                  : ""
              }
            >
              {loading ? "Loading..." : textConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
