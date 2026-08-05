import { forwardRef, type ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("lv2-badge", {
  variants: {
    variant: {
      default: "lv2-badge--default",
      accent: "lv2-badge--accent",
      success: "lv2-badge--success",
      warning: "lv2-badge--warning",
      danger: "lv2-badge--danger",
      ghost: "lv2-badge--ghost",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

/**
 * Small status/label pill.
 *
 * Variants are expressed as `lv2-*` class hooks (`lv2-badge--default`,
 * `lv2-badge--accent`, `lv2-badge--success`, `lv2-badge--warning`,
 * `lv2-badge--danger`, `lv2-badge--ghost`) so the landing-v2 stylesheet owns
 * all color and typography. Only inline layout hook (`inline-flex`) is applied
 * here.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), "inline-flex", className)}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";
