"use client";

import { useEditorStore } from "../../core/editor-store";
import { useDocumentStore } from "../../core/document-store";
import { useEditor } from "../../core/provider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { ElementAnimation } from "../../core/types";

export function AnimationSettings() {
  const { dispatch } = useEditor();
  const selectedId = useEditorStore(s => s.selected?.id);
  const selectedElement = useDocumentStore(s =>
    selectedId ? s.elements.find(e => e.id === selectedId) : null
  );

  if (!selectedElement) return null;

  const animations: ElementAnimation = selectedElement.animations || {
    preset: 'none',
    duration: 0.5,
    delay: 0,
    trigger: 'on-load',
  };

  const updateAnimation = (updates: Partial<ElementAnimation>) => {
    dispatch({
      type: "UPDATE_ELEMENT_LIVE",
      payload: {
        element: {
          ...selectedElement,
          animations: { ...animations, ...updates },
        },
      },
    });
    // For animations, we can immediately commit to history since they are simple dropdown/slider changes
    dispatch({ type: "COMMIT_HISTORY" });
  };

  return (
    <div className="space-y-6">
      {/* Preset */}
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Animation Preset</Label>
        <Select
          value={animations.preset || "none"}
          onValueChange={(val: any) => updateAnimation({ preset: val })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select preset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="fade">Fade In</SelectItem>
            <SelectItem value="slide-up">Slide Up</SelectItem>
            <SelectItem value="slide-down">Slide Down</SelectItem>
            <SelectItem value="zoom-in">Zoom In</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {animations.preset && animations.preset !== 'none' && (
        <>
          {/* Trigger */}
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trigger</Label>
            <Select
              value={animations.trigger || "on-load"}
              onValueChange={(val: any) => updateAnimation({ trigger: val })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on-load">On Load</SelectItem>
                <SelectItem value="on-scroll">On Scroll</SelectItem>
                <SelectItem value="hover">On Hover</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</Label>
              <span className="text-xs tabular-nums">{animations.duration}s</span>
            </div>
            <Slider
              value={[animations.duration ?? 0.5]}
              min={0.1}
              max={3}
              step={0.1}
              onValueChange={(vals) => updateAnimation({ duration: vals[0] })}
            />
          </div>

          {/* Delay */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delay</Label>
              <span className="text-xs tabular-nums">{animations.delay}s</span>
            </div>
            <Slider
              value={[animations.delay ?? 0]}
              min={0}
              max={5}
              step={0.1}
              onValueChange={(vals) => updateAnimation({ delay: vals[0] })}
            />
          </div>
        </>
      )}
    </div>
  );
}
