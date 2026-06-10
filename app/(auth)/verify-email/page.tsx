import { VerifyEmailContent } from "@/components/shared/verify-email-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  searchParams: Promise<{ email?: string; token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { email, token } = await searchParams
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
      </CardHeader>
      <CardContent>
        <VerifyEmailContent email={email} token={token} />
      </CardContent>
    </Card>
  )
}
