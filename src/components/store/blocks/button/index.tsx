"use client"

import { cn } from "@/shared/utils"
import type { ButtonBlock as ButtonBlockType } from "@/types/blocks"
import Link from "next/link"
import {
  ArrowRight,
  ShoppingCart,
  Mail,
  Smartphone,
  Download,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface ButtonBlockProps {
  block: ButtonBlockType
}

// Icon mapping for common button icons
const ICON_MAP: Record<string, LucideIcon> = {
  arrow: ArrowRight,
  cart: ShoppingCart,
  mail: Mail,
  phone: Smartphone,
  download: Download,
}

const VARIANT_CLASSES = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
}

const SIZE_CLASSES = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
}

export function ButtonBlock({ block }: ButtonBlockProps) {
  const { settings, variant } = block
  const {
    text = "Button",
    href = "#",
    size = "md",
    fullWidth = false,
    icon,
    iconPosition = "right",
  } = settings

  const IconComponent = icon ? ICON_MAP[icon as keyof typeof ICON_MAP] : null
  const isExternal = href.startsWith("http")
  const buttonVariant = variant || "primary"

  const buttonClasses = cn(
    "inline-flex items-center justify-center rounded-md font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANT_CLASSES[buttonVariant as keyof typeof VARIANT_CLASSES],
    SIZE_CLASSES[size as keyof typeof SIZE_CLASSES],
    fullWidth && "w-full",
  )

  const content = (
    <>
      {IconComponent && iconPosition === "left" && (
        <IconComponent className="h-4 w-4" />
      )}
      <span>{text}</span>
      {IconComponent && iconPosition === "right" && (
        <IconComponent className="h-4 w-4" />
      )}
    </>
  )

  if (isExternal) {
    return (
      <a
        href={href}
        className={buttonClasses}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={buttonClasses}>
      {content}
    </Link>
  )
}
