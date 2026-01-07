"use client";

import { memo, useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/shared/utils";
import type { MediaAsset } from "@/features/media/types";
import { formatFileSize, getFileTypeCategory } from "@/features/media/types";
import { ShimmerEffect } from "@/components/ui/shimmer-effect";

type ThumbnailLoadState = "loading" | "loaded" | "error";

// File type badge colors
const fileTypeBadgeColors: Record<string, string> = {
  image: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  video: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  document: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

interface AssetListItemProps {
  asset: MediaAsset;
  index: number;
  isSelected: boolean;
  onSelect: (e?: React.MouseEvent) => void;
  onDelete: () => void;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

export const AssetListItem = memo(function AssetListItem({
  asset,
  isSelected,
  onSelect,
  onDelete,
  onClick,
  onDragStart,
}: AssetListItemProps) {
  const fileType = getFileTypeCategory(asset.mimeType);
  const [thumbnailState, setThumbnailState] = useState<ThumbnailLoadState>(
    fileType === "image" ? "loading" : "loaded"
  );

  // Detect touch device
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window);
  }, []);

  // Preload image
  useEffect(() => {
    if (fileType !== "image") {
      setThumbnailState("loaded");
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
  }, [asset.thumbnailUrl, asset.cdnUrl, fileType]);

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
      role="button"
      tabIndex={0}
      aria-label={`${asset.filename}, ${formatFileSize(asset.sizeBytes)}${asset.width && asset.height ? `, ${asset.width}×${asset.height}` : ""}, ${isSelected ? "selected" : "not selected"}`}
      aria-selected={isSelected}
      draggable
      onDragStart={onDragStart}
      onKeyDown={handleKeyDown}
      className={cn(
        "group flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 cursor-pointer",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none",
        isSelected
          ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
          : "border-transparent hover:bg-muted/50"
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
          "transition-opacity",
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
            "h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]",
            isSelected
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-background border-muted-foreground/30 hover:border-primary"
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
        className="h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 overflow-hidden relative"
        onClick={onClick}
      >
        {fileType === "image" ? (
          <>
            {thumbnailState === "loading" && (
              <ShimmerEffect className="absolute inset-0 rounded-lg" />
            )}
            {thumbnailState === "loaded" && (
              <img
                src={asset.thumbnailUrl || asset.cdnUrl}
                alt={asset.altText || asset.filename}
                className="w-full h-full object-cover animate-in fade-in"
                loading="lazy"
              />
            )}
            {thumbnailState === "error" && (
              <HugeiconsIcon
                icon={File01Icon}
                className="h-5 w-5 text-muted-foreground/50"
              />
            )}
          </>
        ) : fileType === "video" ? (
          <HugeiconsIcon
            icon={Video01Icon}
            className="h-5 w-5 text-muted-foreground"
          />
        ) : (
          <HugeiconsIcon
            icon={File01Icon}
            className="h-5 w-5 text-muted-foreground"
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0" onClick={onClick}>
        <p
          className="text-sm font-medium truncate leading-tight"
          title={asset.filename}
        >
          {asset.filename}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatFileSize(asset.sizeBytes)}
          {asset.width && asset.height && (
            <span className="ml-1.5 text-muted-foreground/70">
              • {asset.width}×{asset.height}
            </span>
          )}
        </p>
      </div>

      {/* Type Badge - color coded */}
      <Badge
        variant="outline"
        className={cn(
          "capitalize shrink-0 text-xs border",
          fileTypeBadgeColors[fileType] || "bg-muted text-muted-foreground"
        )}
      >
        {fileType}
      </Badge>

      {/* Actions */}
      <div
        className={cn(
          "flex gap-1 transition-opacity",
          isTouchDevice
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 min-h-[44px] min-w-[44px]"
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
