"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils";

const scrollerVariants = cva("relative", {
  variants: {
    direction: {
      horizontal: "",
      vertical: "",
      free: "",
    },
    hideScrollbar: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    direction: "horizontal",
    hideScrollbar: true,
  },
});

const scrollerContentVariants = cva(
  "scroll-smooth",
  {
    variants: {
      direction: {
        horizontal: "flex overflow-x-auto overflow-y-hidden",
        vertical: "flex flex-col overflow-y-auto overflow-x-hidden",
        free: "overflow-auto",
      },
      hideScrollbar: {
        true: "scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        false: "",
      },
      scrollBehavior: {
        smooth: "scroll-smooth",
        auto: "scroll-auto",
      },
    },
    defaultVariants: {
      direction: "horizontal",
      hideScrollbar: true,
      scrollBehavior: "smooth",
    },
  }
);

const scrollerButtonVariants = cva(
  "absolute z-10 flex items-center justify-center rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-700)] focus-visible:ring-offset-2 disabled:pointer-events-none",
  {
    variants: {
      position: {
        inside: "",
        outside: "",
      },
      size: {
        sm: "size-7 [&_svg]:size-3.5",
        md: "size-8 [&_svg]:size-4",
        lg: "size-10 [&_svg]:size-5",
      },
      visible: {
        true: "opacity-100",
        false: "opacity-0 pointer-events-none",
      },
    },
    defaultVariants: {
      position: "inside",
      size: "md",
      visible: true,
    },
  }
);

export interface ScrollerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onScroll">,
    VariantProps<typeof scrollerVariants> {
  /** Scroll direction */
  direction?: "horizontal" | "vertical" | "free";
  /** Show navigation buttons */
  showButtons?: boolean;
  /** Button placement */
  buttonPosition?: "inside" | "outside";
  /** Scroll animation behavior */
  scrollBehavior?: "smooth" | "auto";
  /** Hide native scrollbar */
  hideScrollbar?: boolean;
  /** Scroll event callback */
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  /** Index of child to scroll to */
  scrollToChild?: number;
  /** Button size */
  buttonSize?: "sm" | "md" | "lg";
  /** Show gradient fade edges */
  showGradients?: boolean;
}


