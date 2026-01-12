"use client";

import { useState, useCallback } from "react";
import { Image, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils";
import type { MediaAsset, AllowedMimeType, SelectionMode } from "@/features/media/types";
import { MediaPicker } from "./media-picker";

export interface MediaPickerTriggerProps {
  value?: string | string[];
  onChange: (value: string | string[] | null) => void;
  mode?: SelectionMode;
  accept?: AllowedMimeType[];
  maxSelection?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MediaPickerTrigger({
  value,
  onChange,
  mode = "single",
  accept,
  maxSelection = 10,
  placeholder = "Select image",
  className,
  disabled = false,
}: MediaPickerTriggerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  // Normalize value to array for consistent handling
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const hasValue = values.length > 0;

  const handleSelect = useCallback(
    (assets: MediaAsset[]) => {
      if (mode === "single") {
        onChange(assets[0]?.cdnUrl || null);
      } else {
        onChange(assets.map((a) => a.cdnUrl));
      }
    },
    [mode, onChange]
  );

  const handleRemove = useCallback(
    (index: number) => {
      if (mode === "single") {
        onChange(null);
      } else {
        const newValues = [...values];
        newValues.splice(index, 1);
        onChange(newValues.length > 0 ? newValues : null);
      }
    },
    [mode, values, onChange]
  );

  return (
    <>
      <div className={cn("space-y-2", className)}>
        {hasValue ? (
          <div className={cn(
            "grid gap-2",
            mode === "multiple" && values.length > 1 ? "grid-cols-2" : "grid-cols-1"
          )}>
            {values.map((url, index) => (
              <div
                key={url}
                className="relative group rounded-xl border overflow-hidden bg-muted"
              >
                <img
                  src={url}
                  alt=""
                  className="w-full h-32 object-cover"
                />
                {!disabled && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setPickerOpen(true)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Change
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            disabled={disabled}
            className={cn(
              "w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors",
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-primary hover:bg-muted/50 cursor-pointer"
            )}
          >
            <Image className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          </button>
        )}

        {/* Add more button for multiple mode */}
        {mode === "multiple" && hasValue && values.length < maxSelection && !disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setPickerOpen(true)}
          >
            <Image className="h-4 w-4 mr-2" />
            Add More
          </Button>
        )}
      </div>

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleSelect}
        mode={mode}
        accept={accept}
        maxSelection={maxSelection}
      />
    </>
  );
}
