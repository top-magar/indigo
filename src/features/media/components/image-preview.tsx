"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Minus,
  Plus,
  Maximize,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Loader2,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/shared/utils";
import type { MediaAsset } from "@/features/media/types";

// --- Constants ---

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;

// --- Props ---

interface ImagePreviewProps {
  asset: MediaAsset;
  isFullscreen: boolean;
  showControls: boolean;
}

// --- Helpers ---

function getTouchDistance(touches: React.TouchList): number {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// --- Component ---

export function ImagePreview({ asset, isFullscreen, showControls }: ImagePreviewProps) {
  // --- State ---
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // --- Refs ---
  const panStartRef = useRef({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; distance: number } | null>(null);

  // --- Reset on asset change ---
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPanOffset({ x: 0, y: 0 });
    setIsLoading(true);
    setImageError(false);
  }, [asset.id]);

  // --- Memoized values ---
  const transformStyle = useMemo(() => {
    return [
      `scale(${zoom})`,
      `rotate(${rotation}deg)`,
      flipH ? "scaleX(-1)" : "",
      flipV ? "scaleY(-1)" : "",
      `translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
    ].filter(Boolean).join(" ");
  }, [zoom, rotation, flipH, flipV, panOffset]);

  const miniMapViewport = useMemo(() => {
    if (zoom <= 1) return null;
    const viewportWidth = 100 / zoom;
    const viewportHeight = 100 / zoom;
    const offsetX = 50 - (panOffset.x / (zoom * 4)) - viewportWidth / 2;
    const offsetY = 50 - (panOffset.y / (zoom * 4)) - viewportHeight / 2;
    return {
      width: viewportWidth,
      height: viewportHeight,
      left: Math.max(0, Math.min(100 - viewportWidth, offsetX)),
      top: Math.max(0, Math.min(100 - viewportHeight, offsetY)),
    };
  }, [zoom, panOffset]);

  // --- Zoom callbacks ---
  const handleZoomIn = useCallback(() => {
    setZoom(z => ZOOM_LEVELS.find(level => level > z) || MAX_ZOOM);
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(z => [...ZOOM_LEVELS].reverse().find(level => level < z) || MIN_ZOOM);
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // --- Pan callbacks ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  }, [zoom, panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && zoom > 1) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  }, [isPanning, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // --- Touch callbacks ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        distance: getTouchDistance(e.touches),
      };
    } else if (e.touches.length === 1 && zoom > 1) {
      setIsPanning(true);
      panStartRef.current = {
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      };
    }
  }, [zoom, panOffset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartRef.current) {
      const newDistance = getTouchDistance(e.touches);
      const scale = newDistance / touchStartRef.current.distance;
      setZoom(z => Math.min(Math.max(z * scale, MIN_ZOOM), MAX_ZOOM));
      touchStartRef.current.distance = newDistance;
    } else if (e.touches.length === 1 && isPanning) {
      setPanOffset({
        x: e.touches[0].clientX - panStartRef.current.x,
        y: e.touches[0].clientY - panStartRef.current.y,
      });
    }
  }, [isPanning]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    setIsPanning(false);
  }, []);

  // --- Wheel zoom ---
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom(z => Math.min(Math.max(z + z * delta, MIN_ZOOM), MAX_ZOOM));
  }, []);

  // --- Double click ---
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (zoom === 1) {
      setZoom(2);
      const rect = imageContainerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setPanOffset({ x: -x, y: -y });
      }
    } else {
      resetView();
    }
  }, [zoom, resetView]);

  // --- Image load/error ---
  const handleImageLoad = useCallback(() => setIsLoading(false), []);
  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setImageError(true);
  }, []);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "+": case "=":
          setZoom(z => Math.min(z * 1.25, MAX_ZOOM));
          break;
        case "-":
          setZoom(z => Math.max(z / 1.25, MIN_ZOOM));
          break;
        case "0":
          resetView();
          break;
        case "r":
          setRotation(r => (r + 90) % 360);
          break;
        case "R":
          setRotation(r => (r - 90 + 360) % 360);
          break;
        case "h":
          setFlipH(f => !f);
          break;
        case "v":
          setFlipV(f => !f);
          break;
        case "m":
          setShowMiniMap(s => !s);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetView]);

  // --- Render ---
  return (
    <div
      ref={imageContainerRef}
      className="relative w-full h-full flex items-center justify-center"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className={cn("size-8 animate-spin", isFullscreen ? "text-white/60" : "text-muted-foreground")} />
            <span className={cn("text-sm", isFullscreen ? "text-white/60" : "text-muted-foreground")}>Loading image...</span>
          </div>
        </div>
      )}
      {imageError ? (
        <div className={cn("text-center p-8", isFullscreen ? "text-white" : "")}>
          <File className="h-16 w-16 mx-auto opacity-50" />
          <p className={cn("mt-4", isFullscreen ? "text-white/60" : "text-muted-foreground")}>Failed to load image</p>
          <Button variant="secondary" className="mt-4" onClick={() => setImageError(false)}>
            Retry
          </Button>
        </div>
      ) : (
        <img
          src={asset.cdnUrl}
          alt={asset.altText || asset.filename}
          className={cn(
            "select-none transition-opacity duration-300 object-contain",
            isFullscreen
              ? "max-w-[95vw] max-h-[90vh]"
              : "max-w-[calc(100%-2rem)] max-h-[calc(85vh-2rem)] rounded-xl shadow-2xl",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          style={{
            transform: transformStyle,
            transition: isPanning ? "none" : "transform 0.2s ease-out, opacity 0.3s ease-out",
          }}
          draggable={false}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Minimap */}
      {showMiniMap && zoom > 1 && !isLoading && !imageError && (
        <div className="absolute bottom-4 right-4 w-40 aspect-square bg-black/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden z-30 shadow-xl pointer-events-none">
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset.cdnUrl}
              alt="Minimap"
              className="w-full h-full object-contain opacity-50"
            />
            <div
              className="absolute border-2 border-white/80 bg-white/10 shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]"
              style={{
                left: `${miniMapViewport?.left}%`,
                top: `${miniMapViewport?.top}%`,
                width: `${miniMapViewport?.width}%`,
                height: `${miniMapViewport?.height}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Zoom Controls Toolbar */}
      {showControls && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          <div className={cn(
            "flex items-center gap-1 rounded-full px-1.5 py-1 shadow-lg z-10",
            isFullscreen
              ? "bg-black/60 backdrop-blur-md border border-white/10"
              : "bg-background/90 backdrop-blur-sm"
          )}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("size-7 rounded-full", isFullscreen && "text-white/80 hover:text-white hover:bg-white/10")}
                  onClick={handleZoomOut}
                  disabled={zoom <= MIN_ZOOM}
                >
                  <Minus className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom out (-)</TooltipContent>
            </Tooltip>

            <button
              className={cn(
                "text-xs font-medium w-12 text-center tabular-nums rounded px-1 py-0.5 transition-colors",
                isFullscreen ? "text-white/90 hover:bg-white/10" : "hover:bg-muted"
              )}
              onClick={resetView}
            >
              {Math.round(zoom * 100)}%
            </button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("size-7 rounded-full", isFullscreen && "text-white/80 hover:text-white hover:bg-white/10")}
                  onClick={handleZoomIn}
                  disabled={zoom >= MAX_ZOOM}
                >
                  <Plus className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom in (+)</TooltipContent>
            </Tooltip>

            <div className={cn("w-px h-5 mx-1", isFullscreen ? "bg-white/20" : "bg-border")} />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("size-7 rounded-full", isFullscreen && "text-white/80 hover:text-white hover:bg-white/10")}
                  onClick={resetView}
                >
                  <Maximize className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fit to view (0)</TooltipContent>
            </Tooltip>

            <div className={cn("w-px h-5 mx-1", isFullscreen ? "bg-white/20" : "bg-border")} />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("size-7 rounded-full", isFullscreen && "text-white/80 hover:text-white hover:bg-white/10")}
                  onClick={() => setRotation(r => (r - 90 + 360) % 360)}
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rotate left (Shift+R)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("size-7 rounded-full", isFullscreen && "text-white/80 hover:text-white hover:bg-white/10")}
                  onClick={() => setRotation(r => (r + 90) % 360)}
                >
                  <RotateCw className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rotate right (R)</TooltipContent>
            </Tooltip>

            <div className={cn("w-px h-5 mx-1", isFullscreen ? "bg-white/20" : "bg-border")} />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={flipH ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "size-7 rounded-full",
                    isFullscreen && !flipH && "text-white/80 hover:text-white hover:bg-white/10",
                    isFullscreen && flipH && "text-white bg-white/20"
                  )}
                  onClick={() => setFlipH(f => !f)}
                >
                  <FlipHorizontal className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Flip horizontal (H)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={flipV ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "size-7 rounded-full",
                    isFullscreen && !flipV && "text-white/80 hover:text-white hover:bg-white/10",
                    isFullscreen && flipV && "text-white bg-white/20"
                  )}
                  onClick={() => setFlipV(f => !f)}
                >
                  <FlipVertical className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Flip vertical (V)</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
}
