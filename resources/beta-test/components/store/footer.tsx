import type { Tenant } from "@/lib/types"
import { Store } from "lucide-react"

interface StoreFooterProps {
  tenant: Tenant
}

export function StoreFooter({ tenant }: StoreFooterProps) {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            {tenant.logo_url ? (
              <img src={tenant.logo_url || "/placeholder.svg"} alt={tenant.name} className="h-6 w-auto" />
            ) : (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ backgroundColor: tenant.primary_color }}
              >
                <Store className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="font-medium">{tenant.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {tenant.name}. Powered by StoreCraft.
          </p>
        </div>
      </div>
    </footer>
  )
}
