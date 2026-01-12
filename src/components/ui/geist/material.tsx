"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";
import { Stack, type StackProps } from "./stack";

const materialVariants = cva(
  [
    "bg-[var(--ds-background-100)]",
    "rounded-[var(--ds-radius-medium)]",
    "transition-shadow duration-150 ease-in-out",
  ],
  {
    variants: {
      type: {
        sm: [
          "shadow-[var(--shadow-geist-small)]",
          "dark:border dark:border-[var(--ds-gray-alpha-200)]",
        ],
        md: [
          "shadow-[var(--shadow-geist-medium)]",
          "dark:border dark:border-[var(--ds-gray-alpha-200)]",
        ],
        lg: [
          "shadow-[var(--shadow-geist-large)]",
          "dark:border dark:border-[var(--ds-gray-alpha-200)]",
        ],
        tooltip: [
          "shadow-[var(--shadow-geist-tooltip)]",
          "border border-[var(--ds-gray-alpha-400)]",
          "rounded-[6px]",
        ],
        menu: [
          "shadow-[var(--shadow-geist-menu)]",
          "border border-[var(--ds-gray-alpha-400)]",
          "rounded-[12px]",
        ],
        modal: [
          "shadow-[var(--shadow-geist-modal)]",
          "border border-[var(--ds-gray-alpha-400)]",
          "rounded-[12px]",
        ],
      },
    },
    defaultVariants: {
      type: "md",
    },
  }
);

export interface MaterialProps
  extends Omit<StackProps, "as">,
    VariantProps<typeof materialVariants> {}

/**
 * Material - Surface component with various shadow depths
 *
 * Built on top of Stack component, providing elevated surfaces with
 * consistent shadow treatments following Geist design system.
 *
 * @example
 * ```tsx
 * // Basic usage with default shadow
 * <Material>
 *   <p>Content with medium shadow</p>
 * </Material>
 *
 * // Small shadow for subtle elevation
 * <Material type="sm" padding={4}>
 *   <p>Subtle elevated content</p>
 * </Material>
 *
 * // Menu-style surface
 * <Material type="menu" gap={2}>
 *   <MenuItem>Option 1</MenuItem>
 *   <MenuItem>Option 2</MenuItem>
 * </Material>
 *
 * // Modal-style surface with Stack props
 * <Material type="modal" direction="vertical" gap={4} align="center">
 *   <h2>Modal Title</h2>
 *   <p>Modal content</p>
 * </Material>
 * ```
 */
const Material = React.forwardRef<HTMLDivElement, MaterialProps>(
  ({ className, type = "md", children, ...stackProps }, ref) => {
    return (
      <Stack
        ref={ref}
        className={cn(materialVariants({ type }), className)}
        {...stackProps}
      >
        {children}
      </Stack>
    );
  }
);
Material.displayName = "Material";

export { Material, materialVariants };
