import { ThemeSettings } from "@/components/shared/theme-settings"

export default function SettingsThemePage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Choose how the interface looks to you
        </p>
      </div>
      <ThemeSettings />
    </div>
  )
}
