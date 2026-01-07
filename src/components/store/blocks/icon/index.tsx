"use client"

import { cn } from "@/shared/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  StarIcon,
  FavouriteIcon,
  CheckmarkCircle02Icon,
  Shield01Icon,
  TruckIcon,
  CreditCardIcon,
  GiftIcon,
  HeadphonesIcon,
  Mail01Icon,
  AiPhone01Icon,
  Location01Icon,
  Clock01Icon,
  UserIcon,
  Settings01Icon,
  Search01Icon,
  Home01Icon,
} from "@hugeicons/core-free-icons"
import type { IconBlock as IconBlockType } from "@/types/blocks"
import { EditableText } from "../editable-text"

interface IconBlockProps {
  block: IconBlockType
}

// Icon mapping
const ICON_MAP: Record<string, typeof StarIcon> = {
  StarIcon,
  HeartIcon: FavouriteIcon,
  CheckCircleIcon: CheckmarkCircle02Icon,
  ShieldCheckIcon: Shield01Icon,
  Truck01Icon: TruckIcon,
  CreditCardIcon,
  GiftIcon,
  HeadphonesIcon,
  Mail01Icon,
  Phone01Icon: AiPhone01Icon,
  MapPinIcon: Location01Icon,
  Clock01Icon,
  UserIcon,
  SettingsIcon: Settings01Icon,
  SearchIcon: Search01Icon,
  HomeIcon: Home01Icon,
}

export function IconBlock({ block }: IconBlockProps) {
  const { variant, settings, id: blockId } = block

  switch (variant) {
    case "default":
      return <DefaultIcon blockId={blockId} settings={settings} />
    case "circle":
      return <CircleIcon blockId={blockId} settings={settings} />
    case "square":
      return <SquareIcon blockId={blockId} settings={settings} />
    case "outline":
      return <OutlineIcon blockId={blockId} settings={settings} />
    default:
      return <DefaultIcon blockId={blockId} settings={settings} />
  }
}

interface VariantProps {
  blockId: string
  settings: IconBlockType["settings"]
}

const sizeClasses = {
  small: "h-6 w-6",
  medium: "h-8 w-8",
  large: "h-12 w-12",
  xlarge: "h-16 w-16",
}

const containerSizeClasses = {
  small: "h-10 w-10",
  medium: "h-14 w-14",
  large: "h-20 w-20",
  xlarge: "h-24 w-24",
}

const alignmentClasses = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
}

function DefaultIcon({ blockId, settings }: VariantProps) {
  const { icon, size, color, title, description, link, alignment } = settings
  const IconComponent = ICON_MAP[icon] || StarIcon

  const content = (
    <div className={cn("flex flex-col", alignmentClasses[alignment])}>
      <HugeiconsIcon
        icon={IconComponent}
        className={sizeClasses[size]}
        style={{ color: color || undefined }}
      />
      {title && (
        <EditableText
          blockId={blockId}
          fieldPath="title"
          value={title}
          placeholder="Title..."
          as="h4"
          className="mt-3 font-semibold"
        />
      )}
      {description && (
        <EditableText
          blockId={blockId}
          fieldPath="description"
          value={description}
          placeholder="Description..."
          as="p"
          className="mt-1 text-sm text-muted-foreground"
        />
      )}
    </div>
  )

  if (link) {
    return (
      <a href={link} className="block hover:opacity-80 transition-opacity">
        {content}
      </a>
    )
  }

  return content
}

function CircleIcon({ blockId, settings }: VariantProps) {
  const { icon, size, color, backgroundColor, title, description, link, alignment } = settings
  const IconComponent = ICON_MAP[icon] || StarIcon

  const content = (
    <div className={cn("flex flex-col", alignmentClasses[alignment])}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full",
          containerSizeClasses[size]
        )}
        style={{ backgroundColor: backgroundColor || "#f3f4f6" }}
      >
        <HugeiconsIcon
          icon={IconComponent}
          className={sizeClasses[size]}
          style={{ color: color || undefined }}
        />
      </div>
      {title && (
        <EditableText
          blockId={blockId}
          fieldPath="title"
          value={title}
          placeholder="Title..."
          as="h4"
          className="mt-3 font-semibold"
        />
      )}
      {description && (
        <EditableText
          blockId={blockId}
          fieldPath="description"
          value={description}
          placeholder="Description..."
          as="p"
          className="mt-1 text-sm text-muted-foreground"
        />
      )}
    </div>
  )

  if (link) {
    return (
      <a href={link} className="block hover:opacity-80 transition-opacity">
        {content}
      </a>
    )
  }

  return content
}

function SquareIcon({ blockId, settings }: VariantProps) {
  const { icon, size, color, backgroundColor, title, description, link, alignment } = settings
  const IconComponent = ICON_MAP[icon] || StarIcon

  const content = (
    <div className={cn("flex flex-col", alignmentClasses[alignment])}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg",
          containerSizeClasses[size]
        )}
        style={{ backgroundColor: backgroundColor || "#f3f4f6" }}
      >
        <HugeiconsIcon
          icon={IconComponent}
          className={sizeClasses[size]}
          style={{ color: color || undefined }}
        />
      </div>
      {title && (
        <EditableText
          blockId={blockId}
          fieldPath="title"
          value={title}
          placeholder="Title..."
          as="h4"
          className="mt-3 font-semibold"
        />
      )}
      {description && (
        <EditableText
          blockId={blockId}
          fieldPath="description"
          value={description}
          placeholder="Description..."
          as="p"
          className="mt-1 text-sm text-muted-foreground"
        />
      )}
    </div>
  )

  if (link) {
    return (
      <a href={link} className="block hover:opacity-80 transition-opacity">
        {content}
      </a>
    )
  }

  return content
}

function OutlineIcon({ blockId, settings }: VariantProps) {
  const { icon, size, color, title, description, link, alignment } = settings
  const IconComponent = ICON_MAP[icon] || StarIcon

  const content = (
    <div className={cn("flex flex-col", alignmentClasses[alignment])}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-2",
          containerSizeClasses[size]
        )}
        style={{ borderColor: color || "#d1d5db" }}
      >
        <HugeiconsIcon
          icon={IconComponent}
          className={sizeClasses[size]}
          style={{ color: color || undefined }}
        />
      </div>
      {title && (
        <EditableText
          blockId={blockId}
          fieldPath="title"
          value={title}
          placeholder="Title..."
          as="h4"
          className="mt-3 font-semibold"
        />
      )}
      {description && (
        <EditableText
          blockId={blockId}
          fieldPath="description"
          value={description}
          placeholder="Description..."
          as="p"
          className="mt-1 text-sm text-muted-foreground"
        />
      )}
    </div>
  )

  if (link) {
    return (
      <a href={link} className="block hover:opacity-80 transition-opacity">
        {content}
      </a>
    )
  }

  return content
}
