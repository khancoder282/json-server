import { DashboardSidebar, MobileNav } from "@/components/shared/dashboard-sidebar"
import { DashboardHeader } from "@/components/shared/dashboard-header"
import { ProgressBar } from "@/components/shared/progress-bar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ProgressBar />
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:px-10 md:py-8 pb-20 md:pb-10">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
