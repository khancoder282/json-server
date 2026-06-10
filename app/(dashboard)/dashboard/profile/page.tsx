import { auth } from "@/auth"
import { getUserById } from "@/lib/data/users"
import { ProfileForm } from "@/components/shared/profile-form"
import { PasswordForm } from "@/components/shared/password-form"
import { DeleteAccount } from "@/components/shared/delete-account"
import { Separator } from "@/components/ui/separator"

export default async function ProfilePage() {
  const session = await auth()
  const user = await getUserById(session!.user!.id!)

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Personal Information</h2>
          <p className="text-sm text-muted-foreground">Update your display name</p>
        </div>
        <ProfileForm name={user?.name ?? ""} />
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Change Password</h2>
          <p className="text-sm text-muted-foreground">
            Choose a strong password of at least 8 characters
          </p>
        </div>
        <PasswordForm />
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data
          </p>
        </div>
        <DeleteAccount />
      </section>
    </div>
  )
}
