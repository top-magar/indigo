"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/shared/utils"

const collapseVariants = cva(
  "border border-[var(--ds-gray-alpha-400)] rounded-lg overflow-hidden",
  {
    variants: {
      size: {
        default: "",
        small: "",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const collapseHeaderVariants = cva(
  "flex items-center justify-between w-full cursor-pointer bg-[var(--ds-background-100)] transition-colors duration-150 hover:bg-[var(--ds-gray-100)]",
  {
    variants: {
      size: {
        default: "px-4 py-3 text-sm",
        small: "px-3 py-2 text-xs",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed hover:bg-[var(--ds-background-100)]",
        false: "",
      },
    },
    defaultVariants: {
      size: "default",
      disabled: false,
    },
  }
)

const collapseContentVariants = cva(
  "overflow-hidden transition-all duration-200 ease-out",
  {
    variants: {
      size: {
        default: "",
        small: "",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const collapseContentInnerVariants = cva(
  "border-t border-[var(--ds-gray-alpha-400)] bg-[var(--ds-background-100)]",
  {
    variants: {
      size: {
        default: "px-4 py-3 text-sm",
        small: "px-3 py-2 text-xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface CollapseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onToggle">,
    VariantProps<typeof collapseVariants> {
  /** Header text for the collapse trigger */
  title: React.ReactNode
  /** Controlled expansion state */
  expanded?: boolean
  /** Initial expansion state (uncontrolled) */
  defaultExpanded?: boolean
  /** Callback when state changes */
  onToggle?: (expanded: boolean) => void
  /** Disable interaction */
  disabled?: boolean
  /** Collapsible content */
  children: React.ReactNode
}

const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  (
    {
      className,
      title,
      expanded: controlledExpanded,
      defaultExpanded = false,
      onToggle,
      size = "default",
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded)
    const isControlled = controlledExpanded !== undefined
    const isExpanded = isControlled ? controlledExpanded : internalExpanded
    const contentRef = React.useRef<HTMLDivElement>(null)
    const [contentHeight, setContentHeight] = React.useState<number | undefined>(undefined)

    React.useEffect(() => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight)
      }
    }, [isExpanded, children])

    const handleToggle = React.useCallback(() => {
      if (disabled) return
      const newExpanded = !isExpanded
      if (!isControlled) {
        setInternalExpanded(newExpanded)
      }
      onToggle?.(newExpanded)
    }, [disabled, isExpanded, isControlled, onToggle])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (disabled) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          handleToggle()
        }
      },
      [disabled, handleToggle]
    )

    const id = React.useId()
    const headerId = `collapse-header-${id}`
    const contentId = `collapse-content-${id}`

    return (
      <div
        ref={ref}
        className={cn(collapseVariants({ size }), className)}
        {...props}
      >
        <button
          type="button"
          id={headerId}
          className={cn(collapseHeaderVariants({ size, disabled }))}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          disabled={disabled}
        >
          <span className="font-medium text-[var(--ds-gray-1000)]">{title}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-[var(--ds-gray-600)] transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
        <div
          id={contentId}
          role="region"
          aria-labelledby={headerId}
          className={cn(collapseContentVariants({ size }))}
          style={{
            height: isExpanded ? contentHeight : 0,
            opacity: isExpanded ? 1 : 0,
          }}
        >
          <div ref={contentRef} className={cn(collapseContentInnerVariants({ size }))}>
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Collapse.displayName = "Collapse"

export interface CollapseGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Allow multiple items to be expanded at once */
  allowMultiple?: boolean
  /** Children should be Collapse components */
  children: React.ReactNode
}

const CollapseGroup = React.forwardRef<HTMLDivElement, CollapseGroupProps>(
  ({ className, allowMultiple = true, children, ...props }, ref) => {
    const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null)

    const enhancedChildren = React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child
      if (!allowMultiple) {
        return React.cloneElement(child as React.ReactElement<CollapseProps>, {
          expanded: expandedIndex === index,
          onToggle: (expanded: boolean) => {
            setExpandedIndex(expanded ? index : null)
            const originalOnToggle = (child as React.ReactElement<CollapseProps>).props.onToggle
            originalOnToggle?.(expanded)
          },
        })
      }
      return child
    })

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col [&>*+*]:border-t-0 [&>*:first-child]:rounded-t-lg [&>*:last-child]:rounded-b-lg [&>*:not(:first-child):not(:last-child)]:rounded-none",
          className
        )}
        {...props}
      >
        {enhancedChildren}
      </div>
    )
  }
)
CollapseGroup.displayName = "CollapseGroup"

export {
  Collapse,
  CollapseGroup,
  collapseVariants,
  collapseHeaderVariants,
  collapseContentVariants,
}
