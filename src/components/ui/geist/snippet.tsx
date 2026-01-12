"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Copy, Check } from "lucide-react"

import { cn } from "@/shared/utils"

const snippetVariants = cva(
  "relative flex items-center gap-2 rounded-lg border font-mono text-sm transition-colors",
  {
    variants: {
      dark: {
        true: "bg-[oklch(0.145_0_0)] text-[oklch(0.985_0_0)] border-[oklch(1_0_0/10%)]",
        false: "bg-muted/50 text-foreground border-border",
      },
    },
    defaultVariants: {
      dark: false,
    },
  }
)

export interface SnippetProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof snippetVariants> {
  /** Command text (string or array of strings for multiple lines) */
  text: string | string[]
  /** Prompt character */
  prompt?: string
  /** Custom width */
  width?: string
}

const Snippet = React.forwardRef<HTMLDivElement, SnippetProps>(
  ({ className, text, prompt = "$", dark = false, width, style, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false)
    const lines = Array.isArray(text) ? text : [text]
    const fullText = lines.join("\n")

    const handleCopy = React.useCallback(async () => {
      try {
        await navigator.clipboard.writeText(fullText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy text:", err)
      }
    }, [fullText])

    return (
      <div
        ref={ref}
        className={cn(snippetVariants({ dark }), className)}
        style={{ width, ...style }}
        {...props}
      >
        <div className="flex-1 overflow-x-auto px-3 py-2">
          {lines.map((line, index) => (
            <div key={index} className="flex items-center gap-2 whitespace-nowrap">
              <span
                className={cn(
                  "select-none",
                  dark ? "text-[oklch(0.708_0_0)]" : "text-muted-foreground"
                )}
                aria-hidden="true"
              >
                {prompt}
              </span>
              <code className="flex-1">{line}</code>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex shrink-0 items-center justify-center p-2 transition-colors",
            "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            dark && "hover:bg-[oklch(1_0_0/10%)]"
          )}
          aria-label={copied ? "Copied" : "Copy to clipboard"}
        >
          {copied ? (
            <Check className="size-4 text-[oklch(0.627_0.194_149.214)]" aria-hidden="true" />
          ) : (
            <Copy
              className={cn(
                "size-4",
                dark ? "text-[oklch(0.708_0_0)]" : "text-muted-foreground"
              )}
              aria-hidden="true"
            />
          )}
        </button>
        {/* Screen reader announcement */}
        <span className="sr-only" role="status" aria-live="polite">
          {copied ? "Copied to clipboard" : ""}
        </span>
      </div>
    )
  }
)
Snippet.displayName = "Snippet"

export { Snippet, snippetVariants }
