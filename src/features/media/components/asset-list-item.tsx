"use client";

import { memo, useState, useEffect } from "react";
import { Video, File, MoreVertical, Download, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/shared/utils";
import type { MediaAsset } from "@/features/media/types";
import { formatFileSize, getFileTypeCategory } from "@/features/media/types";

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
  asset, isSelected, onSelect, onDelete, onClick, onDragStart,
}: AssetListItemProps) {
  const fileType = getFileTypeCategory(asset.mimeType);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setImgLoaded(false); setImgError(false); }, [asset.id]);

  return (
    <div
      draggable onDragStart={onDragStart}
      className={cn(
        "group flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors",
        isSelected ? "bg-accent" : "hover:bg-accent/50"
      )}
      onClick={onClick}
    >
      {/* Checkbox */}
      <div className={cn("transition-opacity", isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100")} onClick={e => e.stopPropagation()}>
        <Checkbox checked={isSelected} onCheckedChange={() => onSelect()} className="size-4" />
      </div>

      {/* Thumbnail */}
      <div className="size-10 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
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
          <Video className="size-4 text-muted-foreground" />
        ) : (
          <File className="size-4 text-muted-foreground" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{asset.filename}</p>
        <p className="text-[11px] text-muted-foreground">
          {formatFileSize(asset.sizeBytes)}
          {asset.width && asset.height && <span> · {asset.width}×{asset.height}</span>}
        </p>
      </div>

      {/* Type */}
      <span className="text-[10px] text-muted-foreground capitalize shrink-0">{fileType}</span>

      {/* Actions */}
      <div className={cn("transition-opacity", isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100")} onClick={e => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(asset.cdnUrl)} className="text-xs gap-2">
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
  );
});
