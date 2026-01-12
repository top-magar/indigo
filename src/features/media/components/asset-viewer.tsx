"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Copy,
  Trash2,
  Download,
  File,
  Image,
  Video,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Maximize,
  Minus,
  Plus,
  Move,
  ExternalLink,
  Calendar,
  HardDrive,
  Grid,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Loader2,
  Share,
  Minimize,
  Info,
  Eye,
  EyeOff,
  FolderOpen,
  Mail,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Repeat,
  FastForward,
  Rewind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/shared/utils";
import type { MediaAsset } from "@/features/media/types";
import { formatFileSize, getFileTypeCategory } from "@/features/media/types";
import { updateAsset, deleteAsset } from "@/app/dashboard/media/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Simple portal wrapper - no hooks to avoid order issues
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

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;

export function AssetViewer({
  asset,
  assets = [],
  open,
  onOpenChange,
  onDeleted,
  onUpdated,
  onNavigate,
  canNavigatePrev = false,
  canNavigateNext = false,
}: AssetViewerProps) {
  // SSR mount state
  const [isMounted, setIsMounted] = useState(false);

  // View mode state
  const isFullscreen = true;
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Form state
  const [filename, setFilename] = useState("");
  const [altText, setAltText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  // Image viewer state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Document viewer state
  const [isDocumentLoading, setIsDocumentLoading] = useState(true);
  const [documentError, setDocumentError] = useState(false);

  // Video player state
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);

  // Refs
  const panStartRef = useRef({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const touchStartRef = useRef<{ x: number; y: number; distance: number } | null>(null);

  // File type - needed early for keyboard shortcuts
  const fileType: "image" | "video" | "document" | "unknown" = useMemo(
    () => asset ? getFileTypeCategory(asset.mimeType) : "unknown",
    [asset]
  );

  // Reset state when asset ID or URL changes (new asset loaded)
  useEffect(() => {
    if (asset?.id && asset?.cdnUrl) {
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setPanOffset({ x: 0, y: 0 });
      setActiveTab("info");
      setIsLoading(true);
      setImageError(false);
      setIsDocumentLoading(true);
      setDocumentError(false);
      setIsVideoLoading(true);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setPlaybackRate(1);
    }
  }, [asset?.id, asset?.cdnUrl]);

  // SSR mount effect
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update form state when asset metadata changes
  useEffect(() => {
    if (asset) {
      setFilename(asset.filename);
      setAltText(asset.altText || "");
    }
  }, [asset]);

  // Reset view mode when dialog opens
  useEffect(() => {
    if (open) {
      setShowInfoPanel(true);
      setShowControls(true);
    }
  }, [open]);

  // Auto-hide controls in fullscreen mode
  useEffect(() => {
    if (!open) return;

    const resetHideTimer = () => {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      hideControlsTimeoutRef.current = setTimeout(() => {
        if (!isPanning) setShowControls(false);
      }, 3000);
    };

    resetHideTimer();
    window.addEventListener("mousemove", resetHideTimer);

    return () => {
      window.removeEventListener("mousemove", resetHideTimer);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [open, isPanning]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          if (fileType === "video" && videoRef.current) {
            const newTime = Math.max(0, videoRef.current.currentTime - 10);
            videoRef.current.currentTime = newTime;
          } else if (canNavigatePrev) {
            onNavigate?.("prev");
          }
          break;
        case "ArrowRight":
          if (fileType === "video" && videoRef.current) {
            const newTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 10);
            videoRef.current.currentTime = newTime;
          } else if (canNavigateNext) {
            onNavigate?.("next");
          }
          break;
        case "Escape":
          onOpenChange(false);
          break;
        case "+":
        case "=":
          if (fileType === "image") setZoom(z => Math.min(z * 1.25, MAX_ZOOM));
          break;
        case "-":
          if (fileType === "image") setZoom(z => Math.max(z / 1.25, MIN_ZOOM));
          break;
        case "0":
          if (fileType === "image") {
            setZoom(1);
            setRotation(0);
            setFlipH(false);
            setFlipV(false);
            setPanOffset({ x: 0, y: 0 });
          }
          break;
        case "r":
          if (fileType === "image") setRotation(r => (r + 90) % 360);
          break;
        case "R":
          if (fileType === "image") setRotation(r => (r - 90 + 360) % 360);
          break;
        case "h":
          if (fileType === "image") setFlipH(f => !f);
          break;
        case "v":
          if (fileType === "image") setFlipV(f => !f);
          break;
        case " ":
          if (fileType === "video" && videoRef.current) {
            e.preventDefault();
            if (videoRef.current.paused) {
              videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
          }
          break;
        case "k":
          if (fileType === "video" && videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
          }
          break;
        case "j":
          if (fileType === "video" && videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          }
          break;
        case "l":
          if (fileType === "video" && videoRef.current) {
            videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 10);
          }
          break;
        case "m":
          if (fileType === "video" && videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
          } else if (fileType === "image") {
            setShowMiniMap(s => !s);
          }
          break;
        case "f":
          if (fileType === "video" && videoRef.current) {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              videoRef.current.requestFullscreen();
            }
          }
          break;
        case "i":
          setShowInfoPanel(s => !s);
          break;
        case "t":
          setShowThumbnails(s => !s);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, canNavigatePrev, canNavigateNext, onNavigate, onOpenChange, fileType]);

  // Video control handlers
  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const skipTime = useCallback((seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [currentTime, duration]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, []);

  const toggleLoop = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.loop = !isLooping;
      setIsLooping(!isLooping);
    }
  }, [isLooping]);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Zoom helpers
  const handleZoomIn = useCallback(() => {
    setZoom(z => {
      const nextLevel = ZOOM_LEVELS.find(level => level > z);
      return nextLevel || MAX_ZOOM;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(z => {
      const prevLevel = [...ZOOM_LEVELS].reverse().find(level => level < z);
      return prevLevel || MIN_ZOOM;
    });
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Pan handlers
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

  // Touch handlers for pinch-to-zoom
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

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
        y: e.touches[0].clientY - panOffset.y
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

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom(z => Math.min(Math.max(z + z * delta, MIN_ZOOM), MAX_ZOOM));
  }, []);

  // Double click to zoom
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

  // Copy URL to clipboard
  const handleCopyUrl = useCallback(() => {
    if (asset) {
      navigator.clipboard.writeText(asset.cdnUrl);
      setCopied(true);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [asset]);

  // Download asset
  const handleDownload = useCallback(() => {
    if (asset) {
      const link = document.createElement("a");
      link.href = asset.cdnUrl;
      link.download = asset.originalFilename;
      link.click();
      toast.success("Download started");
    }
  }, [asset]);

  // Share
  const handleShare = useCallback(async () => {
    if (asset && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: asset.filename,
          url: asset.cdnUrl,
        });
      } catch {
        handleCopyUrl();
      }
    } else {
      handleCopyUrl();
    }
  }, [asset, handleCopyUrl]);

  // Share via Email
  const handleEmailShare = useCallback(() => {
    if (asset) {
      const subject = `Check out this asset: ${asset.filename}`;
      const body = `I wanted to share this asset with you:\n\n${asset.cdnUrl}`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  }, [asset]);

  // Native Share
  const handleNativeShare = useCallback(async () => {
    if (asset && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: asset.filename,
          url: asset.cdnUrl,
        });
      } catch {
        // Ignore aborts
      }
    }
  }, [asset]);

  // Save changes
  const handleSave = useCallback(async () => {
    if (!asset) return;

    setIsSaving(true);
    try {
      const result = await updateAsset(asset.id, {
        filename: filename.trim(),
        altText: altText.trim() || undefined,
      });

      if (result.success) {
        toast.success("Asset updated");
        onUpdated?.({
          ...asset,
          filename: filename.trim(),
          altText: altText.trim() || null,
        });
      } else {
        toast.error(result.error || "Failed to update asset");
      }
    } catch {
      toast.error("Failed to update asset");
    } finally {
      setIsSaving(false);
    }
  }, [asset, filename, altText, onUpdated]);

  // Delete asset
  const handleDelete = useCallback(async () => {
    if (!asset) return;

    setIsDeleting(true);
    try {
      const result = await deleteAsset(asset.id);

      if (result.success) {
        toast.success("Asset deleted");
        setShowDeleteDialog(false);
        onOpenChange(false);
        onDeleted?.();
      } else {
        toast.error(result.error || "Failed to delete asset");
      }
    } catch {
      toast.error("Failed to delete asset");
    } finally {
      setIsDeleting(false);
    }
  }, [asset, onOpenChange, onDeleted]);

  // Memoized values - MUST be before early return
  const formattedDate = useMemo(() => {
    if (!asset) return "";
    return new Date(asset.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [asset]);

  const aspectRatio = useMemo(() => {
    if (!asset?.width || !asset?.height) return null;
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(asset.width, asset.height);
    return `${asset.width / divisor}:${asset.height / divisor}`;
  }, [asset]);

  const megapixels = useMemo(() => {
    if (!asset?.width || !asset?.height) return null;
    return ((asset.width * asset.height) / 1000000).toFixed(1);
  }, [asset]);

  const transformStyle = useMemo(() => {
    const transforms = [
      `scale(${zoom})`,
      `rotate(${rotation}deg)`,
      flipH ? "scaleX(-1)" : "",
      flipV ? "scaleY(-1)" : "",
      `translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
    ].filter(Boolean).join(" ");
    return transforms;
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

  const currentIndex = useMemo(() => {
    if (!asset || !assets.length) return -1;
    return assets.findIndex(a => a.id === asset.id);
  }, [asset, assets]);

  // Video error state
  const [videoError, setVideoError] = useState(false);

  // Document opened state
  const [documentOpened, setDocumentOpened] = useState(false);

  // Reset document opened state when asset changes
  useEffect(() => {
    setDocumentOpened(false);
    setVideoError(false);
  }, [asset?.id]);

  // Scroll lock hook - MUST be before early return
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Early return AFTER all hooks
  if (!asset || !isMounted) return null;

  // Render image preview
  const renderImagePreview = () => (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className={cn("h-8 w-8 animate-spin", isFullscreen ? "text-white/60" : "text-muted-foreground")} />
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
              ? showInfoPanel 
                ? "max-w-[calc(95vw-400px)] max-h-[85vh]"
                : "max-w-[95vw] max-h-[90vh]"
              : "max-w-[calc(100%-2rem)] max-h-[calc(85vh-2rem)] rounded-xl shadow-2xl",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          style={{
            transform: transformStyle,
            transition: isPanning ? "none" : "transform 0.2s ease-out, opacity 0.3s ease-out",
          }}
          draggable={false}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setImageError(true);
          }}
        />
      )}
    </>
  );

  // Render video preview
  const renderVideoPreview = () => (
    videoError ? (
      <div className={cn("text-center p-8", isFullscreen ? "text-white" : "")}>
        <Video className="h-16 w-16 mx-auto opacity-50" />
        <p className={cn("mt-4", isFullscreen ? "text-white/60" : "text-muted-foreground")}>Failed to load video</p>
        <div className="flex gap-2 justify-center mt-4">
          <Button variant="secondary" onClick={() => setVideoError(false)}>
            Retry
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    ) : (
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {isVideoLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-white/60" />
              <span className="text-sm text-white/60">Loading video...</span>
            </div>
          </div>
        )}
        <video
          ref={videoRef}
          key={asset.id}
          controls
          autoPlay
          muted={isMuted}
          loop={isLooping}
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          className={cn(
            "rounded-xl object-contain",
            isFullscreen 
              ? "max-w-[calc(95vw-360px)] max-h-[85vh]" 
              : "max-w-full max-h-[85vh] shadow-2xl",
            !showInfoPanel && isFullscreen && "max-w-[95vw]",
            isVideoLoading ? "opacity-0" : "opacity-100",
            "transition-opacity duration-300"
          )}
          onLoadedMetadata={(e) => {
            const video = e.currentTarget;
            setDuration(video.duration);
            setIsVideoLoading(false);
          }}
          onTimeUpdate={(e) => {
            setCurrentTime(e.currentTarget.currentTime);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            setVideoError(true);
            setIsVideoLoading(false);
          }}
          onVolumeChange={(e) => {
            setVolume(e.currentTarget.volume);
            setIsMuted(e.currentTarget.muted);
          }}
        >
          <source src={asset.cdnUrl} type={asset.mimeType} />
          Your browser does not support the video tag.
        </video>
      </div>
    )
  );

  // Render video controls toolbar
  const renderVideoControls = () => (
    <div className={cn(
      "flex items-center gap-1 rounded-full px-2 py-1 shadow-lg z-10",
      "bg-black/60 backdrop-blur-md border border-white/10"
    )}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => skipTime(-10)}
          >
            <Rewind className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Skip back 10s (J)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white hover:bg-white/10"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isPlaying ? "Pause (K)" : "Play (K)"}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => skipTime(10)}
          >
            <FastForward className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Skip forward 10s (L)</TooltipContent>
      </Tooltip>

      <div className="w-px h-5 mx-1 bg-white/20" />

      <span className="text-xs text-white/80 tabular-nums px-1 min-w-[70px] text-center">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      <div className="w-px h-5 mx-1 bg-white/20" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-white/80 hover:text-white hover:bg-white/10"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isMuted ? "Unmute (M)" : "Mute (M)"}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isLooping ? "secondary" : "ghost"}
            size="icon"
            className={cn(
              "h-7 w-7 rounded-full",
              !isLooping && "text-white/80 hover:text-white hover:bg-white/10",
              isLooping && "text-white bg-white/20"
            )}
            onClick={toggleLoop}
          >
            <Repeat className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isLooping ? "Disable loop" : "Enable loop"}</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 text-xs"
          >
            {playbackRate}x
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="min-w-[80px]">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <DropdownMenuItem
              key={rate}
              onClick={() => handlePlaybackRateChange(rate)}
              className={cn(playbackRate === rate && "bg-primary/10 text-primary font-medium")}
            >
              {rate}x
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => {
              if (videoRef.current) {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  videoRef.current.requestFullscreen();
                }
              }
            }}
          >
            <Maximize className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Fullscreen (F)</TooltipContent>
      </Tooltip>
    </div>
  );

  const renderFilePreview = () => (
    <div className={cn(
      "p-16 rounded-2xl border",
      isFullscreen ? "bg-white/5 backdrop-blur-sm text-white" : "bg-background shadow-2xl"
    )}>
      <div className="flex flex-col items-center justify-center gap-6">
        <div className={cn(
          "h-20 w-20 rounded-2xl flex items-center justify-center",
          isFullscreen ? "bg-white/10" : "bg-muted"
        )}>
          <File className={cn("h-10 w-10", isFullscreen ? "text-white/50" : "text-muted-foreground")} />
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg">{asset.filename}</p>
          <p className={cn("text-sm mt-1", isFullscreen ? "text-white/60" : "text-muted-foreground")}>{asset.mimeType}</p>
          <p className={cn("text-sm", isFullscreen ? "text-white/60" : "text-muted-foreground")}>{formatFileSize(asset.sizeBytes)}</p>
        </div>
        <Button onClick={handleDownload} variant={isFullscreen ? "secondary" : "default"} className="mt-2">
          <Download className="h-4 w-4 mr-2" />
          Download File
        </Button>
      </div>
    </div>
  );

  // Render zoom controls toolbar
  const renderZoomControls = () => (
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
            className={cn("h-7 w-7 rounded-full", isFullscreen && "text-white/80 hover:text-white hover:bg-white/10")}
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
          >
            <Minus className="h-3.5 w-3.5" />
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
            className={cn("h-7 w-7 rounded-full", isFullscreen && "text-white/80 hover:text-white hover:bg-white/10")}
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
          >
            <Plus className="h-3.5 w-3.5" />
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
            className={cn("h-7 w-7 rounded-full", isFullscreen && "text-white/80 hover:text-white hover:bg-white/10")}
            onClick={resetView}
          >
            <Maximize className="h-3.5 w-3.5" />
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
            className={cn("h-7 w-7 rounded-full", isFullscreen && "text-white/80 hover:text-white hover:bg-white/10")}
            onClick={() => setRotation(r => (r - 90 + 360) % 360)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Rotate left (Shift+R)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 rounded-full", isFullscreen && "text-white/80 hover:text-white hover:bg-white/10")}
            onClick={() => setRotation(r => (r + 90) % 360)}
          >
            <RotateCw className="h-3.5 w-3.5" />
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
              "h-7 w-7 rounded-full",
              isFullscreen && !flipH && "text-white/80 hover:text-white hover:bg-white/10",
              isFullscreen && flipH && "text-white bg-white/20"
            )}
            onClick={() => setFlipH(f => !f)}
          >
            <FlipHorizontal className="h-3.5 w-3.5" />
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
              "h-7 w-7 rounded-full",
              isFullscreen && !flipV && "text-white/80 hover:text-white hover:bg-white/10",
              isFullscreen && flipV && "text-white bg-white/20"
            )}
            onClick={() => setFlipV(f => !f)}
          >
            <FlipVertical className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Flip vertical (V)</TooltipContent>
      </Tooltip>
    </div>
  );

  // Animation variants
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

  return (
    <>
      <AnimatePresence>
        {open && (
          <Portal>
            <motion.div
              key="asset-viewer-overlay"
              variants={overlayVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-8"
              onClick={() => onOpenChange(false)}
            >
            <motion.div
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, type: "spring", bounce: 0, damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[95vw] h-[90vh] bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl overflow-hidden flex"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Column: Preview */}
              <div className="flex-1 relative h-full bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden group">
                {/* Navigation Overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-between px-4">
                  {canNavigatePrev && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="pointer-events-auto h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate?.("prev");
                      }}
                    >
                      <ArrowLeft className="h-6 w-6" />
                    </Button>
                  )}
                  {canNavigateNext && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="pointer-events-auto h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all ml-auto opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate?.("next");
                      }}
                    >
                      <ArrowRight className="h-6 w-6" />
                    </Button>
                  )}
                </div>

                {fileType === "document" ? (
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
                      <Button 
                        onClick={() => {
                          window.open(asset.cdnUrl, "_blank");
                          setDocumentOpened(true);
                        }} 
                        variant="default"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {documentOpened ? "Open Again" : "Open in New Tab"}
                      </Button>
                      <Button onClick={handleDownload} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="relative w-full h-full flex items-center justify-center"
                    ref={imageContainerRef}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {fileType === "image" && renderImagePreview()}
                    {fileType === "video" && renderVideoPreview()}
                    {fileType === "unknown" && renderFilePreview()}

                    {/* Mini-map for zoomed images */}
                    {fileType === "image" && zoom > 1 && !isLoading && !imageError && (
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

                    {/* Zoom Controls - only for images */}
                    {fileType === "image" && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                        {renderZoomControls()}
                      </div>
                    )}

                    {/* Video Controls */}
                    {fileType === "video" && !videoError && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                        {renderVideoControls()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Details Panel */}
              <div className="w-[360px] shrink-0 border-l bg-background flex flex-col h-full relative z-10">
                <div className="p-4 border-b flex items-center justify-between shrink-0 bg-background/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <h2 className="font-semibold truncate text-sm" title={asset.filename}>
                      {asset.filename}
                    </h2>
                  </div>
                  <Button variant="ghost" size="icon-sm" radius="full" onClick={() => onOpenChange(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-hidden">
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="w-full h-full flex flex-col">
                    <div className="px-4 pt-4 shrink-0">
                      <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="info">Info</TabsTrigger>
                        <TabsTrigger value="edit">Edit</TabsTrigger>
                      </TabsList>
                    </div>

                    <ScrollArea className="flex-1">
                      <div className="p-4 pb-20">
                        <TabsContent value="info" className="mt-0 space-y-6">
                          <div className="space-y-4">
                            <div className="aspect-video bg-muted rounded-xl overflow-hidden border flex items-center justify-center relative group">
                              {fileType === "image" ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={asset.cdnUrl} alt={asset.filename} className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                  {fileType === "video" ? <Video className="h-8 w-8" /> :
                                    fileType === "document" ? <File className="h-8 w-8" /> :
                                      <File className="h-8 w-8" />}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button size="sm" variant="secondary" onClick={handleDownload}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <Button variant="outline" size="sm" onClick={handleCopyUrl} className="w-full">
                                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                {copied ? "Copied" : "Copy Link"}
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Share className="h-4 w-4 mr-2" />
                                    Share
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={handleCopyUrl}>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Copy Link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={handleEmailShare}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email
                                  </DropdownMenuItem>
                                  {typeof navigator !== 'undefined' && typeof navigator.share === "function" && (
                                    <DropdownMenuItem onClick={handleNativeShare}>
                                      <Share className="h-4 w-4 mr-2" />
                                      System Share
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h3 className="font-medium flex items-center gap-2 text-sm">
                              <Info className="h-4 w-4 text-primary" />
                              Metadata
                            </h3>
                            <div className="grid gap-3 text-sm">
                              <div className="grid grid-cols-[24px_1fr_auto] gap-3 items-center">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Created</span>
                                <span className="font-medium">{formattedDate}</span>
                              </div>
                              <div className="grid grid-cols-[24px_1fr_auto] gap-3 items-center">
                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Size</span>
                                <span className="font-medium">{formatFileSize(asset.sizeBytes)}</span>
                              </div>
                              <div className="grid grid-cols-[24px_1fr_auto] gap-3 items-center">
                                <File className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Type</span>
                                <Badge variant="secondary" className="font-normal uppercase text-[10px] h-5">{asset.mimeType.split('/')[1]}</Badge>
                              </div>
                              {(asset.width && asset.height) && (
                                <>
                                  <div className="grid grid-cols-[24px_1fr_auto] gap-3 items-center">
                                    <Grid className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Dimensions</span>
                                    <span className="font-medium">{asset.width} × {asset.height}</span>
                                  </div>
                                  <div className="grid grid-cols-[24px_1fr_auto] gap-3 items-center">
                                    <Image className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Megapixels</span>
                                    <span className="font-medium">{megapixels} MP</span>
                                  </div>
                                </>
                              )}
                              <div className="grid grid-cols-[24px_1fr_auto] gap-3 items-center">
                                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Folder</span>
                                <span className="font-medium">{asset.folderId ? asset.folderId : "Root"}</span>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="edit" className="mt-0 space-y-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="filename">Filename</Label>
                              <Input
                                id="filename"
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                placeholder="Enter filename"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="altText">Alt Text</Label>
                              <Textarea
                                id="altText"
                                value={altText}
                                onChange={(e) => setAltText(e.target.value)}
                                placeholder="Describe the asset for accessibility"
                                className="resize-none h-32"
                              />
                              <p className="text-xs text-muted-foreground">
                                Good alt text helps screen readers and search engines understand your asset.
                              </p>
                            </div>
                          </div>

                          <div className="pt-4 border-t flex items-center justify-between gap-4">
                            <Button
                              variant="destructive"
                              onClick={() => setShowDeleteDialog(true)}
                              className="w-full sm:w-auto"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                            <Button
                              onClick={handleSave}
                              disabled={isSaving || (filename === asset.filename && altText === (asset.altText || ""))}
                              className="w-full sm:w-auto"
                            >
                              {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                        </TabsContent>
                      </div>
                    </ScrollArea>
                  </Tabs>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent className="z-60">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the asset.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}