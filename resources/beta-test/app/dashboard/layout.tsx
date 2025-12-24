import type React from "react"
import { TenantProvider } from "@/lib/tenant-context"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TenantProvider>
      <div className="min-h-screen bg-muted/30">
        <DashboardSidebar />
        <main className="md:pl-64">
          <div className="p-6 pt-20 md:pt-6">{children}</div>
        </main>
      </div>
    </TenantProvider>
  )
}
