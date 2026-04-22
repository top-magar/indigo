"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Repeat,
  FastForward,
  Rewind,
  Maximize,
  Download,
  Loader2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/shared/utils";
import type { MediaAsset } from "@/features/media/types";

interface VideoPreviewProps {
  asset: MediaAsset;
  isFullscreen: boolean;
  showControls: boolean;
}

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export function VideoPreview({
  asset,
  isFullscreen,
  showControls,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Reset state when asset changes
  useEffect(() => {
    setIsVideoLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackRate(1);
    setIsLooping(false);
    setVideoError(false);
  }, [asset.id]);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const skipTime = useCallback(
    (seconds: number) => {
      if (!videoRef.current) return;
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [currentTime, duration],
  );

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const toggleLoop = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.loop = !isLooping;
    setIsLooping(!isLooping);
  }, [isLooping]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowLeft":
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(
              0,
              videoRef.current.currentTime - 10,
            );
          }
          break;
        case "ArrowRight":
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(
              videoRef.current.duration || 0,
              videoRef.current.currentTime + 10,
            );
          }
          break;
        case "m":
          toggleMute();
          break;
        case "k":
          togglePlayPause();
          break;
        case "j":
          skipTime(-10);
          break;
        case "l":
          skipTime(10);
          break;
        case "f":
          if (videoRef.current) {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              videoRef.current.requestFullscreen();
            }
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause, toggleMute, skipTime]);

  if (videoError) {
    return (
      <div
        className={cn("text-center p-8", isFullscreen ? "text-white" : "")}
      >
        <Video className="h-16 w-16 mx-auto opacity-50" />
        <p
          className={cn(
            "mt-4",
            isFullscreen ? "text-white/60" : "text-muted-foreground",
          )}
        >
          Failed to load video
        </p>
        <div className="flex gap-2 justify-center mt-4">
          <Button variant="secondary" onClick={() => setVideoError(false)}>
            Retry
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const link = document.createElement("a");
              link.href = asset.cdnUrl;
              link.download = asset.originalFilename;
              link.click();
            }}
          >
            <Download className="size-3.5" />
            Download
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      {isVideoLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-white/60" />
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
            : "max-w-full max-h-[85vh]",
          !showControls && isFullscreen && "max-w-[95vw]",
          isVideoLoading ? "opacity-0" : "opacity-100",
          "transition-opacity duration-300",
        )}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          setIsVideoLoading(false);
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
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

      {/* Video Controls Bar */}
      {!videoError && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 shadow-lg z-10",
              "bg-black/60 backdrop-blur-md border border-white/10",
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => skipTime(-10)}
                >
                  <Rewind className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Skip back 10s (J)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full text-white hover:bg-white/10"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPlaying ? "Pause (K)" : "Play (K)"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => skipTime(10)}
                >
                  <FastForward className="size-3.5" />
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
                  className="size-7 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="size-3.5" />
                  ) : (
                    <Volume2 className="size-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isMuted ? "Unmute (M)" : "Mute (M)"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isLooping ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "size-7 rounded-full",
                    !isLooping &&
                      "text-white/80 hover:text-white hover:bg-white/10",
                    isLooping && "text-white bg-white/20",
                  )}
                  onClick={toggleLoop}
                >
                  <Repeat className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isLooping ? "Disable loop" : "Enable loop"}
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
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
                    className={cn(
                      playbackRate === rate &&
                        "bg-primary/10 text-primary font-medium",
                    )}
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
                  className="size-7 rounded-full text-white/80 hover:text-white hover:bg-white/10"
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
                  <Maximize className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fullscreen (F)</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
}
