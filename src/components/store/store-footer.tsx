import type { Tenant } from "@/lib/supabase/types"
import { HugeiconsIcon } from "@hugeicons/react"
import { Store01Icon } from "@hugeicons/core-free-icons"
import { NoPrefetchLink } from "@/components/ui/prefetch-link"

interface StoreFooterProps {
  tenant: Tenant
}

export function StoreFooter({ tenant }: StoreFooterProps) {
  const baseUrl = `/store/${tenant.slug}`

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <NoPrefetchLink href={baseUrl} className="flex items-center gap-2">
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} className="h-8 w-auto" />
              ) : (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: tenant.primary_color }}
                >
                  <HugeiconsIcon icon={Store01Icon} className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="text-lg font-semibold">{tenant.name}</span>
            </NoPrefetchLink>
            {tenant.description && (
              <p className="mt-4 max-w-md text-sm text-muted-foreground">{tenant.description}</p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <NoPrefetchLink href={`${baseUrl}/products`} className="text-sm text-muted-foreground hover:text-foreground">
                  All Products
                </NoPrefetchLink>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <NoPrefetchLink href={`${baseUrl}/contact`} className="text-sm text-muted-foreground hover:text-foreground">
                  Contact Us
                </NoPrefetchLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {tenant.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
