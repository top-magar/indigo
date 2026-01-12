"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/shared/utils";

const showMoreVariants = cva("relative", {
  variants: {
    variant: {
      default: "",
      inline: "inline",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const showMoreButtonVariants = cva(
  "inline-flex items-center gap-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-700)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "text-[var(--ds-blue-700)] dark:text-[var(--ds-blue-500)] hover:text-[var(--ds-blue-800)] dark:hover:text-[var(--ds-blue-400)]",
        subtle:
          "text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-400)] hover:text-[var(--ds-gray-900)] dark:hover:text-[var(--ds-gray-200)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ShowMoreProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onToggle">,
    VariantProps<typeof showMoreVariants> {
  maxHeight?: number;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  moreLabel?: string;
  lessLabel?: string;
  buttonVariant?: "default" | "subtle";
}

const ShowMoreContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    maxHeight?: number;
    expanded?: boolean;
  }
>(({ className, maxHeight = 200, expanded = false, children, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "overflow-hidden transition-all duration-300 ease-in-out",
      className
    )}
    style={{
      maxHeight: expanded ? "none" : `${maxHeight}px`,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
));
ShowMoreContent.displayName = "ShowMoreContent";

const ShowMoreGradient = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    visible?: boolean;
  }
>(({ className, visible = true, ...props }, ref) => {
  if (!visible) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute bottom-0 left-0 right-0 h-16 pointer-events-none",
        "bg-gradient-to-t from-[var(--ds-background-100)] dark:from-[var(--ds-gray-950)] to-transparent",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
});
ShowMoreGradient.displayName = "ShowMoreGradient";

const ShowMoreButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    expanded?: boolean;
    moreLabel?: string;
    lessLabel?: string;
    buttonVariant?: "default" | "subtle";
  }
>(
  (
    {
      className,
      expanded = false,
      moreLabel = "Show more",
      lessLabel = "Show less",
      buttonVariant = "default",
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type="button"
      className={cn(showMoreButtonVariants({ variant: buttonVariant }), className)}
      aria-expanded={expanded}
      {...props}
    >
      {expanded ? (
        <>
          {lessLabel}
          <ChevronUp className="size-4" aria-hidden="true" />
        </>
      ) : (
        <>
          {moreLabel}
          <ChevronDown className="size-4" aria-hidden="true" />
        </>
      )}
    </button>
  )
);
ShowMoreButton.displayName = "ShowMoreButton";

const ShowMore = React.forwardRef<HTMLDivElement, ShowMoreProps>(
  (
    {
      className,
      children,
      maxHeight = 200,
      expanded: controlledExpanded,
      defaultExpanded = false,
      onToggle,
      moreLabel = "Show more",
      lessLabel = "Show less",
      buttonVariant = "default",
      variant,
      ...props
    },
    ref
  ) => {
    const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [needsToggle, setNeedsToggle] = React.useState(false);

    const isControlled = controlledExpanded !== undefined;
    const expanded = isControlled ? controlledExpanded : internalExpanded;

    React.useEffect(() => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        setNeedsToggle(contentHeight > maxHeight);
      }
    }, [children, maxHeight]);

    const handleToggle = () => {
      const newExpanded = !expanded;
      if (!isControlled) {
        setInternalExpanded(newExpanded);
      }
      onToggle?.(newExpanded);
    };

    return (
      <div
        ref={ref}
        className={cn(showMoreVariants({ variant }), className)}
        {...props}
      >
        <ShowMoreContent
          ref={contentRef}
          maxHeight={maxHeight}
          expanded={expanded}
        >
          {children}
        </ShowMoreContent>
        {needsToggle && !expanded && <ShowMoreGradient visible={!expanded} />}
        {needsToggle && (
          <div className="mt-2">
            <ShowMoreButton
              expanded={expanded}
              moreLabel={moreLabel}
              lessLabel={lessLabel}
              buttonVariant={buttonVariant}
              onClick={handleToggle}
            />
          </div>
        )}
      </div>
    );
  }
);
ShowMore.displayName = "ShowMore";

export {
  ShowMore,
  ShowMoreContent,
  ShowMoreGradient,
  ShowMoreButton,
  showMoreVariants,
  showMoreButtonVariants,
};
