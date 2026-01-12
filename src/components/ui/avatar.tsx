"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/utils"

const avatarVariants = cva(
  "rounded-full after:rounded-full after:border-border group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:mix-blend-darken dark:after:mix-blend-lighten",
  {
    variants: {
      size: {
        default: "size-8",
        sm: "size-8",      // 32px
        md: "size-10",     // 40px
        lg: "size-12",     // 48px
        golden: "h-[52px] w-[52px]",
      },
      variant: {
        default: "",
        "geist-user":
          "ring-2 ring-[var(--ds-gray-400)] dark:ring-[var(--ds-gray-700)]",
        "geist-team":
          "rounded-lg after:rounded-lg ring-2 ring-[var(--ds-blue-700)] dark:ring-[var(--ds-blue-400)]",
        "geist-placeholder":
          "bg-[var(--ds-gray-200)] dark:bg-[var(--ds-gray-800)] ring-1 ring-[var(--ds-gray-300)] dark:ring-[var(--ds-gray-700)]",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

function Avatar({
  className,
  size = "default",
  variant = "default",
  ...props
}: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      data-variant={variant}
      className={cn(avatarVariants({ size, variant, className }))}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "rounded-full aspect-square size-full object-cover",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted text-muted-foreground rounded-full flex size-full items-center justify-center text-sm",
        "group-data-[size=sm]/avatar:text-xs",
        "group-data-[size=md]/avatar:text-sm",
        "group-data-[size=lg]/avatar:text-base",
        "group-data-[size=golden]/avatar:text-base",
        "group-data-[variant=geist-team]/avatar:rounded-lg",
        "group-data-[variant=geist-placeholder]/avatar:bg-transparent text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-400)]",
        className
      )}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-blend-color ring-2 select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        "group-data-[size=golden]/avatar:size-3.5 group-data-[size=golden]/avatar:[&>svg]:size-2.5",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "*:data-[slot=avatar]:ring-background group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn("bg-muted text-muted-foreground size-8 rounded-full text-xs/relaxed group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 group-has-data-[size=golden]/avatar-group:h-[52px] group-has-data-[size=golden]/avatar-group:w-[52px] [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3 group-has-data-[size=golden]/avatar-group:[&>svg]:size-5 ring-background relative flex shrink-0 items-center justify-center ring-2", className)}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
  avatarVariants,
}
