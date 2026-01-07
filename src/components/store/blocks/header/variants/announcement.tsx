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
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import type { HeaderBlock } from "@/types/blocks"
import { cn } from "@/shared/utils"
import { useCart } from "@/features/store/cart-provider"
import { CartSheet } from "@/components/store/cart-sheet"
import { EditableText } from "../../editable-text"

interface AnnouncementHeaderProps {
  blockId: string
  settings: HeaderBlock["settings"]
  storeName: string
  storeSlug: string
  cartItemCount: number
}

export function AnnouncementHeader({ blockId, settings, storeName, storeSlug }: AnnouncementHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [announcementVisible, setAnnouncementVisible] = useState(true)
  const { itemCount } = useCart()

  return (
    <header
      className={cn(
        "w-full bg-background",
        settings.sticky && "sticky top-0 z-50"
      )}
    >
      {/* Announcement Bar */}
      {announcementVisible && settings.announcementText && (
        <div className="relative bg-primary px-4 py-2 text-center text-sm text-primary-foreground">
          <div className="mx-auto max-w-7xl">
            {settings.announcementLink ? (
              <Link href={settings.announcementLink} className="hover:underline">
                <EditableText
                  blockId={blockId}
                  fieldPath="announcementText"
                  value={settings.announcementText}
                  placeholder="Announcement text..."
                  as="span"
                />
              </Link>
            ) : (
              <EditableText
                blockId={blockId}
                fieldPath="announcementText"
                value={settings.announcementText}
                placeholder="Announcement text..."
                as="span"
              />
            )}
          </div>
          <button
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-primary-foreground/10"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <div
        className="border-b"
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

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {(settings.navLinks || []).filter(link => link?.href).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {settings.showSearch && (
              <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
                <Link href="/search">
                  <HugeiconsIcon icon={Search01Icon} className="h-5 w-5" />
                </Link>
              </Button>
            )}
            {settings.showAccount && (
              <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
                <Link href="/account">
                  <HugeiconsIcon icon={UserIcon} className="h-5 w-5" />
                </Link>
              </Button>
            )}
            
            {/* Cart */}
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
                <Button variant="ghost" size="icon" className="md:hidden">
                  <HugeiconsIcon icon={Menu01Icon} className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-6 pt-6">
                  <nav className="flex flex-col gap-4">
                    {(settings.navLinks || []).filter(link => link?.href).map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg font-medium"
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
      </div>
    </header>
  )
}
