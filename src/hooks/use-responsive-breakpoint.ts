"use client";

import * as React from "react";

/**
 * Responsive breakpoint types
 */
export type Breakpoint = "mobile" | "tablet" | "desktop";

/**
 * Breakpoint configuration
 */
export const BREAKPOINT_VALUES = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
} as const;

/**
 * Options for the useResponsiveBreakpoint hook
 */
export interface UseResponsiveBreakpointOptions {
  /** Default breakpoint for SSR (default: 'desktop') */
  defaultBreakpoint?: Breakpoint;
  /** Custom breakpoint values */
  breakpoints?: {
    tablet?: number;
    desktop?: number;
  };
}

/**
 * Return type for the useResponsiveBreakpoint hook
 */
export interface UseResponsiveBreakpointReturn {
  /** Current breakpoint */
  breakpoint: Breakpoint;
  /** Whether the current breakpoint is mobile */
  isMobile: boolean;
  /** Whether the current breakpoint is tablet */
  isTablet: boolean;
  /** Whether the current breakpoint is desktop */
  isDesktop: boolean;
  /** Whether the device supports touch */
  isTouchDevice: boolean;
  /** Current window width (0 during SSR) */
  width: number;
}

/**
 * Get breakpoint from width
 */
function getBreakpointFromWidth(
  width: number,
  tabletBreakpoint: number,
  desktopBreakpoint: number
): Breakpoint {
  if (width >= desktopBreakpoint) return "desktop";
  if (width >= tabletBreakpoint) return "tablet";
  return "mobile";
}

/**
 * Check if device supports touch
 */
function checkIsTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - msMaxTouchPoints is IE-specific
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Hook that returns the current responsive breakpoint
 * Uses window.matchMedia for efficient updates
 * SSR-safe with configurable default value
 *
 * @example
 * ```tsx
 * const { breakpoint, isMobile, isTablet, isDesktop } = useResponsiveBreakpoint();
 *
 * return (
 *   <div className={isMobile ? 'flex-col' : 'flex-row'}>
 *     {breakpoint === 'mobile' && <MobileNav />}
 *     {breakpoint === 'desktop' && <DesktopNav />}
 *   </div>
 * );
 * ```
 */
export function useResponsiveBreakpoint(
  options: UseResponsiveBreakpointOptions = {}
): UseResponsiveBreakpointReturn {
  const {
    defaultBreakpoint = "desktop",
    breakpoints = {},
  } = options;

  const tabletBreakpoint = breakpoints.tablet ?? BREAKPOINT_VALUES.tablet;
  const desktopBreakpoint = breakpoints.desktop ?? BREAKPOINT_VALUES.desktop;

  // Initialize with default for SSR
  const [state, setState] = React.useState<{
    breakpoint: Breakpoint;
    width: number;
    isTouchDevice: boolean;
  }>({
    breakpoint: defaultBreakpoint,
    width: 0,
    isTouchDevice: false,
  });

  React.useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") return;

    // Initial values
    const initialWidth = window.innerWidth;
    const initialBreakpoint = getBreakpointFromWidth(
      initialWidth,
      tabletBreakpoint,
      desktopBreakpoint
    );
    const initialIsTouchDevice = checkIsTouchDevice();

    setState({
      breakpoint: initialBreakpoint,
      width: initialWidth,
      isTouchDevice: initialIsTouchDevice,
    });

    // Create media queries for each breakpoint transition
    const tabletQuery = window.matchMedia(`(min-width: ${tabletBreakpoint}px)`);
    const desktopQuery = window.matchMedia(`(min-width: ${desktopBreakpoint}px)`);

    // Handler for media query changes
    const handleChange = () => {
      const newWidth = window.innerWidth;
      const newBreakpoint = getBreakpointFromWidth(
        newWidth,
        tabletBreakpoint,
        desktopBreakpoint
      );

      setState((prev) => {
        if (prev.breakpoint === newBreakpoint && prev.width === newWidth) {
          return prev;
        }
        return {
          ...prev,
          breakpoint: newBreakpoint,
          width: newWidth,
        };
      });
    };

    // Add listeners
    tabletQuery.addEventListener("change", handleChange);
    desktopQuery.addEventListener("change", handleChange);

    // Also listen to resize for width updates
    window.addEventListener("resize", handleChange);

    // Cleanup
    return () => {
      tabletQuery.removeEventListener("change", handleChange);
      desktopQuery.removeEventListener("change", handleChange);
      window.removeEventListener("resize", handleChange);
    };
  }, [tabletBreakpoint, desktopBreakpoint]);

  return {
    breakpoint: state.breakpoint,
    isMobile: state.breakpoint === "mobile",
    isTablet: state.breakpoint === "tablet",
    isDesktop: state.breakpoint === "desktop",
    isTouchDevice: state.isTouchDevice,
    width: state.width,
  };
}

/**
 * Simple hook that just returns the current breakpoint string
 */
export function useBreakpoint(
  defaultBreakpoint: Breakpoint = "desktop"
): Breakpoint {
  const { breakpoint } = useResponsiveBreakpoint({ defaultBreakpoint });
  return breakpoint;
}

/**
 * Hook that returns true if the current breakpoint matches or is larger than the specified breakpoint
 */
export function useMinBreakpoint(
  minBreakpoint: Breakpoint,
  defaultValue = true
): boolean {
  const { breakpoint } = useResponsiveBreakpoint({
    defaultBreakpoint: defaultValue ? "desktop" : "mobile",
  });

  const breakpointOrder: Breakpoint[] = ["mobile", "tablet", "desktop"];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  const minIndex = breakpointOrder.indexOf(minBreakpoint);

  return currentIndex >= minIndex;
}

/**
 * Hook that returns true if the current breakpoint matches or is smaller than the specified breakpoint
 */
export function useMaxBreakpoint(
  maxBreakpoint: Breakpoint,
  defaultValue = true
): boolean {
  const { breakpoint } = useResponsiveBreakpoint({
    defaultBreakpoint: defaultValue ? "mobile" : "desktop",
  });

  const breakpointOrder: Breakpoint[] = ["mobile", "tablet", "desktop"];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  const maxIndex = breakpointOrder.indexOf(maxBreakpoint);

  return currentIndex <= maxIndex;
}
