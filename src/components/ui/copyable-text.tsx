"use client";

import { useState } from "react";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, CheckCircle } from "lucide-react";

interface CopyableTextProps {
  /** Text to display and copy */
  text: string;
  /** Display text (if different from copy text) */
  displayText?: string;
  /** Whether to show as monospace/code */
  mono?: boolean;
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Additional class names */
  className?: string;
  /** Tooltip text when not copied */
  tooltipText?: string;
  /** Tooltip text after copying */
  copiedText?: string;
  /** Duration to show copied state (ms) */
  copiedDuration?: number;
}

/**
 * Text component with copy-to-clipboard functionality
 * Inspired by Saleor's CopyableText pattern
 * 
 * @example
 * ```tsx
 * <CopyableText text={order.orderNumber} mono />
 * <CopyableText text={customer.email} tooltipText="Copy email" />
 * ```
 */
export function CopyableText({
  text,
  displayText,
  mono = false,
  size = "default",
  className,
  tooltipText = "Click to copy",
  copiedText = "Copied!",
  copiedDuration = 2000,
}: CopyableTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), copiedDuration);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const sizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "inline-flex items-center gap-1.5 group cursor-pointer",
              "hover:text-primary transition-colors",
              sizeClasses[size],
              mono && "font-mono",
              className
            )}
          >
            <span className={cn(mono && "bg-muted px-1.5 py-0.5 rounded")}>
              {displayText || text}
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              {copied ? (
                <CheckCircle
                  className="w-3.5 h-3.5 text-[color:var(--ds-green-700)]"
                />
              ) : (
                <Copy
                  className="w-3.5 h-3.5 text-muted-foreground"
                />
              )}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? copiedText : tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Inline copy button (just the icon)
 */
interface CopyButtonProps {
  text: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function CopyButton({ text, size = "default", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const sizeClasses = {
    sm: "h-6 w-6",
    default: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    default: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(sizeClasses[size], className)}
            onClick={handleCopy}
          >
            {copied ? (
              <CheckCircle
                className={cn(iconSizes[size], "text-[color:var(--ds-green-700)]")}
              />
            ) : (
              <Copy
                className={iconSizes[size]}
              />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copied!" : "Copy"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

CopyableText.displayName = "CopyableText";
CopyButton.displayName = "CopyButton";
