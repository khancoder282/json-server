"use client"
import { useState } from "react"
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
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
  destructive = true,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)

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
              onClick={() => {
                onConfirm()
                setOpen(false)
              }}
              className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
