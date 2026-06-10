"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { verifyEmailAction, resendVerificationAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"

interface Props {
  email?: string
  token?: string
}

export function VerifyEmailContent({ email, token }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    if (!token) return
    setStatus("verifying")
    verifyEmailAction(token).then((res) => {
      if (res.success) {
        setStatus("success")
        setTimeout(() => router.push("/dashboard"), 1500)
      } else {
        setStatus("error")
        setMessage(res.error ?? "Verification failed")
      }
    })
  }, [token, router])

  async function handleResend() {
    if (!email) return
    setResending(true)
    const res = await resendVerificationAction(email)
    setResending(false)
    if (res.success) setResent(true)
    else setMessage(res.error ?? "Failed to resend")
  }

  if (token) {
    if (status === "verifying") return <p className="text-muted-foreground">Verifying your email…</p>
    if (status === "success")
      return <p className="text-green-600">Email verified! Redirecting to dashboard…</p>
    return (
      <div className="flex flex-col gap-4">
        <p className="text-destructive">{message}</p>
        {email && (
          <Button onClick={handleResend} disabled={resending || resent} variant="outline">
            {resent ? "Email sent!" : resending ? "Sending…" : "Resend verification email"}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground">
        We sent a verification link to <strong>{email}</strong>. Check your inbox and click the link to activate your
        account.
      </p>
      {message && <p className="text-destructive text-sm">{message}</p>}
      {resent && <p className="text-green-600 text-sm">Verification email sent!</p>}
      <Button onClick={handleResend} disabled={resending || resent || !email} variant="outline">
        {resent ? "Email sent!" : resending ? "Sending…" : "Resend email"}
      </Button>
    </div>
  )
}
