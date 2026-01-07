"use client"

import { useState, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlayIcon, StopIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/shared/utils"
import type {
  BlockAnimation,
  EntranceAnimationType,
  ScrollAnimationType,
  HoverAnimationType,
  EasingType,
} from "@/features/editor/animations/types"
import {
  DEFAULT_ENTRANCE_ANIMATION,
  DEFAULT_SCROLL_ANIMATION,
  DEFAULT_HOVER_ANIMATION,
  ANIMATION_PRESETS,
} from "@/features/editor/animations/types"

// ============================================================================
// TYPES
// ============================================================================

interface AnimationPickerProps {
  animation?: BlockAnimation
  onChange: (animation: BlockAnimation) => void
  onPreview?: () => void
}

// ============================================================================
// ENTRANCE ANIMATION OPTIONS
// ============================================================================

const ENTRANCE_OPTIONS: { value: EntranceAnimationType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade In" },
  { value: "slide-up", label: "Slide Up" },
  { value: "slide-down", label: "Slide Down" },
  { value: "slide-left", label: "Slide Left" },
  { value: "slide-right", label: "Slide Right" },
  { value: "zoom-in", label: "Zoom In" },
  { value: "zoom-out", label: "Zoom Out" },
  { value: "flip", label: "Flip" },
  { value: "bounce", label: "Bounce" },
  { value: "rotate", label: "Rotate" },
]

const SCROLL_OPTIONS: { value: ScrollAnimationType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "parallax", label: "Parallax" },
  { value: "fade-on-scroll", label: "Fade on Scroll" },
  { value: "scale-on-scroll", label: "Scale on Scroll" },
  { value: "blur-on-scroll", label: "Blur on Scroll" },
  { value: "rotate-on-scroll", label: "Rotate on Scroll" },
]

const HOVER_OPTIONS: { value: HoverAnimationType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "lift", label: "Lift" },
  { value: "glow", label: "Glow" },
  { value: "scale", label: "Scale" },
  { value: "tilt", label: "Tilt" },
  { value: "shake", label: "Shake" },
  { value: "pulse", label: "Pulse" },
]

