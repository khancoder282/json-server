export function verifyEmailTemplate(name: string, verifyUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verify your JSON Server account</title>
</head>
<body style="font-family: system-ui, sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
    <div style="background: #18181b; padding: 32px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 20px; font-weight: 600;">JSON Server</h1>
    </div>
    <div style="padding: 40px 32px; text-align: center;">
      <h2 style="margin: 0 0 8px; font-size: 18px; color: #18181b;">Hi ${name},</h2>
      <p style="margin: 0 0 24px; color: #52525b; line-height: 1.6;">
        Thanks for signing up! Please verify your email address to activate your account.
        This link expires in <strong>24 hours</strong>.
      </p>
      <a href="${verifyUrl}"
         style="display: inline-block; background: #18181b; color: #fff; text-decoration: none;
                padding: 12px 28px; border-radius: 8px; font-weight: 500; font-size: 14px;">
        Verify Email Address
      </a>
      <p style="margin: 24px 0 0; font-size: 12px; color: #a1a1aa;">
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
