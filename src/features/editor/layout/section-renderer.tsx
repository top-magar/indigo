/**
 * SectionRenderer - Renders enhanced sections with layout modes
 * 
 * Supports:
 * - Stack layout (Shopify-like vertical stacking)
 * - Grid layout (CSS Grid with configurable columns)
 * - Flex layout (Flexbox with wrapping)
 * - Absolute layout (Wix-like freeform positioning)
 */

"use client"

import { memo, useCallback, useMemo } from "react"
import { cn } from "@/shared/utils"
import type { EnhancedSection, EnhancedElement } from "./types"
import { generateSectionCSS } from "./layout-engine"
import { ElementRenderer } from "./element-renderer"
import { useLayoutStore } from "./layout-store"

// =============================================================================
// SECTION RENDERER
// =============================================================================

export interface SectionRendererProps {
  section: EnhancedSection
  isEditing?: boolean
  onElementClick?: (elementId: string, event: React.MouseEvent) => void
  onElementHover?: (elementId: string | null) => void
  renderElement?: (element: EnhancedElement, section: EnhancedSection) => React.ReactNode
  className?: string
}

export const SectionRenderer = memo(function SectionRenderer({
  section,
  isEditing = false,
  onElementClick,
  onElementHover,
  renderElement,
  className,
}: SectionRendererProps) {
  const {
    selectedSectionId,
    selectedElementId,
    hoveredSectionId,
    hoveredElementId,
    selectSection,
    selectElement,
    hoverSection,
    hoverElement,
  } = useLayoutStore()

  // Generate CSS for section
  const sectionStyle = useMemo(() => generateSectionCSS(section), [section])

  // Sort elements by order for stack/flex modes
  const sortedElements = useMemo(() => {
    if (section.layout.mode === "absolute") {
      // For absolute mode, sort by zIndex
      return [...section.elements].sort((a, b) => {
        const aZ = a.position.absolute?.zIndex ?? 0
        const bZ = b.position.absolute?.zIndex ?? 0
        return aZ - bZ
      })
    }
    // For other modes, sort by order
    return [...section.elements].sort((a, b) => {
      const aOrder = a.position.order ?? 0
      const bOrder = b.position.order ?? 0
      return aOrder - bOrder
    })
  }, [section.elements, section.layout.mode])

  // Handle section click
  const handleSectionClick = useCallback((e: React.MouseEvent) => {
    if (!isEditing) return
    e.stopPropagation()
    selectSection(section.id)
    selectElement(null)
  }, [isEditing, section.id, selectSection, selectElement])

  // Handle section hover
  const handleSectionHover = useCallback((hovering: boolean) => {
    if (!isEditing) return
    hoverSection(hovering ? section.id : null)
  }, [isEditing, section.id, hoverSection])

  // Handle element click
  const handleElementClick = useCallback((elementId: string, e: React.MouseEvent) => {
    if (!isEditing) return
    e.stopPropagation()
    selectSection(section.id)
    selectElement(elementId)
    onElementClick?.(elementId, e)
  }, [isEditing, section.id, selectSection, selectElement, onElementClick])

  // Handle element hover
  const handleElementHover = useCallback((elementId: string | null) => {
    if (!isEditing) return
    hoverElement(elementId)
    onElementHover?.(elementId)
  }, [isEditing, hoverElement, onElementHover])

  const isSelected = selectedSectionId === section.id
  const isHovered = hoveredSectionId === section.id && !isSelected

  // Don't render hidden sections (unless editing)
  if (!section.visible && !isEditing) {
    return null
  }

  return (
    <section
      data-section-id={section.id}
      data-section-type={section.type}
      data-layout-mode={section.layout.mode}
      className={cn(
        "relative",
        // Editing states
        isEditing && "cursor-pointer",
        isEditing && isHovered && "ring-2 ring-[var(--ds-blue-400)]/50 ring-offset-2",
        isEditing && isSelected && "ring-2 ring-primary ring-offset-2",
        // Hidden state
        !section.visible && isEditing && "opacity-50",
        // Locked state
        section.locked && "pointer-events-none",
        className
      )}
      style={sectionStyle}
      onClick={handleSectionClick}
      onMouseEnter={() => handleSectionHover(true)}
      onMouseLeave={() => handleSectionHover(false)}
    >
      {/* Background overlay */}
      {section.style.backgroundOverlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: section.style.backgroundOverlay.color,
            opacity: section.style.backgroundOverlay.opacity,
          }}
        />
      )}

      {/* Section label (editing mode) */}
      {isEditing && (isSelected || isHovered) && (
        <div
          className={cn(
            "absolute -top-7 left-2 z-50 px-2 py-1 text-xs font-medium rounded-t-md",
            isSelected ? "bg-primary text-primary-foreground" : "bg-[var(--ds-blue-700)] text-white"
          )}
        >
          {section.name || "Section"}
          <span className="ml-2 opacity-70">({section.layout.mode})</span>
        </div>
      )}

      {/* Elements */}
      {sortedElements.map((element) => {
        // Use custom renderer if provided
        if (renderElement) {
          return (
            <ElementRenderer
              key={element.id}
              element={element}
              parentLayout={section.layout}
              isEditing={isEditing}
              isSelected={selectedElementId === element.id}
              isHovered={hoveredElementId === element.id}
              onClick={(e: React.MouseEvent) => handleElementClick(element.id, e)}
              onHover={(hovering: boolean) => handleElementHover(hovering ? element.id : null)}
            >
              {renderElement(element, section)}
            </ElementRenderer>
          )
        }

        // Default element rendering (placeholder)
        return (
          <ElementRenderer
            key={element.id}
            element={element}
            parentLayout={section.layout}
            isEditing={isEditing}
            isSelected={selectedElementId === element.id}
            isHovered={hoveredElementId === element.id}
            onClick={(e: React.MouseEvent) => handleElementClick(element.id, e)}
            onHover={(hovering: boolean) => handleElementHover(hovering ? element.id : null)}
          >
            <div className="p-4 bg-muted/50 rounded border border-dashed">
              <span className="text-sm text-muted-foreground">
                {element.type} ({element.id})
              </span>
            </div>
          </ElementRenderer>
        )
      })}

      {/* Empty section placeholder */}
      {sortedElements.length === 0 && isEditing && (
        <div className="flex items-center justify-center min-h-[200px] border-2 border-dashed border-muted-foreground/30 rounded-xl m-4">
          <div className="text-center text-muted-foreground">
            <p className="text-sm font-medium">Empty Section</p>
            <p className="text-xs mt-1">Drag elements here or click to add</p>
          </div>
        </div>
      )}

      {/* Grid overlay for absolute mode (editing) */}
      {isEditing && section.layout.mode === "absolute" && section.layout.absolute?.snapToGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--muted-foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--muted-foreground)) 1px, transparent 1px)
            `,
            backgroundSize: `${section.layout.absolute.gridSize}px ${section.layout.absolute.gridSize}px`,
          }}
        />
      )}
    </section>
  )
})
