/**
 * PositionControls - Element positioning controls for absolute layout mode
 * Similar to Wix's position/size panel for freeform elements
 */

"use client"

import { memo, useCallback } from "react"
import { cn } from "@/shared/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUp01Icon,
  ArrowDown01Icon,
  Layers01Icon,
  RotateClockwiseIcon,
  LockIcon,
  SquareUnlock02Icon,
} from "@hugeicons/core-free-icons"
import type { EnhancedElement } from "@/features/editor/layout"
import { useLayoutStore } from "@/features/editor/layout"


// Anchor point options
const ANCHOR_OPTIONS = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "center-left", label: "Center Left" },
  { value: "center", label: "Center" },
  { value: "center-right", label: "Center Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
] as const

interface PositionControlsProps {
  element: EnhancedElement
  sectionId: string
  className?: string
}

export const PositionControls = memo(function PositionControls({
  element,
  sectionId,
  className,
}: PositionControlsProps) {
  const {
    setElementPosition,
    setElementSize,
    setElementZIndex,
    updateElement,
  } = useLayoutStore()

  const absPos = element.position.absolute

  // If not in absolute mode, show a message
  if (!absPos) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        <p className="text-sm">Position controls are only available in Freeform layout mode.</p>
      </div>
    )
  }

  // Handle position change
  const handlePositionChange = useCallback(
    (axis: "x" | "y", value: string) => {
      const num = parseInt(value, 10)
      if (isNaN(num)) return
      const newX = axis === "x" ? num : absPos.x
      const newY = axis === "y" ? num : absPos.y
      setElementPosition(sectionId, element.id, newX, newY)
    },
    [sectionId, element.id, absPos, setElementPosition]
  )

  // Handle size change
  const handleSizeChange = useCallback(
    (dimension: "width" | "height", value: string) => {
      const num = parseInt(value, 10)
      if (isNaN(num) || num < 10) return
      const newWidth = dimension === "width" ? num : absPos.width
      const newHeight = dimension === "height" ? num : absPos.height
      setElementSize(sectionId, element.id, newWidth, newHeight)
    },
    [sectionId, element.id, absPos, setElementSize]
  )

  // Handle z-index change
  const handleZIndexChange = useCallback(
    (value: number[]) => {
      setElementZIndex(sectionId, element.id, value[0])
    },
    [sectionId, element.id, setElementZIndex]
  )

  // Handle rotation change
  const handleRotationChange = useCallback(
    (value: string) => {
      const num = parseInt(value, 10)
      if (isNaN(num)) return
      updateElement(sectionId, element.id, {
        position: {
          ...element.position,
          absolute: { ...absPos, rotation: num },
        },
      })
    },
    [sectionId, element.id, element.position, absPos, updateElement]
  )

  // Handle anchor change
  const handleAnchorChange = useCallback(
    (value: string) => {
      updateElement(sectionId, element.id, {
        position: {
          ...element.position,
          absolute: { ...absPos, anchor: value as typeof absPos.anchor },
        },
      })
    },
    [sectionId, element.id, element.position, absPos, updateElement]
  )

  // Handle lock toggle
  const handleLockToggle = useCallback(() => {
    updateElement(sectionId, element.id, { locked: !element.locked })
  }, [sectionId, element.id, element.locked, updateElement])

  // Bring forward / send backward
  const handleBringForward = useCallback(() => {
    setElementZIndex(sectionId, element.id, absPos.zIndex + 1)
  }, [sectionId, element.id, absPos.zIndex, setElementZIndex])

  const handleSendBackward = useCallback(() => {
    setElementZIndex(sectionId, element.id, Math.max(0, absPos.zIndex - 1))
  }, [sectionId, element.id, absPos.zIndex, setElementZIndex])

  return (
    <div className={cn("space-y-6", className)}>
      {/* Position */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Position
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">X</Label>
            <Input
              type="number"
              value={absPos.x}
              onChange={(e) => handlePositionChange("x", e.target.value)}
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Y</Label>
            <Input
              type="number"
              value={absPos.y}
              onChange={(e) => handlePositionChange("y", e.target.value)}
              className="h-8"
            />
          </div>
        </div>
      </div>

      {/* Size */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Size
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Width</Label>
            <Input
              type="number"
              value={absPos.width}
              onChange={(e) => handleSizeChange("width", e.target.value)}
              min={10}
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Height</Label>
            <Input
              type="number"
              value={absPos.height}
              onChange={(e) => handleSizeChange("height", e.target.value)}
              min={10}
              className="h-8"
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Rotation
        </Label>
        <div className="flex items-center gap-3">
          <HugeiconsIcon icon={RotateClockwiseIcon} className="h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            value={absPos.rotation ?? 0}
            onChange={(e) => handleRotationChange(e.target.value)}
            min={-360}
            max={360}
            className="h-8 flex-1"
          />
          <span className="text-xs text-muted-foreground">°</span>
        </div>
      </div>

      {/* Layer (Z-Index) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Layer
          </Label>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleSendBackward}
                >
                  <HugeiconsIcon icon={ArrowDown01Icon} className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send Backward</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleBringForward}
                >
                  <HugeiconsIcon icon={ArrowUp01Icon} className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bring Forward</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <HugeiconsIcon icon={Layers01Icon} className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[absPos.zIndex]}
            onValueChange={handleZIndexChange}
            min={0}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-8 text-right">
            {absPos.zIndex}
          </span>
        </div>
      </div>

      {/* Anchor Point */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Anchor Point
        </Label>
        <Select value={absPos.anchor ?? "top-left"} onValueChange={handleAnchorChange}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANCHOR_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lock */}
      <div className="pt-2 border-t">
        <Button
          variant={element.locked ? "secondary" : "outline"}
          size="sm"
          className="w-full"
          onClick={handleLockToggle}
        >
          <HugeiconsIcon
            icon={element.locked ? LockIcon : SquareUnlock02Icon}
            className="h-4 w-4 mr-2"
          />
          {element.locked ? "Unlock Element" : "Lock Element"}
        </Button>
      </div>
    </div>
  )
})

export default PositionControls