const Scroller = React.forwardRef<HTMLDivElement, ScrollerProps>(
  (
    {
      className,
      children,
      direction = "horizontal",
      showButtons = true,
      buttonPosition = "inside",
      scrollBehavior = "smooth",
      hideScrollbar = true,
      onScroll,
      scrollToChild,
      buttonSize = "md",
      showGradients = true,
      ...props
    },
    ref
  ) => {
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const checkScrollBounds = React.useCallback(() => {
      const container = contentRef.current;
      if (!container) return;

      if (direction === "horizontal" || direction === "free") {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        setCanScrollPrev(scrollLeft > 1);
        setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 1);
      } else if (direction === "vertical") {
        const { scrollTop, scrollHeight, clientHeight } = container;
        setCanScrollPrev(scrollTop > 1);
        setCanScrollNext(scrollTop < scrollHeight - clientHeight - 1);
      }
    }, [direction]);

    React.useEffect(() => {
      checkScrollBounds();
      const container = contentRef.current;
      if (!container) return;

      const resizeObserver = new ResizeObserver(checkScrollBounds);
      resizeObserver.observe(container);

      return () => resizeObserver.disconnect();
    }, [checkScrollBounds, children]);

    React.useEffect(() => {
      if (scrollToChild !== undefined && contentRef.current) {
        const container = contentRef.current;
        const child = container.children[scrollToChild] as HTMLElement;
        if (child) {
          child.scrollIntoView({
            behavior: scrollBehavior,
            block: direction === "vertical" ? "nearest" : "center",
            inline: direction === "horizontal" ? "nearest" : "center",
          });
        }
      }
    }, [scrollToChild, scrollBehavior, direction]);

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
      checkScrollBounds();
      onScroll?.(event);
    };

    const scrollPrev = () => {
      const container = contentRef.current;
      if (!container) return;

      const scrollAmount = direction === "vertical" 
        ? container.clientHeight * 0.8 
        : container.clientWidth * 0.8;

      if (direction === "vertical") {
        container.scrollBy({ top: -scrollAmount, behavior: scrollBehavior });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: scrollBehavior });
      }
    };

    const scrollNext = () => {
      const container = contentRef.current;
      if (!container) return;

      const scrollAmount = direction === "vertical" 
        ? container.clientHeight * 0.8 
        : container.clientWidth * 0.8;

      if (direction === "vertical") {
        container.scrollBy({ top: scrollAmount, behavior: scrollBehavior });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: scrollBehavior });
      }
    };

    const buttonBaseClasses = cn(
      "bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-900)]",
      "border-[var(--ds-gray-400)] dark:border-[var(--ds-gray-700)]",
      "text-[var(--ds-gray-900)] dark:text-[var(--ds-gray-200)]",
      "hover:bg-[var(--ds-gray-100)] dark:hover:bg-[var(--ds-gray-800)]",
      "hover:border-[var(--ds-gray-500)] dark:hover:border-[var(--ds-gray-600)]",
      "shadow-sm"
    );

    const getPrevButtonPosition = () => {
      if (direction === "vertical") {
        return buttonPosition === "inside"
          ? "top-2 left-1/2 -translate-x-1/2"
          : "-top-10 left-1/2 -translate-x-1/2";
      }
      return buttonPosition === "inside"
        ? "left-2 top-1/2 -translate-y-1/2"
        : "-left-10 top-1/2 -translate-y-1/2";
    };

    const getNextButtonPosition = () => {
      if (direction === "vertical") {
        return buttonPosition === "inside"
          ? "bottom-2 left-1/2 -translate-x-1/2"
          : "-bottom-10 left-1/2 -translate-x-1/2";
      }
      return buttonPosition === "inside"
        ? "right-2 top-1/2 -translate-y-1/2"
        : "-right-10 top-1/2 -translate-y-1/2";
    };

    const PrevIcon = direction === "vertical" ? ChevronUp : ChevronLeft;
    const NextIcon = direction === "vertical" ? ChevronDown : ChevronRight;

    return (
      <div
        ref={ref}
        className={cn(
          scrollerVariants({ direction, hideScrollbar }),
          buttonPosition === "outside" && (direction === "horizontal" || direction === "free") && "mx-10",
          buttonPosition === "outside" && direction === "vertical" && "my-10",
          className
        )}
        {...props}
      >
        {/* Gradient fade - start */}
        {showGradients && canScrollPrev && (
          <div
            className={cn(
              "absolute z-[5] pointer-events-none",
              direction === "vertical"
                ? "top-0 left-0 right-0 h-10 bg-gradient-to-b from-[var(--ds-background-100)] dark:from-[var(--ds-gray-950)] to-transparent"
                : "left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[var(--ds-background-100)] dark:from-[var(--ds-gray-950)] to-transparent"
            )}
            aria-hidden="true"
          />
        )}

        {/* Scrollable content */}
        <div
          ref={contentRef}
          className={cn(
            scrollerContentVariants({
              direction,
              hideScrollbar,
              scrollBehavior,
            })
          )}
          onScroll={handleScroll}
        >
          {children}
        </div>

        {/* Gradient fade - end */}
        {showGradients && canScrollNext && (
          <div
            className={cn(
              "absolute z-[5] pointer-events-none",
              direction === "vertical"
                ? "bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[var(--ds-background-100)] dark:from-[var(--ds-gray-950)] to-transparent"
                : "right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[var(--ds-background-100)] dark:from-[var(--ds-gray-950)] to-transparent"
            )}
            aria-hidden="true"
          />
        )}

        {/* Navigation buttons */}
        {showButtons && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              className={cn(
                scrollerButtonVariants({
                  position: buttonPosition,
                  size: buttonSize,
                  visible: canScrollPrev,
                }),
                buttonBaseClasses,
                getPrevButtonPosition()
              )}
              aria-label={direction === "vertical" ? "Scroll up" : "Scroll left"}
              disabled={!canScrollPrev}
            >
              <PrevIcon aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className={cn(
                scrollerButtonVariants({
                  position: buttonPosition,
                  size: buttonSize,
                  visible: canScrollNext,
                }),
                buttonBaseClasses,
                getNextButtonPosition()
              )}
              aria-label={direction === "vertical" ? "Scroll down" : "Scroll right"}
              disabled={!canScrollNext}
            >
              <NextIcon aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    );
  }
);
Scroller.displayName = "Scroller";

export { Scroller, scrollerVariants, scrollerContentVariants, scrollerButtonVariants };
