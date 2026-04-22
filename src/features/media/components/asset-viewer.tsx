"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { File, ArrowLeft, ArrowRight, X, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils";
import type { MediaAsset } from "@/features/media/types";
import { formatFileSize, getFileTypeCategory } from "@/features/media/types";
import { ImagePreview } from "./image-preview";
import { VideoPreview } from "./video-preview";
import { AssetInfoPanel } from "./asset-info-panel";

function Portal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

interface AssetViewerProps {
  asset: MediaAsset | null;
  assets?: MediaAsset[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
  onUpdated?: (asset: MediaAsset) => void;
  onNavigate?: (direction: "prev" | "next") => void;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
}

export function AssetViewer({
  asset, assets = [], open, onOpenChange,
  onDeleted, onUpdated, onNavigate,
  canNavigatePrev = false, canNavigateNext = false,
}: AssetViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(true);

  const fileType = useMemo(
    () => (asset ? getFileTypeCategory(asset.mimeType) : "unknown"),
    [asset],
  );

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => { if (open) setShowInfoPanel(true); }, [open]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "Escape": onOpenChange(false); break;
        case "ArrowLeft": if (fileType !== "video" && canNavigatePrev) onNavigate?.("prev"); break;
        case "ArrowRight": if (fileType !== "video" && canNavigateNext) onNavigate?.("next"); break;
        case "i": setShowInfoPanel(s => !s); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, fileType, canNavigatePrev, canNavigateNext, onNavigate, onOpenChange]);

  const handleDownload = useCallback(() => {
    if (!asset) return;
    const link = document.createElement("a");
    link.href = asset.cdnUrl;
    link.download = asset.originalFilename;
    link.click();
  }, [asset]);

  if (!asset || !isMounted || !open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 bg-foreground/80 flex items-center justify-center p-4 md:p-8" onClick={() => onOpenChange(false)}>
        <div
          className="relative w-full max-w-[95vw] h-[90vh] bg-background border rounded-lg overflow-hidden flex"
          onClick={e => e.stopPropagation()}
        >
          {/* Preview column */}
          <div className="flex-1 relative h-full bg-muted/30 flex items-center justify-center overflow-hidden group">
            {/* Nav arrows */}
            {canNavigatePrev && (
              <Button variant="ghost" size="icon" className="absolute left-3 z-20 size-10 rounded-full bg-foreground/20 hover:bg-foreground/40 text-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onNavigate?.("prev")}>
                <ArrowLeft className="size-4" />
              </Button>
            )}
            {canNavigateNext && (
              <Button variant="ghost" size="icon" className="absolute right-3 z-20 size-10 rounded-full bg-foreground/20 hover:bg-foreground/40 text-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onNavigate?.("next")}>
                <ArrowRight className="size-4" />
              </Button>
            )}

            {fileType === "image" && <ImagePreview asset={asset} isFullscreen showControls />}
            {fileType === "video" && <VideoPreview asset={asset} isFullscreen showControls />}
            {(fileType === "document" || fileType === "unknown") && (
              <div className="flex flex-col items-center justify-center gap-3 text-center p-8">
                <div className="size-16 rounded-lg bg-muted flex items-center justify-center">
                  <File className="size-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{asset.filename}</p>
                  <p className="text-xs text-muted-foreground">{asset.mimeType} · {formatFileSize(asset.sizeBytes)}</p>
                </div>
                <div className="flex gap-2 mt-1">
                  <Button size="sm" onClick={() => window.open(asset.cdnUrl, "_blank")}>
                    <ExternalLink className="size-3.5" /> Open
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="size-3.5" /> Download
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Info panel */}
          {showInfoPanel && (
            <AssetInfoPanel asset={asset} onDeleted={onDeleted} onUpdated={onUpdated} onClose={() => onOpenChange(false)} />
          )}
          {!showInfoPanel && (
            <Button variant="ghost" size="icon" className="absolute top-3 right-3 z-30 size-8 rounded-full bg-foreground/20 hover:bg-foreground/40 text-white" onClick={() => onOpenChange(false)}>
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </Portal>
  );
}
