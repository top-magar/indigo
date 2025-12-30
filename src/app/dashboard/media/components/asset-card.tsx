"use client";

import { memo, useState, useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Video01Icon,
  File01Icon,
  MoreVerticalIcon,
  ZoomInAreaIcon,
  Download01Icon,
  Copy01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { MediaAsset } from "@/lib/media/types";
import { formatFileSize, getFileTypeCategory } from "@/lib/media/types";
import { ShimmerEffect } from "@/components/ui/shimmer-effect";

type ThumbnailLoadState = "idle" | "loading" | "loaded" | "error";

interface AssetCardProps {
  asset: MediaAsset;
  index: number;
  isSelected: boolean;
  onSelect: (e?: React.MouseEvent) => void;
  onDelete: () => void;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

export const AssetCard = memo(function AssetCard({
  asset,
  isSelected,
  onSelect,
  onDelete,
  onClick,
  onDragStart,
}: AssetCardProps) {
  const fileType = getFileTypeCategory(asset.mimeType);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [thumbnailState, setThumbnailState] = useState<ThumbnailLoadState>(
    fileType === "image" ? "idle" : "loaded"
  );

  // Detect touch device for showing actions without hover
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window);
  }, []);

  // Lazy loading with IntersectionObserver
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "100px" } // Start loading 100px before visible
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  // Preload image to detect load/error states (only when visible)
  useEffect(() => {
    if (fileType !== "image" || !isVisible) {
      if (fileType !== "image") setThumbnailState("loaded");
      return;
    }

    setThumbnailState("loading");
    const img = new Image();
    const src = asset.thumbnailUrl || asset.cdnUrl;
    img.src = src;
    img.onload = () => setThumbnailState("loaded");
    img.onerror = () => setThumbnailState("error");

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [asset.thumbnailUrl, asset.cdnUrl, fileType, isVisible]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(asset.cdnUrl);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = asset.cdnUrl;
    link.download = asset.originalFilename;
    link.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  const handleCheckboxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      onSelect();
    }
  };

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-label={`${asset.filename}, ${formatFileSize(asset.sizeBytes)}${asset.width && asset.height ? `, ${asset.width}×${asset.height}` : ""}, ${isSelected ? "selected" : "not selected"}`}
      aria-selected={isSelected}
      draggable
      onDragStart={onDragStart}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative rounded-xl border bg-card overflow-hidden transition-all duration-200 cursor-pointer",
        "hover:border-border hover:shadow-md hover:-translate-y-0.5",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none",
        isSelected && "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
      )}
    >
      {/* Selection checkbox */}
      <div
        role="checkbox"
        aria-checked={isSelected}
        aria-label={`Select ${asset.filename}`}
        tabIndex={0}
        onKeyDown={handleCheckboxKeyDown}
        className={cn(
          "absolute top-2 left-2 z-10 transition-opacity",
          isSelected || isTouchDevice
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus:opacity-100"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(e);
        }}
      >
        <div
          className={cn(
            "h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors",
            "bg-background/90 backdrop-blur-sm",
            isSelected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/30 hover:border-primary"
          )}
        >
          {isSelected && (
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Thumbnail */}
      <div
        className="aspect-square bg-muted/50 flex items-center justify-center overflow-hidden"
        onClick={onClick}
      >
        {fileType === "image" ? (
          <>
            {(thumbnailState === "loading" || thumbnailState === "idle") && (
              <ShimmerEffect className="absolute inset-0 rounded-none" />
            )}
            {thumbnailState === "loaded" && (
              <img
                src={asset.thumbnailUrl || asset.cdnUrl}
                alt={asset.altText || asset.filename}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 animate-in fade-in"
              />
            )}
            {thumbnailState === "error" && (
              <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                <HugeiconsIcon
                  icon={File01Icon}
                  className="h-12 w-12 text-muted-foreground/50"
                />
              </div>
            )}
          </>
        ) : fileType === "video" ? (
          <div className="relative w-full h-full bg-linear-to-br from-muted to-muted/50 flex items-center justify-center">
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
            <HugeiconsIcon
              icon={Video01Icon}
              className="h-12 w-12 text-muted-foreground"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-linear-to-br from-muted to-muted/50 flex items-center justify-center">
            <HugeiconsIcon
              icon={File01Icon}
              className="h-12 w-12 text-muted-foreground"
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1" onClick={onClick}>
        <p
          className="text-sm font-medium truncate leading-tight"
          title={asset.filename}
        >
          {asset.filename}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(asset.sizeBytes)}
          {asset.width && asset.height && (
            <span className="ml-1.5 text-muted-foreground/70">
              • {asset.width}×{asset.height}
            </span>
          )}
        </p>
      </div>

      {/* Hover Actions */}
      <div
        className={cn(
          "absolute top-2 right-2 flex gap-1 transition-opacity",
          isTouchDevice
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 min-h-[44px] min-w-[44px] rounded-lg bg-background/90 backdrop-blur-sm"
              aria-label="More actions"
            >
              <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleCopyUrl}>
              <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4 mr-2" />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownload}>
              <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});
