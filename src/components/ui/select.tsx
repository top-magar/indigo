"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/utils"
import { ChevronsUpDown, Check, ChevronUp, ChevronDown } from "lucide-react"

// Context to share size across Select components
type SelectSize = "sm" | "default" | "lg"
const SelectSizeContext = React.createContext<SelectSize>("sm")

function Select({
  size = "sm",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root> & { size?: SelectSize }) {
  return (
    <SelectSizeContext.Provider value={size}>
      <SelectPrimitive.Root data-slot="select" {...props} />
    </SelectSizeContext.Provider>
  )
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

const selectTriggerVariants = cva(
  "flex w-fit items-center justify-between gap-1.5 rounded-md border px-3 text-sm transition-colors whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        default: "h-10 px-3 text-sm [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 px-4 text-base [&_svg:not([class*='size-'])]:size-5",
      },
      variant: {
        default: "text-[var(--ds-gray-900)] border-[var(--ds-gray-300)] bg-[var(--ds-background-100)] data-placeholder:text-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)] focus-visible:border-[var(--ds-gray-900)] focus-visible:ring-0",
        geist: "text-[var(--ds-gray-900)] bg-[var(--ds-background-100)] border-[var(--ds-gray-300)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)] focus:border-[var(--ds-gray-900)] data-placeholder:text-[var(--ds-gray-500)] focus:outline-none",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

function SelectTrigger({
  className,
  size,
  variant,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> &
  VariantProps<typeof selectTriggerVariants>) {
  const contextSize = React.useContext(SelectSizeContext)
  const resolvedSize = size ?? contextSize
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(selectTriggerVariants({ size: resolvedSize, variant, className }))}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronsUpDown strokeWidth={2} className="text-[var(--ds-gray-600)] size-3.5 pointer-events-none" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  align = "start",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-[var(--ds-background-100)] text-[var(--ds-gray-800)] border border-[var(--ds-gray-200)] min-w-32 rounded-lg shadow-sm relative z-50 max-h-(--radix-select-content-available-height) origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto",
          "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 duration-150",
          position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        sideOffset={sideOffset}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className={cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-[var(--ds-gray-600)] px-2 py-1.5 text-xs font-medium", className)}
      {...props}
    />
  )
}

const selectItemVariants = cva(
  "hover:bg-[var(--ds-gray-100)] focus:bg-[var(--ds-gray-100)] text-[var(--ds-gray-800)] gap-2 rounded-md pl-3 pr-8 text-sm [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 transition-colors duration-150",
  {
    variants: {
      size: {
        sm: "h-8 py-1.5",
        default: "h-10 py-2",
        lg: "h-12 py-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function SelectItem({
  className,
  children,
  size,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item> &
  VariantProps<typeof selectItemVariants>) {
  const contextSize = React.useContext(SelectSizeContext)
  const resolvedSize = size ?? contextSize
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(selectItemVariants({ size: resolvedSize, className }))}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check strokeWidth={2} className="size-4 pointer-events-none text-[var(--ds-gray-900)]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-[var(--ds-gray-200)] -mx-1 my-1 h-px pointer-events-none", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("bg-[var(--ds-background-100)] z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-3.5", className)}
      {...props}
    >
      <ChevronUp strokeWidth={2} />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("bg-[var(--ds-background-100)] z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-3.5", className)}
      {...props}
    >
      <ChevronDown strokeWidth={2} />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  selectTriggerVariants,
  selectItemVariants,
}
