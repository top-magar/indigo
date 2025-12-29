"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import type { Guide } from "@/lib/editor/guides"

interface SmartGuidesProps {
  guides: Guide[]
  containerRef: React.RefObject<HTMLElement | null>
}

/**
 * SmartGuides renders alignment guides during drag operations.
 * Shows edge, center, and spacing guides with visual feedback.
 */
export const SmartGuides = memo(function SmartGuides({ guides }: SmartGuidesProps) {
  if (guides.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {guides.map((guide) => (
        <GuideElement key={guide.id} guide={guide} />
      ))}
    </div>
  )
})

interface GuideElementProps {
  guide: Guide
}

const GuideElement = memo(function GuideElement({ guide }: GuideElementProps) {
  const isVertical = guide.axis === 'vertical'
  const isCenter = guide.type === 'center'
  const isSpacing = guide.type === 'spacing'

  // Guide line styles
  const lineStyle: React.CSSProperties = isVertical
    ? {
        left: guide.position,
        top: Math.max(0, guide.start),
        height: guide.end - guide.start,
        width: 1,
      }
    : {
        top: guide.position,
        left: Math.max(0, guide.start),
        width: guide.end - guide.start,
        height: 1,
      }

  return (
    <>
      {/* Main guide line */}
      <div
        className={cn(
          "absolute transition-opacity duration-75",
          isCenter && "bg-violet-500",
          !isCenter && !isSpacing && "bg-primary",
          isSpacing && "bg-amber-500/50"
        )}
        style={lineStyle}
      />

      {/* Center indicator dot */}
      {isCenter && (
        <div
          className="absolute h-2 w-2 rounded-full bg-violet-500 -translate-x-1/2 -translate-y-1/2"
          style={
            isVertical
              ? { left: guide.position, top: (guide.start + guide.end) / 2 }
              : { top: guide.position, left: (guide.start + guide.end) / 2 }
          }
        />
      )}

      {/* Edge indicator diamonds */}
      {guide.type === 'edge' && (
        <>
          <div
            className={cn(
              "absolute h-1.5 w-1.5 rotate-45 bg-primary",
              isVertical ? "-translate-x-1/2" : "-translate-y-1/2"
            )}
            style={
              isVertical
                ? { left: guide.position, top: guide.start }
                : { top: guide.position, left: guide.start }
            }
          />
          <div
            className={cn(
              "absolute h-1.5 w-1.5 rotate-45 bg-primary",
              isVertical ? "-translate-x-1/2" : "-translate-y-1/2"
            )}
            style={
              isVertical
                ? { left: guide.position, top: guide.end }
                : { top: guide.position, left: guide.end }
            }
          />
        </>
      )}

      {/* Spacing label */}
      {isSpacing && guide.label && (
        <div
          className={cn(
            "absolute px-1.5 py-0.5 rounded text-[10px] font-medium",
            "bg-amber-500 text-white shadow-sm",
            "-translate-x-1/2 -translate-y-1/2"
          )}
          style={{
            left: isVertical ? guide.position : (guide.start + guide.end) / 2,
            top: isVertical ? (guide.start + guide.end) / 2 : guide.position,
          }}
        >
          {guide.label}
        </div>
      )}
    </>
  )
})

/**
 * Distance indicator component for showing spacing between blocks
 */
interface DistanceIndicatorProps {
  distance: number
  position: { x: number; y: number }
  axis: 'horizontal' | 'vertical'
}

export const DistanceIndicator = memo(function DistanceIndicator({
  distance,
  position,
  axis,
}: DistanceIndicatorProps) {
  return (
    <div
      className={cn(
        "absolute pointer-events-none z-50",
        "flex items-center justify-center",
        axis === 'horizontal' ? "flex-col" : "flex-row"
      )}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Distance line */}
      <div
        className={cn(
          "bg-amber-500/50",
          axis === 'horizontal' ? "w-px" : "h-px"
        )}
        style={
          axis === 'horizontal'
            ? { height: distance }
            : { width: distance }
        }
      />
      
      {/* Distance label */}
      <div className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-medium shadow-sm">
        {Math.round(distance)}px
      </div>
    </div>
  )
})
