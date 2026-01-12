"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Truck,
  RefreshCw,
  ShieldCheck,
  Headphones,
  CreditCard,
  Package,
  type LucideIcon,
} from "lucide-react"
import type { IconField as IconFieldConfig } from "../types"

interface IconFieldProps {
  config: IconFieldConfig
  value: string
  onChange: (value: string) => void
}

// Map icon names to actual icon components
const ICON_MAP: Record<string, LucideIcon> = {
  Truck01Icon: Truck,
  RefreshIcon: RefreshCw,
  ShieldCheckIcon: ShieldCheck,
  HeadphonesIcon: Headphones,
  CreditCardIcon: CreditCard,
  GiftIcon: Package,
}

const ICON_LABELS: Record<string, string> = {
  Truck01Icon: "Truck",
  RefreshIcon: "Refresh",
  ShieldCheckIcon: "Shield",
  HeadphonesIcon: "Headphones",
  CreditCardIcon: "Credit Card",
  GiftIcon: "Gift",
}

export function IconField({ config, value, onChange }: IconFieldProps) {
  const IconComponent = value ? ICON_MAP[value] : null

  return (
    <div className="space-y-2">
      <Label className="text-sm">{config.label}</Label>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select icon...">
            {IconComponent && (
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <span>{ICON_LABELS[value] || value}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {config.icons.map((iconName) => {
            const Icon = ICON_MAP[iconName]
            return (
              <SelectItem key={iconName} value={iconName}>
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{ICON_LABELS[iconName] || iconName}</span>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {config.description && (
        <p className="text-xs text-muted-foreground">{config.description}</p>
      )}
    </div>
  )
}
