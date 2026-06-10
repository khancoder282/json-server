import { auth } from "@/auth"
import { getUserById } from "@/lib/data/users"
import { ProfileForm } from "@/components/shared/profile-form"

export default async function SettingsProfilePage() {
  const session = await auth()
  const user = await getUserById(session!.user!.id!)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Personal Information</h2>
        <p className="text-sm text-muted-foreground">Update your display name</p>
      </div>
      <ProfileForm name={user?.name ?? ""} />
    </div>
  )
}
