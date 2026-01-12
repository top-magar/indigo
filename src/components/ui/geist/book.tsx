"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

const bookVariants = cva(
  "flex flex-col rounded-xl overflow-hidden border transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-900)] border-[var(--ds-gray-200)] dark:border-[var(--ds-gray-800)]",
        textured:
          "bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-900)] border-[var(--ds-gray-200)] dark:border-[var(--ds-gray-800)]",
      },
      width: {
        auto: "w-auto",
        full: "w-full",
      },
      responsive: {
        true: "w-full max-w-[400px] md:max-w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      width: "auto",
      responsive: false,
    },
  }
);

const bookIllustrationVariants = cva(
  "relative flex items-center justify-center overflow-hidden",
  {
    variants: {
      hasColor: {
        true: "",
        false: "bg-[var(--ds-gray-100)] dark:bg-[var(--ds-gray-800)]",
      },
    },
    defaultVariants: {
      hasColor: false,
    },
  }
);

const bookContentVariants = cva("flex flex-col gap-1 p-4", {
  variants: {
    variant: {
      default: "",
      textured: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BookProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "color">,
    VariantProps<typeof bookVariants> {
  /** Book title */
  title: string;
  /** Book description */
  description?: string;
  /** Custom illustration/image to display */
  illustration?: React.ReactNode;
  /** Custom background color for illustration area */
  color?: string;
  /** Enable textured background effect */
  textured?: boolean;
  /** Custom width in pixels (overrides width variant) */
  customWidth?: number;
  /** Link destination - wraps component in anchor */
  href?: string;
}

/**
 * Book component - Content card display for articles, documentation, or featured content
 *
 * @example
 * ```tsx
 * <Book
 *   title="Getting Started"
 *   description="Learn the basics of our platform"
 *   illustration={<BookIcon />}
 *   color="#0070f3"
 *   href="/docs/getting-started"
 * />
 * ```
 */
const Book = React.forwardRef<HTMLDivElement, BookProps>(
  (
    {
      className,
      variant: variantProp,
      width = "auto",
      responsive = false,
      title,
      description,
      illustration,
      color,
      textured = false,
      customWidth,
      href,
      style,
      ...props
    },
    ref
  ) => {
    const variant = textured ? "textured" : variantProp || "default";

    const bookContent = (
      <div
        ref={ref}
        className={cn(
          bookVariants({ variant, width: customWidth ? undefined : width, responsive }),
          "group",
          href && "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg",
          className
        )}
        style={{
          width: customWidth ? `${customWidth}px` : undefined,
          ...style,
        }}
        {...props}
      >
        {illustration && (
          <div
            className={cn(
              bookIllustrationVariants({ hasColor: !!color }),
              "min-h-[140px]"
            )}
            style={{
              backgroundColor: color || undefined,
            }}
          >
            {textured && (
              <div
                className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundSize: "cover",
                }}
                aria-hidden="true"
              />
            )}
            <div className="relative z-10">{illustration}</div>
          </div>
        )}

        <div className={cn(bookContentVariants({ variant }))}>
          <h3
            className={cn(
              "text-base font-semibold leading-tight",
              "text-[var(--ds-gray-1000)] dark:text-[var(--ds-gray-100)]",
              href && "group-hover:text-[var(--ds-blue-900)] dark:group-hover:text-[var(--ds-blue-400)]"
            )}
          >
            {title}
          </h3>
          {description && (
            <p
              className={cn(
                "text-sm leading-relaxed",
                "text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-400)]"
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    );

    if (href) {
      return (
        <a
          href={href}
          className="block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
        >
          {bookContent}
        </a>
      );
    }

    return bookContent;
  }
);
Book.displayName = "Book";

export { Book, bookVariants };
