"use client"

import "../blocks"
import { useEffect } from "react"
import { useEditorStore } from "../store"
import { getBlock } from "../registry"
import { cn } from "@/shared/utils"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

const VIEWPORT_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
} as const

function useGoogleFonts(fonts: string[]) {
  useEffect(() => {
    const unique = [...new Set(fonts.filter((f) => f && f !== "Inter"))]
    if (unique.length === 0) return
    const id = "editor-google-fonts"
    let link = document.getElementById(id) as HTMLLinkElement | null
    const href = `https://fonts.googleapis.com/css2?${unique.map((f) => `family=${f.replace(/ /g, "+")}`).join("&")}&display=swap`
    if (link) {
      link.href = href
    } else {
      link = document.createElement("link")
      link.id = id
      link.rel = "stylesheet"
      link.href = href
      document.head.appendChild(link)
    }
  }, [fonts])
}

export function Canvas() {
  const { sections, selectedId, selectSection, addSection, viewport, theme } = useEditorStore()

  const primaryColor = (theme.primaryColor as string) ?? "#3b82f6"
  const headingFont = (theme.headingFont as string) ?? "Inter"
  const bodyFont = (theme.bodyFont as string) ?? "Inter"
  const borderRadius = (theme.borderRadius as number) ?? 8

  useGoogleFonts([headingFont, bodyFont])

  return (
    <div
      className="h-full overflow-y-auto p-8"
      style={{
        backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) selectSection(null)
      }}
    >
      <div
        className={cn(
          "mx-auto bg-white shadow-sm rounded-lg transition-all duration-200",
          viewport !== 'desktop' && 'shadow-md',
        )}
        style={{
          maxWidth: VIEWPORT_WIDTHS[viewport],
          '--store-color-primary': primaryColor,
          '--store-font-heading': `"${headingFont}", sans-serif`,
          '--store-font-body': `"${bodyFont}", sans-serif`,
          '--store-radius': `${borderRadius}px`,
        } as React.CSSProperties}
      >
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-3">
            <p className="text-sm">Add your first section</p>
            <Button variant="outline" size="sm" onClick={() => addSection('hero')}>
              <Plus className="h-4 w-4 mr-1" />Add Section
            </Button>
          </div>
        ) : (
          <div className="flex flex-col">
            {sections.map((s) => {
              const block = getBlock(s.type)
              if (!block) return null
              const Component = block.component
              return (
                <div
                  key={s.id}
                  className={cn(
                    "group cursor-pointer rounded transition-shadow",
                    selectedId === s.id
                      ? "ring-2 ring-blue-500"
                      : "hover:ring-2 hover:ring-blue-300",
                  )}
                  style={{
                    paddingTop: (s.props._paddingTop as number) || undefined,
                    paddingBottom: (s.props._paddingBottom as number) || undefined,
                    backgroundColor: (s.props._backgroundColor as string) || undefined,
                    maxWidth: (s.props._maxWidth as number) || undefined,
                    marginInline: (s.props._maxWidth as number) ? "auto" : undefined,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    selectSection(s.id)
                  }}
                >
                  <Component {...s.props} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
