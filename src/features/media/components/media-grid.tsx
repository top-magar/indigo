"use client";

import { memo, forwardRef, useEffect, useRef } from "react";
import { ImageIcon, UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MediaAsset, ViewMode } from "@/features/media/types";
import { AssetCard } from "./asset-card";
import { AssetListItem } from "./asset-list-item";

interface MediaGridProps {
  assets: MediaAsset[];
  viewMode: ViewMode;
  selectedIds: Set<string>;
  isLoadingMore: boolean;
  hasMore: boolean;
  onSelect: (assetId: string, index: number, e?: React.MouseEvent) => void;
  onDelete: (assetId: string) => void;
  onClick: (asset: MediaAsset) => void;
  onDragStart: (e: React.DragEvent, assetId: string) => void;
  onLoadMore: () => void;
  onUploadClick: () => void;
}

export const MediaGrid = memo(
  forwardRef<HTMLDivElement, MediaGridProps>(function MediaGrid(
    { assets, viewMode, selectedIds, isLoadingMore, hasMore, onSelect, onDelete, onClick, onDragStart, onLoadMore, onUploadClick },
    ref
  ) {
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!hasMore || isLoadingMore) return;
      const observer = new IntersectionObserver(
        (entries) => { if (entries[0].isIntersecting) onLoadMore(); },
        { rootMargin: "200px" }
      );
      const el = loadMoreRef.current;
      if (el) observer.observe(el);
      return () => { if (el) observer.unobserve(el); };
    }, [hasMore, isLoadingMore, onLoadMore]);

    if (assets.length === 0 && !isLoadingMore) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center h-full text-center p-8">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <ImageIcon className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">No files yet</p>
          <p className="text-xs text-muted-foreground mb-4 max-w-xs">
            Upload product images, videos, or documents. Drag and drop or click below.
          </p>
          <Button size="sm" onClick={onUploadClick}>
            <UploadCloud className="size-3.5" /> Upload Files
          </Button>
        </div>
      );
    }

    return (
      <div ref={ref} className="flex-1 overflow-auto p-4">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {assets.map((asset, index) => (
              <AssetCard key={asset.id} asset={asset} index={index} isSelected={selectedIds.has(asset.id)} onSelect={e => onSelect(asset.id, index, e)} onDelete={() => onDelete(asset.id)} onClick={() => onClick(asset)} onDragStart={e => onDragStart(e, asset.id)} />
            ))}
            {isLoadingMore && Array.from({ length: 5 }).map((_, i) => (
              <div key={`s-${i}`} className="rounded-lg border overflow-hidden">
                <Skeleton className="aspect-square rounded-none" />
                <div className="p-2.5 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border divide-y">
            {assets.map((asset, index) => (
              <AssetListItem key={asset.id} asset={asset} index={index} isSelected={selectedIds.has(asset.id)} onSelect={e => onSelect(asset.id, index, e)} onDelete={() => onDelete(asset.id)} onClick={() => onClick(asset)} onDragStart={e => onDragStart(e, asset.id)} />
            ))}
            {isLoadingMore && Array.from({ length: 3 }).map((_, i) => (
              <div key={`s-${i}`} className="flex items-center gap-3 p-3">
                <Skeleton className="size-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div ref={loadMoreRef} className="mt-6 text-center py-4">
            {isLoadingMore ? (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Loading…
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={onLoadMore}>Load More</Button>
            )}
          </div>
        )}
      </div>
    );
  })
);
