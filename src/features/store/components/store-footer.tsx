import Image from "next/image"
import type { Tenant } from "@/infrastructure/supabase/types"
import { Store } from "lucide-react"
import { NoPrefetchLink } from "@/components/ui/prefetch-link"

import { storeHref } from "@/features/store/url"

interface StoreFooterProps {
  tenant: Tenant
  showBranding?: boolean
}

export function StoreFooter({ tenant, showBranding = false }: StoreFooterProps) {
  const baseUrl = storeHref(tenant.slug)

  return (
    <footer className="border-t bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <NoPrefetchLink href={baseUrl} className="flex items-center gap-2">
              {tenant.logo_url ? (
                <Image src={tenant.logo_url} alt={tenant.name} width={120} height={32} className="h-8 w-auto" />
              ) : (
                <div
                  className="flex size-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: tenant.primary_color }}
                >
                  <Store className="size-5 text-white" />
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
            <h3 className="text-sm font-semibold">Shop</h3>
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
            <h3 className="text-sm font-semibold">Support</h3>
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
          {showBranding && (
            <p className="text-center text-xs text-muted-foreground/60 mt-2">
              Powered by <a href="https://indigo.store" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground">Indigo</a>
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
