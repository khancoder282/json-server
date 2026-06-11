import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY)

// Resend's shared test sender (onboarding@resend.dev) only delivers to your own
// Resend account email. To email real users, verify a domain in the Resend
// dashboard and set EMAIL_FROM to an address on it, e.g.
//   EMAIL_FROM="JSON Server <noreply@denmobi.vn>"
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "JSON Server <onboarding@resend.dev>"

/**
 * Send an email and surface the real failure reason. The Resend SDK returns
 * `{ data, error }` instead of throwing, so a swallowed `error` silently drops
 * the email — we throw it instead so callers (and logs) see what went wrong.
 */
export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set")
  }
  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    ...opts,
  })
  if (error) {
    throw new Error(`Resend failed: ${error.name} — ${error.message}`)
  }
  return data
}
