import { DashboardSidebar, MobileNav } from "@/components/shared/dashboard-sidebar"
import { DashboardHeader } from "@/components/shared/dashboard-header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
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
