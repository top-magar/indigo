"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
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

const overlayVariants = {
  initial: { opacity: 0, backdropFilter: "blur(0px)" },
  animate: { opacity: 1, backdropFilter: "blur(12px)" },
  exit: { opacity: 0, backdropFilter: "blur(0px)" },
};
const contentVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

export function AssetViewer({
  asset, assets = [], open, onOpenChange,
  onDeleted, onUpdated, onNavigate,
  canNavigatePrev = false, canNavigateNext = false,
}: AssetViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [documentOpened, setDocumentOpened] = useState(false);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isFullscreen = true;

  const fileType = useMemo(
    () => (asset ? getFileTypeCategory(asset.mimeType) : "unknown"),
    [asset],
  );

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => { setDocumentOpened(false); }, [asset?.id]);
  useEffect(() => { if (open) { setShowInfoPanel(true); setShowControls(true); } }, [open]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Auto-hide controls
  useEffect(() => {
    if (!open) return;
    const reset = () => {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };
    reset();
    window.addEventListener("mousemove", reset);
    return () => {
      window.removeEventListener("mousemove", reset);
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    };
  }, [open]);

  // Shell keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "Escape": onOpenChange(false); break;
        case "ArrowLeft": if (fileType !== "video" && canNavigatePrev) onNavigate?.("prev"); break;
        case "ArrowRight": if (fileType !== "video" && canNavigateNext) onNavigate?.("next"); break;
        case "i": setShowInfoPanel(s => !s); break;
        case "t": setShowThumbnails(s => !s); break;
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

  if (!asset || !isMounted) return null;

  const navButton = (dir: "prev" | "next", can: boolean, Icon: typeof ArrowLeft, extra: string) =>
    can ? (
      <Button
        variant="ghost" size="icon"
        className={cn("pointer-events-auto h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100", extra)}
        onClick={(e) => { e.stopPropagation(); onNavigate?.(dir); }}
      >
        <Icon className="size-5" />
      </Button>
    ) : null;

  return (
    <AnimatePresence>
      {open && (
        <Portal>
          <motion.div
            key="asset-viewer-overlay" variants={overlayVariants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-8"
            onClick={() => onOpenChange(false)}
          >
            <motion.div
              variants={contentVariants} initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.3, type: "spring", bounce: 0, damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[95vw] h-[90vh] bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl overflow-hidden flex"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview column */}
              <div className="flex-1 relative h-full bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-between px-4">
                  {navButton("prev", canNavigatePrev, ArrowLeft, "-translate-x-4 group-hover:translate-x-0")}
                  {navButton("next", canNavigateNext, ArrowRight, "ml-auto translate-x-4 group-hover:translate-x-0")}
                </div>

                {fileType === "image" && (
                  <ImagePreview asset={asset} isFullscreen={isFullscreen} showControls={showControls} />
                )}
                {fileType === "video" && (
                  <VideoPreview asset={asset} isFullscreen={isFullscreen} showControls={showControls} />
                )}
                {fileType === "document" && (
                  <div className="flex flex-col items-center justify-center gap-4 text-center p-8 animate-in fade-in zoom-in duration-300">
                    <div className="h-24 w-24 rounded-3xl bg-muted/50 flex items-center justify-center shadow-inner">
                      <File className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-xl">{asset.filename}</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        {asset.mimeType} • {formatFileSize(asset.sizeBytes)}
                      </p>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        Document preview is best viewed in a new browser tab.
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button onClick={() => { window.open(asset.cdnUrl, "_blank"); setDocumentOpened(true); }}>
                        <ExternalLink className="size-4 mr-2" />
                        {documentOpened ? "Open Again" : "Open in New Tab"}
                      </Button>
                      <Button onClick={handleDownload} variant="outline">
                        <Download className="size-4 mr-2" /> Download
                      </Button>
                    </div>
                  </div>
                )}
                {fileType === "unknown" && (
                  <div className="p-16 rounded-2xl border bg-white/5 backdrop-blur-sm text-white">
                    <div className="flex flex-col items-center justify-center gap-6">
                      <div className="h-20 w-20 rounded-2xl flex items-center justify-center bg-white/10">
                        <File className="h-10 w-10 text-white/50" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-sm">{asset.filename}</p>
                        <p className="text-sm mt-1 text-white/60">{asset.mimeType}</p>
                        <p className="text-sm text-white/60">{formatFileSize(asset.sizeBytes)}</p>
                      </div>
                      <Button onClick={handleDownload} variant="secondary" className="mt-2">
                        <Download className="size-4 mr-2" /> Download File
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
                <Button
                  variant="ghost" size="icon"
                  className="absolute top-4 right-4 z-30 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="size-4" />
                </Button>
              )}
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
