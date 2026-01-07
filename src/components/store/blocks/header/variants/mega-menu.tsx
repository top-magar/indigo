"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Menu01Icon,
  Search01Icon,
  ShoppingBag01Icon,
  UserIcon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"
import type { HeaderBlock } from "@/types/blocks"
import { cn } from "@/shared/utils"
import { useCart } from "@/features/store/cart-provider"
import { CartSheet } from "@/components/store/cart-sheet"
import { EditableText } from "../../editable-text"

interface MegaMenuHeaderProps {
  blockId: string
  settings: HeaderBlock["settings"]
  storeName: string
  storeSlug: string
  cartItemCount: number
}

export function MegaMenuHeader({ blockId, settings, storeName, storeSlug }: MegaMenuHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const { itemCount } = useCart()

  return (
    <header
      className={cn(
        "w-full border-b bg-background",
        settings.sticky && "sticky top-0 z-50",
        settings.transparent && "bg-transparent border-transparent"
      )}
      style={{ backgroundColor: settings.backgroundColor }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {settings.logo ? (
            <Image src={settings.logo} alt={storeName} width={120} height={40} className="h-8 w-auto" />
          ) : (
            <EditableText
              blockId={blockId}
              fieldPath="logoText"
              value={settings.logoText || storeName}
              placeholder="Store name..."
              as="span"
              className="text-xl font-bold"
            />
          )}
        </Link>

        {/* Desktop Navigation with Mega Menu */}
        <nav className="hidden items-center gap-1 lg:flex">
          {(settings.navLinks || []).filter(link => link?.href).map((link) => (
            <div
              key={link.href}
              className="relative"
              onMouseEnter={() => setActiveMenu(link.href)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  activeMenu === link.href
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
                <HugeiconsIcon icon={ArrowDown01Icon} className="h-4 w-4" />
              </Link>

              {/* Mega Menu Dropdown */}
              {activeMenu === link.href && (
                <div className="absolute left-0 top-full z-50 w-[600px] rounded-lg border bg-background p-6 shadow-lg">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <h4 className="mb-3 text-sm font-semibold">Categories</h4>
                      <ul className="space-y-2">
                        <li>
                          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                            All Products
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                            New Arrivals
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                            Best Sellers
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-3 text-sm font-semibold">Collections</h4>
                      <ul className="space-y-2">
                        <li>
                          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                            Summer Collection
                          </Link>
                        </li>
                        <li>
                          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                            Winter Essentials
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm font-medium">Featured</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Check out our latest arrivals
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {settings.showSearch && (
            <Button variant="ghost" size="icon" className="hidden lg:flex" asChild>
              <Link href="/search">
                <HugeiconsIcon icon={Search01Icon} className="h-5 w-5" />
              </Link>
            </Button>
          )}
          {settings.showAccount && (
            <Button variant="ghost" size="icon" className="hidden lg:flex" asChild>
              <Link href="/account">
                <HugeiconsIcon icon={UserIcon} className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <CartSheet storeSlug={storeSlug}>
            <Button variant="ghost" size="icon" className="relative">
              <HugeiconsIcon icon={ShoppingBag01Icon} className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
          </CartSheet>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <HugeiconsIcon icon={Menu01Icon} className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-6 pt-6">
                <nav className="flex flex-col gap-2">
                  {(settings.navLinks || []).filter(link => link?.href).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-md px-3 py-2 text-lg font-medium hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
