"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Tenant, Category } from "@/infrastructure/supabase/types"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/features/store/cart-provider"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShoppingCart01Icon, Menu01Icon, Store01Icon } from "@hugeicons/core-free-icons"
import { useState } from "react"
import { cn } from "@/shared/utils"
import { CartSheet } from "./cart-sheet"

interface StoreHeaderProps {
  tenant: Tenant
  categories: Pick<Category, "id" | "name" | "slug">[]
}

export function StoreHeader({ tenant, categories }: StoreHeaderProps) {
  const pathname = usePathname()
  const { itemCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const baseUrl = `/store/${tenant.slug}`

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={baseUrl} className="flex items-center gap-2">
            {tenant.logo_url ? (
              <img src={tenant.logo_url || "/placeholder.svg"} alt={tenant.name} className="h-8 w-auto" />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: tenant.primary_color }}
              >
                <HugeiconsIcon icon={Store01Icon} className="h-5 w-5 text-white" />
              </div>
            )}
            <span className="text-lg font-semibold">{tenant.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href={baseUrl}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname === baseUrl ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Home
            </Link>
            <Link
              href={`${baseUrl}/products`}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname.includes("/products") ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Products
            </Link>
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`${baseUrl}/category/${category.slug}`}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  pathname.includes(`/category/${category.slug}`) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-2">
            <CartSheet storeSlug={tenant.slug}>
              <Button variant="ghost" size="icon" className="relative">
                <HugeiconsIcon icon={ShoppingCart01Icon} className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </Button>
            </CartSheet>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <HugeiconsIcon icon={Menu01Icon} className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-4">
                  <Link
                    href={baseUrl}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium hover:text-primary"
                  >
                    Home
                  </Link>
                  <Link
                    href={`${baseUrl}/products`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium hover:text-primary"
                  >
                    All Products
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`${baseUrl}/category/${category.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium hover:text-primary"
                    >
                      {category.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
