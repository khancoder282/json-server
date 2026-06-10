import { DeleteAccount } from "@/components/shared/delete-account"

export default function SettingsDangerPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
      </div>
      <div className="rounded-lg border border-destructive/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-xs text-muted-foreground">
              Removes all JSON stores, API keys, and logs permanently.
            </p>
          </div>
          <DeleteAccount />
        </div>
      </div>
    </div>
  )
}
