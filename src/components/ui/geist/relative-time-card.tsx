"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

const relativeTimeCardVariants = cva(
  "relative inline-block cursor-default",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const popoverVariants = cva(
  "absolute z-50 rounded-lg border border-[var(--ds-gray-200)] dark:border-[var(--ds-gray-800)] bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-900)] px-2.5 py-1.5 text-xs shadow-lg",
  {
    variants: {
      position: {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
      },
    },
    defaultVariants: {
      position: "top",
    },
  }
);

export interface RelativeTimeCardProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof relativeTimeCardVariants> {
  /** Date to display */
  date: Date;
  /** Locale for formatting */
  locale?: string;
  /** Popover position */
  popoverPosition?: "top" | "bottom";
}

function formatRelativeTime(date: Date, locale: string = "en-US"): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, "second");
  } else if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, "minute");
  } else if (diffInHours < 24) {
    return rtf.format(-diffInHours, "hour");
  } else if (diffInDays < 7) {
    return rtf.format(-diffInDays, "day");
  } else if (diffInWeeks < 4) {
    return rtf.format(-diffInWeeks, "week");
  } else if (diffInMonths < 12) {
    return rtf.format(-diffInMonths, "month");
  } else {
    return rtf.format(-diffInYears, "year");
  }
}

function formatFullDateTime(date: Date, locale: string = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "long",
  }).format(date);
}

const RelativeTimeCard = React.forwardRef<HTMLSpanElement, RelativeTimeCardProps>(
  (
    { className, date, locale = "en-US", size = "md", popoverPosition = "top", ...props },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [relativeTime, setRelativeTime] = React.useState(() =>
      formatRelativeTime(date, locale)
    );

    // Update relative time periodically
    React.useEffect(() => {
      const updateTime = () => {
        setRelativeTime(formatRelativeTime(date, locale));
      };

      // Update every minute
      const interval = setInterval(updateTime, 60000);
      return () => clearInterval(interval);
    }, [date, locale]);

    const fullDateTime = formatFullDateTime(date, locale);

    return (
      <span
        ref={ref}
        className={cn(relativeTimeCardVariants({ size }), className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        tabIndex={0}
        role="time"
        aria-label={fullDateTime}
        {...props}
      >
        <span className="text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-400)]">
          {relativeTime}
        </span>
        {isHovered && (
          <span
            className={cn(popoverVariants({ position: popoverPosition }))}
            role="tooltip"
          >
            <span className="whitespace-nowrap text-[var(--ds-gray-1000)] dark:text-[var(--ds-gray-100)]">
              {fullDateTime}
            </span>
          </span>
        )}
      </span>
    );
  }
);
RelativeTimeCard.displayName = "RelativeTimeCard";

export { RelativeTimeCard, relativeTimeCardVariants };
