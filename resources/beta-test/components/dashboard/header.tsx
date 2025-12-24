"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { useTenant } from "@/lib/tenant-context"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function DashboardHeader({ title, description, action }: DashboardHeaderProps) {
  const { tenant } = useTenant()

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {tenant && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/store/${tenant.slug}`} target="_blank">
              View store
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
        {action}
      </div>
    </div>
  )
}
