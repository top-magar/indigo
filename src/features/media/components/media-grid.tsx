"use client";

import { memo, forwardRef, useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon, Upload04Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { ShimmerEffect } from "@/components/ui/shimmer-effect";
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
    {
      assets,
      viewMode,
      selectedIds,
      isLoadingMore,
      hasMore,
      onSelect,
      onDelete,
      onClick,
      onDragStart,
      onLoadMore,
      onUploadClick,
    },
    ref
  ) {
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Infinite scroll with IntersectionObserver
    useEffect(() => {
      if (!hasMore || isLoadingMore) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            onLoadMore();
          }
        },
        { rootMargin: "200px" }
      );

      const currentRef = loadMoreRef.current;
      if (currentRef) {
        observer.observe(currentRef);
      }

      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
      };
    }, [hasMore, isLoadingMore, onLoadMore]);
    // Empty state
    if (assets.length === 0 && !isLoadingMore) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center h-full text-center p-8">
          <div className="relative mb-6">
            {/* Layered illustration */}
            <div className="w-28 h-28 rounded-2xl bg-muted/20 flex items-center justify-center border-2 border-dashed border-muted-foreground/15 rotate-3 absolute -top-1 -left-1" />
            <div className="w-28 h-28 rounded-2xl bg-muted/30 flex items-center justify-center border-2 border-dashed border-muted-foreground/20 relative">
              <HugeiconsIcon icon={Image01Icon} className="h-12 w-12 text-muted-foreground/40" />
            </div>
            <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
              <HugeiconsIcon icon={Upload04Icon} className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mt-2">No files yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
            Upload files or drag and drop them here to get started
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Supports images, videos, and PDF documents
          </p>
          <Button className="mt-6 gap-2" onClick={onUploadClick}>
            <HugeiconsIcon icon={Upload04Icon} className="h-4 w-4" />
            Upload Files
          </Button>
        </div>
      );
    }

    return (
      <div ref={ref} className="flex-1 overflow-auto p-4">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {assets.map((asset, index) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                index={index}
                isSelected={selectedIds.has(asset.id)}
                onSelect={(e) => onSelect(asset.id, index, e)}
                onDelete={() => onDelete(asset.id)}
                onClick={() => onClick(asset)}
                onDragStart={(e) => onDragStart(e, asset.id)}
              />
            ))}
            {/* Loading skeletons with shimmer */}
            {isLoadingMore &&
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="rounded-xl border bg-card overflow-hidden"
                >
                  <ShimmerEffect className="aspect-square rounded-none" />
                  <div className="p-3 space-y-2">
                    <ShimmerEffect height={16} className="w-3/4" />
                    <ShimmerEffect height={12} className="w-1/2" />
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-2">
            {assets.map((asset, index) => (
              <AssetListItem
                key={asset.id}
                asset={asset}
                index={index}
                isSelected={selectedIds.has(asset.id)}
                onSelect={(e) => onSelect(asset.id, index, e)}
                onDelete={() => onDelete(asset.id)}
                onClick={() => onClick(asset)}
                onDragStart={(e) => onDragStart(e, asset.id)}
              />
            ))}
            {/* Loading skeletons with shimmer */}
            {isLoadingMore &&
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card"
                >
                  <ShimmerEffect height={48} width={48} className="rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <ShimmerEffect height={16} className="w-1/3" />
                    <ShimmerEffect height={12} className="w-1/4" />
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Load More - now triggered by IntersectionObserver */}
        {hasMore && (
          <div ref={loadMoreRef} className="mt-8 text-center py-4">
            {isLoadingMore ? (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span>Loading more...</span>
              </div>
            ) : (
              <Button variant="outline" onClick={onLoadMore}>
                Load More
              </Button>
            )}
          </div>
        )}
      </div>
    );
  })
);
