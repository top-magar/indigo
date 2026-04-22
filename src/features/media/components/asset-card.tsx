"use client";

import { memo, useState, useEffect } from "react";
import { Video, File, MoreVertical, Download, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/shared/utils";
import type { MediaAsset } from "@/features/media/types";
import { formatFileSize, getFileTypeCategory } from "@/features/media/types";
import { toast } from "sonner";

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
  asset, isSelected, onSelect, onDelete, onClick, onDragStart,
}: AssetCardProps) {
  const fileType = getFileTypeCategory(asset.mimeType);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setImgLoaded(false); setImgError(false); }, [asset.id]);

  return (
    <div
      draggable onDragStart={onDragStart}
      className={cn(
        "group rounded-lg border overflow-hidden cursor-pointer transition-colors",
        isSelected ? "ring-2 ring-foreground" : "hover:bg-accent/50"
      )}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-muted relative flex items-center justify-center overflow-hidden rounded-t-[7px]" onClick={onClick}>
        {fileType === "image" && !imgError ? (
          <img
            src={asset.thumbnailUrl || asset.cdnUrl}
            alt={asset.altText || asset.filename}
            className={cn("size-full object-cover", !imgLoaded && "opacity-0")}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : fileType === "video" ? (
          <Video className="size-8 text-muted-foreground" />
        ) : (
          <File className="size-8 text-muted-foreground" />
        )}

        {/* Checkbox overlay */}
        <div
          className={cn("absolute top-2 left-2 z-10 transition-opacity", isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
          onClick={e => { e.stopPropagation(); onSelect(e); }}
        >
          <Checkbox checked={isSelected} className="size-4 bg-background border-background" />
        </div>

        {/* Actions overlay */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="size-6 rounded-full">
                <MoreVertical className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(asset.cdnUrl); toast.success("Copied"); }} className="text-xs gap-2">
                <Copy className="size-3.5" /> Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { const a = document.createElement("a"); a.href = asset.cdnUrl; a.download = asset.originalFilename; a.click(); }} className="text-xs gap-2">
                <Download className="size-3.5" /> Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-xs gap-2 text-destructive focus:text-destructive">
                <Trash2 className="size-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info */}
      <div className="p-2" onClick={onClick}>
        <p className="text-xs font-medium truncate">{asset.filename}</p>
        <p className="text-[10px] text-muted-foreground">{formatFileSize(asset.sizeBytes)}</p>
      </div>
    </div>
  );
});
