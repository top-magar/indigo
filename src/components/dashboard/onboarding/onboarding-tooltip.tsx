"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils";
import type { OnboardingTipId } from "@/shared/hooks/use-onboarding";

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface OnboardingTooltipProps {
  /** Unique identifier for this tip */
  tipId: OnboardingTipId;
  /** The tip text to display */
  content: string;
  /** Optional title for the tooltip */
  title?: string;
  /** Position of the tooltip relative to the target */
  position?: TooltipPosition;
  /** Whether the tip has been dismissed */
  isDismissed: boolean;
  /** Callback when the tip is dismissed */
  onDismiss: () => void;
  /** CSS selector or ref to the target element */
  targetSelector?: string;
  /** Direct ref to target element (alternative to selector) */
  targetRef?: React.RefObject<HTMLElement | null>;
  /** Optional step number for multi-step tours */
  stepNumber?: number;
  /** Total steps in the tour */
  totalSteps?: number;
  /** Custom dismiss button text */
  dismissText?: string;
  /** Whether to show a pulsing highlight on the target */
  highlightTarget?: boolean;
  /** Z-index for the tooltip */
  zIndex?: number;
}

interface TooltipStyles {
  top: number;
  left: number;
  arrowTop?: number;
  arrowLeft?: number;
  arrowRotation: number;
}

const ARROW_SIZE = 8;
const TOOLTIP_OFFSET = 12;

function calculatePosition(
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  position: TooltipPosition
): TooltipStyles {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let top = 0;
  let left = 0;
  let arrowRotation = 0;
  let arrowTop: number | undefined;
  let arrowLeft: number | undefined;

  switch (position) {
    case "top":
      top = targetRect.top - tooltipRect.height - TOOLTIP_OFFSET;
      left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
      arrowRotation = 180;
      arrowLeft = tooltipRect.width / 2 - ARROW_SIZE;
      break;
    case "bottom":
      top = targetRect.bottom + TOOLTIP_OFFSET;
      left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
      arrowRotation = 0;
      arrowLeft = tooltipRect.width / 2 - ARROW_SIZE;
      break;
    case "left":
      top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
      left = targetRect.left - tooltipRect.width - TOOLTIP_OFFSET;
      arrowRotation = 90;
      arrowTop = tooltipRect.height / 2 - ARROW_SIZE;
      break;
    case "right":
      top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
      left = targetRect.right + TOOLTIP_OFFSET;
      arrowRotation = -90;
      arrowTop = tooltipRect.height / 2 - ARROW_SIZE;
      break;
  }

  // Clamp to viewport bounds
  const padding = 16;
  left = Math.max(padding, Math.min(left, viewportWidth - tooltipRect.width - padding));
  top = Math.max(padding, Math.min(top, viewportHeight - tooltipRect.height - padding));

  return { top, left, arrowTop, arrowLeft, arrowRotation };
}

