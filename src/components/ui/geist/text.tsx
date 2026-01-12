"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

const textVariants = cva("", {
  variants: {
    variant: {
      // Heading variants
      "heading-72": "text-[72px] leading-[1.1] tracking-[-0.04em] font-bold",
      "heading-64": "text-[64px] leading-[1.1] tracking-[-0.04em] font-bold",
      "heading-48": "text-[48px] leading-[1.15] tracking-[-0.03em] font-bold",
      "heading-32": "text-[32px] leading-[1.2] tracking-[-0.02em] font-bold",
      "heading-24": "text-[24px] leading-[1.3] tracking-[-0.02em] font-semibold",
      "heading-20": "text-[20px] leading-[1.4] tracking-[-0.01em] font-semibold",
      "heading-16": "text-[16px] leading-[1.5] tracking-[-0.01em] font-semibold",
      "heading-14": "text-[14px] leading-[1.5] font-semibold",
      // Label variants
      "label-20": "text-[20px] leading-[1.4] font-medium",
      "label-18": "text-[18px] leading-[1.4] font-medium",
      "label-16": "text-[16px] leading-[1.5] font-medium",
      "label-14": "text-[14px] leading-[1.5] font-medium",
      "label-13": "text-[13px] leading-[1.5] font-medium",
      "label-12": "text-[12px] leading-[1.5] font-medium",
      // Copy variants
      "copy-24": "text-[24px] leading-[1.5]",
      "copy-20": "text-[20px] leading-[1.5]",
      "copy-18": "text-[18px] leading-[1.6]",
      "copy-16": "text-[16px] leading-[1.6]",
      "copy-14": "text-[14px] leading-[1.6]",
      "copy-13": "text-[13px] leading-[1.6]",
    },
    color: {
      default: "text-[var(--ds-gray-1000)] dark:text-[var(--ds-gray-100)]",
      muted: "text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-400)]",
      subtle: "text-[var(--ds-gray-600)] dark:text-[var(--ds-gray-500)]",
      success: "text-[var(--ds-green-700)] dark:text-[var(--ds-green-400)]",
      warning: "text-[var(--ds-amber-700)] dark:text-[var(--ds-amber-400)]",
      error: "text-[var(--ds-red-700)] dark:text-[var(--ds-red-400)]",
      info: "text-[var(--ds-blue-700)] dark:text-[var(--ds-blue-400)]",
      inherit: "text-inherit",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    mono: {
      true: "font-mono",
      false: "",
    },
    truncate: {
      true: "truncate",
      false: "",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    variant: "copy-14",
    color: "default",
    mono: false,
    truncate: false,
    align: "left",
  },
});

type TextElement = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "label" | "strong" | "em";

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof textVariants> {
  /** Element type to render */
  as?: TextElement;
}

// Map variants to default semantic elements
const variantElementMap: Record<string, TextElement> = {
  "heading-72": "h1",
  "heading-64": "h1",
  "heading-48": "h2",
  "heading-32": "h2",
  "heading-24": "h3",
  "heading-20": "h4",
  "heading-16": "h5",
  "heading-14": "h6",
  "label-20": "span",
  "label-18": "span",
  "label-16": "span",
  "label-14": "span",
  "label-13": "span",
  "label-12": "span",
  "copy-24": "p",
  "copy-20": "p",
  "copy-18": "p",
  "copy-16": "p",
  "copy-14": "p",
  "copy-13": "p",
};

const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      className,
      variant = "copy-14",
      color = "default",
      weight,
      mono = false,
      truncate = false,
      align = "left",
      as,
      children,
      ...props
    },
    ref
  ) => {
    const Component = as || variantElementMap[variant || "copy-14"] || "span";

    return React.createElement(
      Component,
      {
        ref,
        className: cn(
          textVariants({ variant, color, weight, mono, truncate, align }),
          className
        ),
        ...props,
      },
      children
    );
  }
);
Text.displayName = "Text";

export { Text, textVariants };
