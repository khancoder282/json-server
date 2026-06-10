import { auth } from "@/auth"
import { getUserById } from "@/lib/data/users"
import { ProfileForm } from "@/components/shared/profile-form"
import { DeleteAccount } from "@/components/shared/delete-account"
import { Separator } from "@/components/ui/separator"

export default async function SettingsProfilePage() {
  const session = await auth()
  const user = await getUserById(session!.user!.id!)

  return (
    <div className="space-y-8">
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
