"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Menu01Icon,
  ShoppingBag01Icon,
  UserIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import type { HeaderBlock } from "@/types/blocks"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/store/cart-provider"
import { CartSheet } from "@/components/store/cart-sheet"
import { EditableText } from "../../editable-text"

interface MinimalHeaderProps {
  blockId: string
  settings: HeaderBlock["settings"]
  storeName: string
  storeSlug: string
  cartItemCount: number
}

export function MinimalHeader({ blockId, settings, storeName, storeSlug }: MinimalHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
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
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          {settings.logo ? (
            <Image src={settings.logo} alt={storeName} width={100} height={32} className="h-6 w-auto" />
          ) : (
            <EditableText
              blockId={blockId}
              fieldPath="logoText"
              value={settings.logoText || storeName}
              placeholder="Store name..."
              as="span"
              className="text-lg font-semibold"
            />
          )}
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Cart */}
          <CartSheet storeSlug={storeSlug}>
            <Button variant="ghost" size="icon" className="relative">
              <HugeiconsIcon icon={ShoppingBag01Icon} className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
          </CartSheet>

          {/* Menu (always hamburger) */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <HugeiconsIcon icon={Menu01Icon} className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-8 pt-8">
                {/* Search */}
                {settings.showSearch && (
                  <div className="relative">
                    <HugeiconsIcon
                      icon={Search01Icon}
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input type="search" placeholder="Search..." className="pl-10" />
                  </div>
                )}

                {/* Navigation */}
                <nav className="flex flex-col gap-4">
                  {settings.navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium transition-colors hover:text-primary"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Account */}
                {settings.showAccount && (
                  <div className="border-t pt-6">
                    <Link
                      href="/account"
                      className="flex items-center gap-3 text-lg font-medium"
                      onClick={() => setMenuOpen(false)}
                    >
                      <HugeiconsIcon icon={UserIcon} className="h-5 w-5" />
                      Account
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
