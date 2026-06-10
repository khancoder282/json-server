import { PasswordForm } from "@/components/shared/password-form"

export default function SettingsPasswordPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Change Password</h2>
        <p className="text-sm text-muted-foreground">
          Choose a strong password of at least 8 characters
        </p>
      </div>
      <PasswordForm />
    </div>
  )
}
