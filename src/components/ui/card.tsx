import * as React from "react"

import { cn } from "@/shared/utils"

/**
 * Corner radius variants for Card component
 * Based on Geist design system
 */
const radiusVariants = {
  /** Default: 8px (rounded-lg) - Vercel default for cards */
  default: "rounded-lg",
  /** Small: 6px (rounded-md) */
  sm: "rounded-md",
  /** Medium: 8px (rounded-lg) */
  md: "rounded-lg",
  /** Large: 12px (rounded-xl) - dialogs, large panels */
  lg: "rounded-xl",
  /** Extra Large: 16px (rounded-2xl) - hero cards */
  xl: "rounded-2xl",
  /** None: 0px */
  none: "rounded-none",
} as const;

type CardRadius = keyof typeof radiusVariants;

function Card({
  className,
  size = "default",
  radius = "default",
  ...props
}: React.ComponentProps<"div"> & { 
  size?: "default" | "sm" | "golden-sm" | "golden-md" | "golden-lg";
  radius?: CardRadius;
}) {
  const sizeClasses = {
    default: "",
    sm: "",
    "golden-sm": "w-[160px] aspect-[1/1.618] p-[13px]",
    "golden-md": "w-[240px] aspect-[1/1.618] p-[13px]",
    "golden-lg": "w-[320px] aspect-[1/1.618] p-[26px]",
  };

  return (
    <div
      data-slot="card"
      data-size={size}
      data-radius={radius}
      className={cn(
        "ring-foreground/10 bg-card text-card-foreground gap-4 overflow-hidden py-4 text-xs/relaxed ring-1 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg group/card flex flex-col",
        radiusVariants[radius],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "gap-1 px-4 group-data-[size=sm]/card:px-3 [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3 group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        // Nested radius: inherit from parent card radius
        "group-data-[radius=default]/card:rounded-t-[5px] group-data-[radius=sm]/card:rounded-t-[0px] group-data-[radius=md]/card:rounded-t-[5px] group-data-[radius=lg]/card:rounded-t-[13px] group-data-[radius=xl]/card:rounded-t-[18px] group-data-[radius=none]/card:rounded-t-none",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-xs/relaxed", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-4 group-data-[size=sm]/card:px-3",
        // Nested radius for content inside card with padding
        "group-data-[radius=default]/card:rounded-[5px] group-data-[radius=md]/card:rounded-[5px] group-data-[radius=lg]/card:rounded-[13px] group-data-[radius=xl]/card:rounded-[18px] group-data-[radius=sm]/card:rounded-[0px] group-data-[radius=none]/card:rounded-none",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "px-4 group-data-[size=sm]/card:px-3 [.border-t]:pt-4 group-data-[size=sm]/card:[.border-t]:pt-3 flex items-center",
        // Nested radius: inherit from parent card radius
        "group-data-[radius=default]/card:rounded-b-[5px] group-data-[radius=sm]/card:rounded-b-[0px] group-data-[radius=md]/card:rounded-b-[5px] group-data-[radius=lg]/card:rounded-b-[13px] group-data-[radius=xl]/card:rounded-b-[18px] group-data-[radius=none]/card:rounded-b-none",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  type CardRadius,
}
