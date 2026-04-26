"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Tenant, Category } from "@/infrastructure/supabase/types"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useCart } from "@/features/store/cart-provider"
import { ShoppingCart, Menu, Store, User, Package, Heart, LogOut, Search } from "lucide-react"
import { useState } from "react"
import { cn } from "@/shared/utils"
import { CartSheet } from "./cart-sheet"
import { storeHref } from "@/features/store/url"

interface StoreHeaderProps {
  tenant: Tenant
  categories: Pick<Category, "id" | "name" | "slug">[]
  navPages?: { name: string; slug: string }[]
  customer?: { name: string; email: string } | null
}

export function StoreHeader({ tenant, categories, navPages = [], customer }: StoreHeaderProps) {
  const pathname = usePathname()
  const { itemCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const baseUrl = storeHref(tenant.slug)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link href={baseUrl} className="flex items-center gap-2 shrink-0">
            {tenant.logo_url ? (
              <Image src={tenant.logo_url || "/placeholder.svg"} alt={tenant.name} width={120} height={32} className="h-8 w-auto" />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-lg" style={{ backgroundColor: tenant.primary_color }}>
                <Store className="size-4 text-white" />
              </div>
            )}
            <span className="text-sm font-semibold hidden sm:block">{tenant.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { label: "Home", href: baseUrl, active: pathname === baseUrl },
              { label: "Products", href: `${baseUrl}/products`, active: pathname.includes("/products") },
              ...categories.slice(0, 4).map(c => ({
                label: c.name,
                href: `${baseUrl}/category/${c.slug}`,
                active: pathname.includes(`/category/${c.slug}`),
              })),
              ...navPages.slice(0, 4).map(p => ({
                label: p.name,
                href: `/p/${tenant.slug}/${p.slug}`,
                active: pathname.includes(`/p/${tenant.slug}/${p.slug}`),
              })),
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium px-3 py-1.5 rounded-md transition-colors",
                  link.active ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Button variant="ghost" size="icon" className="size-9 hidden sm:flex" aria-label="Search" asChild>
              <Link href={`${baseUrl}/search`}>
                <Search className="size-4" />
              </Link>
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="size-9 hidden sm:flex" aria-label="Wishlist" asChild>
              <Link href={`${baseUrl}/wishlist`}>
                <Heart className="size-4" />
              </Link>
            </Button>

            {/* User menu */}
            {customer ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-9" aria-label="Account">
                    <div className="size-6 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-medium">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium truncate">{customer.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`${baseUrl}/account`}>
                      <User className="size-3.5" /> My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${baseUrl}/account/orders`}>
                      <Package className="size-3.5" /> My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${baseUrl}/wishlist`}>
                      <Heart className="size-3.5" /> Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`${baseUrl}/login`} className="text-muted-foreground">
                      <LogOut className="size-3.5" /> Sign Out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="size-9" aria-label="Sign in" asChild>
                <Link href={`${baseUrl}/login`}>
                  <User className="size-4" />
                </Link>
              </Button>
            )}

            {/* Cart */}
            <CartSheet storeSlug={tenant.slug}>
              <Button variant="ghost" size="icon" className="size-9 relative" aria-label="Shopping cart">
                <ShoppingCart className="size-4" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Button>
            </CartSheet>

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9 md:hidden" aria-label="Menu">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="text-left">{tenant.name}</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {[
                    { label: "Home", href: baseUrl },
                    { label: "Products", href: `${baseUrl}/products` },
                    { label: "Search", href: `${baseUrl}/search` },
                    ...categories.map(c => ({ label: c.name, href: `${baseUrl}/category/${c.slug}` })),
                    ...navPages.map(p => ({ label: p.name, href: `/p/${tenant.slug}/${p.slug}` })),
                  ].map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium px-3 py-2.5 rounded-md hover:bg-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="h-px bg-border my-3" />

                  {customer ? (
                    <>
                      <Link href={`${baseUrl}/account`} onClick={() => setMobileMenuOpen(false)} className="text-sm px-3 py-2.5 rounded-md hover:bg-accent flex items-center gap-2">
                        <User className="size-4" /> My Account
                      </Link>
                      <Link href={`${baseUrl}/account/orders`} onClick={() => setMobileMenuOpen(false)} className="text-sm px-3 py-2.5 rounded-md hover:bg-accent flex items-center gap-2">
                        <Package className="size-4" /> My Orders
                      </Link>
                      <Link href={`${baseUrl}/wishlist`} onClick={() => setMobileMenuOpen(false)} className="text-sm px-3 py-2.5 rounded-md hover:bg-accent flex items-center gap-2">
                        <Heart className="size-4" /> Wishlist
                      </Link>
                    </>
                  ) : (
                    <Link href={`${baseUrl}/login`} onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium px-3 py-2.5 rounded-md hover:bg-accent flex items-center gap-2">
                      <User className="size-4" /> Sign In
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