const EASING_OPTIONS: { value: EasingType; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "ease", label: "Ease" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
  { value: "ease-in-out", label: "Ease In Out" },
  { value: "spring", label: "Spring" },
  { value: "bounce", label: "Bounce" },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AnimationPicker({ animation, onChange, onPreview }: AnimationPickerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(["entrance"])

  // Merge with defaults
  const currentAnimation: BlockAnimation = {
    entrance: animation?.entrance ?? DEFAULT_ENTRANCE_ANIMATION,
    scroll: animation?.scroll ?? DEFAULT_SCROLL_ANIMATION,
    hover: animation?.hover ?? DEFAULT_HOVER_ANIMATION,
    respectReducedMotion: animation?.respectReducedMotion ?? true,
  }

  const handleEntranceChange = useCallback((updates: Partial<typeof currentAnimation.entrance>) => {
    onChange({
      ...currentAnimation,
      entrance: { ...currentAnimation.entrance!, ...updates },
    })
  }, [currentAnimation, onChange])

  const handleScrollChange = useCallback((updates: Partial<typeof currentAnimation.scroll>) => {
    onChange({
      ...currentAnimation,
      scroll: { ...currentAnimation.scroll!, ...updates },
    })
  }, [currentAnimation, onChange])

  const handleHoverChange = useCallback((updates: Partial<typeof currentAnimation.hover>) => {
    onChange({
      ...currentAnimation,
      hover: { ...currentAnimation.hover!, ...updates },
    })
  }, [currentAnimation, onChange])

  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = ANIMATION_PRESETS.find(p => p.id === presetId)
    if (preset) {
      onChange({
        ...currentAnimation,
        ...preset.animation,
      })
    }
  }, [currentAnimation, onChange])

  const handlePreview = useCallback(() => {
    setIsPlaying(true)
    onPreview?.()
    setTimeout(() => setIsPlaying(false), 1500)
  }, [onPreview])

  return (
    <div className="space-y-4">
      {/* Quick Presets */}
      <div>
        <Label className="text-xs font-medium mb-2 block">Quick Presets</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {ANIMATION_PRESETS.slice(0, 4).map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className={cn(
                "px-2 py-1.5 rounded-md text-xs text-left border transition-colors",
                "hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <span className="font-medium">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handlePreview}
        disabled={isPlaying}
      >
        <HugeiconsIcon
          icon={isPlaying ? StopIcon : PlayIcon}
          className="h-3.5 w-3.5 mr-2"
        />
        {isPlaying ? "Playing..." : "Preview Animation"}
      </Button>

      {/* Detailed Settings */}
      <Accordion
        type="multiple"
        value={expandedSections}
        onValueChange={setExpandedSections}
      >
        {/* Entrance Animation */}
        <AccordionItem value="entrance" className="border-none">
          <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline">
            Entrance Animation
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-3">
            <div>
              <Label className="text-[10px] text-muted-foreground">Type</Label>
              <Select
                value={currentAnimation.entrance?.type}
                onValueChange={(v) => handleEntranceChange({ type: v as EntranceAnimationType })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTRANCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentAnimation.entrance?.type !== "none" && (
              <>
                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-[10px] text-muted-foreground">Duration</Label>
                    <span className="text-[10px] text-muted-foreground">
                      {currentAnimation.entrance?.duration}ms
                    </span>
                  </div>
                  <Slider
                    value={[currentAnimation.entrance?.duration ?? 500]}
                    onValueChange={([v]) => handleEntranceChange({ duration: v })}
                    min={100}
                    max={2000}
                    step={50}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Label className="text-[10px] text-muted-foreground">Delay</Label>
                    <span className="text-[10px] text-muted-foreground">
                      {currentAnimation.entrance?.delay}ms
                    </span>
                  </div>
                  <Slider
                    value={[currentAnimation.entrance?.delay ?? 0]}
                    onValueChange={([v]) => handleEntranceChange({ delay: v })}
                    min={0}
                    max={1000}
                    step={50}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-[10px] text-muted-foreground">Easing</Label>
                  <Select
                    value={currentAnimation.entrance?.easing}
                    onValueChange={(v) => handleEntranceChange({ easing: v as EasingType })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EASING_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Scroll Animation */}
        <AccordionItem value="scroll" className="border-none">
          <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline">
            Scroll Animation
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-3">
            <div>
              <Label className="text-[10px] text-muted-foreground">Type</Label>
              <Select
                value={currentAnimation.scroll?.type}
                onValueChange={(v) => handleScrollChange({ type: v as ScrollAnimationType })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCROLL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentAnimation.scroll?.type !== "none" && (
              <div>
                <div className="flex justify-between mb-1">
                  <Label className="text-[10px] text-muted-foreground">Intensity</Label>
                  <span className="text-[10px] text-muted-foreground">
                    {currentAnimation.scroll?.intensity}%
                  </span>
                </div>
                <Slider
                  value={[currentAnimation.scroll?.intensity ?? 50]}
                  onValueChange={([v]) => handleScrollChange({ intensity: v })}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Hover Animation */}
        <AccordionItem value="hover" className="border-none">
          <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline">
            Hover Animation
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-3">
            <div>
              <Label className="text-[10px] text-muted-foreground">Type</Label>
              <Select
                value={currentAnimation.hover?.type}
                onValueChange={(v) => handleHoverChange({ type: v as HoverAnimationType })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOVER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentAnimation.hover?.type !== "none" && (
              <div>
                <div className="flex justify-between mb-1">
                  <Label className="text-[10px] text-muted-foreground">Intensity</Label>
                  <span className="text-[10px] text-muted-foreground">
                    {currentAnimation.hover?.intensity}%
                  </span>
                </div>
                <Slider
                  value={[currentAnimation.hover?.intensity ?? 50]}
                  onValueChange={([v]) => handleHoverChange({ intensity: v })}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Accessibility */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div>
          <Label className="text-xs font-medium">Respect Reduced Motion</Label>
          <p className="text-[10px] text-muted-foreground">
            Disable animations for users who prefer reduced motion
          </p>
        </div>
        <Switch
          checked={currentAnimation.respectReducedMotion}
          onCheckedChange={(checked) => onChange({ ...currentAnimation, respectReducedMotion: checked })}
        />
      </div>
    </div>
  )
}
