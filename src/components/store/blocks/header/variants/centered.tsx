"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, Search, ShoppingBag, User } from "lucide-react"
import type { HeaderBlock } from "@/types/blocks"
import { cn } from "@/shared/utils"
import { useCart } from "@/features/store/cart-provider"
import { CartSheet } from "@/components/store/cart-sheet"
import { EditableText } from "../../editable-text"

interface CenteredHeaderProps {
  blockId: string
  settings: HeaderBlock["settings"]
  storeName: string
  storeSlug: string
  cartItemCount: number
}

export function CenteredHeader({ blockId, settings, storeName, storeSlug }: CenteredHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { itemCount } = useCart()

  const navLinks = settings.navLinks || []
  const leftLinks = navLinks.slice(0, Math.ceil(navLinks.length / 2))
  const rightLinks = navLinks.slice(Math.ceil(navLinks.length / 2))

  return (
    <header
      className={cn(
        "w-full border-b bg-background",
        settings.sticky && "sticky top-0 z-50",
        settings.transparent && "bg-transparent border-transparent"
      )}
      style={{ backgroundColor: settings.backgroundColor }}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Navigation */}
        <nav className="hidden flex-1 items-center gap-8 md:flex">
          {leftLinks.filter(link => link?.href).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col gap-6 pt-6">
              <nav className="flex flex-col gap-4">
                {navLinks.filter(link => link?.href).map((link) => (
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

        {/* Centered Logo */}
        <Link href="/" className="flex items-center justify-center">
          {settings.logo ? (
            <Image src={settings.logo} alt={storeName} width={140} height={50} className="h-10 w-auto" />
          ) : (
            <EditableText
              blockId={blockId}
              fieldPath="logoText"
              value={settings.logoText || storeName}
              placeholder="Store name..."
              as="span"
              className="text-2xl font-bold tracking-tight"
            />
          )}
        </Link>

        {/* Right Navigation + Actions */}
        <div className="flex flex-1 items-center justify-end gap-8">
          <nav className="hidden items-center gap-8 md:flex">
            {rightLinks.filter(link => link?.href).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {settings.showSearch && (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/search">
                  <Search className="h-5 w-5" />
                </Link>
              </Button>
            )}
            {settings.showAccount && (
              <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
                <Link href="/account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <CartSheet storeSlug={storeSlug}>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </Button>
            </CartSheet>
          </div>
        </div>
      </div>
    </header>
  )
}