export function OnboardingTooltip({
  tipId,
  content,
  title,
  position = "bottom",
  isDismissed,
  onDismiss,
  targetSelector,
  targetRef,
  stepNumber,
  totalSteps,
  dismissText = "Got it",
  highlightTarget = true,
  zIndex = 9999,
}: OnboardingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [styles, setStyles] = useState<TooltipStyles | null>(null);
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Handle mounting for portal
  useEffect(() => {
    // Use requestAnimationFrame to avoid synchronous setState in effect
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(frame);
      setMounted(false);
    };
  }, []);

  const updatePosition = useCallback(() => {
    let targetElement: HTMLElement | null = null;

    if (targetRef?.current) {
      targetElement = targetRef.current;
    } else if (targetSelector) {
      targetElement = document.querySelector(targetSelector);
    }

    if (!targetElement || !tooltipRef.current) {
      setIsVisible(false);
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const newStyles = calculatePosition(targetRect, tooltipRect, position);
    setStyles(newStyles);
    setIsVisible(true);
  }, [targetSelector, targetRef, position]);

  // Update position on mount and resize
  useEffect(() => {
    if (isDismissed || !mounted) return;

    // Initial position calculation with delay for DOM to settle
    const initialTimer = setTimeout(updatePosition, 100);

    // Update on resize and scroll
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isDismissed, mounted, updatePosition]);

  // Don't render if dismissed or not mounted
  if (isDismissed || !mounted) return null;

  const tooltipContent = (
    <>
      {/* Highlight overlay for target */}
      {highlightTarget && targetSelector && (
        <TargetHighlight selector={targetSelector} zIndex={zIndex - 1} />
      )}
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        role="tooltip"
        aria-label={title || content}
        data-tip-id={tipId}
        className={cn(
          "fixed bg-foreground text-background rounded-lg shadow-lg",
          "max-w-xs p-4 transition-opacity duration-200",
          isVisible && styles ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{
          top: styles?.top ?? -9999,
          left: styles?.left ?? -9999,
          zIndex,
        }}
      >
        {/* Step indicator */}
        {stepNumber !== undefined && totalSteps !== undefined && (
          <div className="text-xs text-background/60 mb-1">
            Step {stepNumber} of {totalSteps}
          </div>
        )}
        
        {/* Title */}
        {title && (
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
        )}
        
        {/* Content */}
        <p className="text-sm text-background/90 mb-3">{content}</p>
        
        {/* Dismiss button */}
        <Button
          size="sm"
          variant="secondary"
          onClick={onDismiss}
          className="w-full bg-background/10 hover:bg-background/20 text-background border-0"
        >
          {dismissText}
        </Button>

        {/* Arrow */}
        <div
          className="absolute w-0 h-0"
          style={{
            top: styles?.arrowTop ?? (position === "bottom" ? -ARROW_SIZE : undefined),
            bottom: position === "top" ? -ARROW_SIZE : undefined,
            left: styles?.arrowLeft ?? undefined,
            right: position === "left" ? -ARROW_SIZE : undefined,
            borderLeft: `${ARROW_SIZE}px solid transparent`,
            borderRight: `${ARROW_SIZE}px solid transparent`,
            borderBottom: position === "bottom" || position === "left" || position === "right" 
              ? `${ARROW_SIZE}px solid hsl(var(--foreground))` 
              : undefined,
            borderTop: position === "top" 
              ? `${ARROW_SIZE}px solid hsl(var(--foreground))` 
              : undefined,
            transform: position === "left" || position === "right" 
              ? `rotate(${styles?.arrowRotation ?? 0}deg)` 
              : undefined,
          }}
        />
      </div>
    </>
  );

  return createPortal(tooltipContent, document.body);
}

// Highlight component for the target element
function TargetHighlight({ selector, zIndex }: { selector: string; zIndex: number }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateRect = () => {
      const element = document.querySelector(selector);
      if (element) {
        setRect(element.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [selector]);

  if (!rect) return null;

  return (
    <div
      className="fixed pointer-events-none"
      style={{
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
        zIndex,
      }}
    >
      {/* Pulsing ring */}
      <div className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse" />
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-lg"
        style={{
          boxShadow: "0 0 0 4px hsl(var(--primary) / 0.2), 0 0 20px hsl(var(--primary) / 0.3)",
        }}
      />
    </div>
  );
}

// Convenience component for controlled tooltips
interface ControlledOnboardingTooltipProps extends Omit<OnboardingTooltipProps, "isDismissed" | "onDismiss"> {
  /** Whether to show the tooltip */
  show: boolean;
  /** Callback when dismissed */
  onDismiss: () => void;
}

export function ControlledOnboardingTooltip({
  show,
  onDismiss,
  ...props
}: ControlledOnboardingTooltipProps) {
  return (
    <OnboardingTooltip
      {...props}
      isDismissed={!show}
      onDismiss={onDismiss}
    />
  );
}
