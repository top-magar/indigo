"use client";

import type { MediaAsset } from "@/features/media/types";

interface VideoPreviewProps {
  asset: MediaAsset;
  isFullscreen: boolean;
  showControls: boolean;
}

export function VideoPreview({ asset }: VideoPreviewProps) {
  return (
    <div className="flex items-center justify-center w-full h-full p-4">
      <video
        src={asset.cdnUrl}
        controls
        className="max-w-full max-h-full rounded-md"
        preload="metadata"
      >
        <track kind="captions" />
      </video>
    </div>
  );
}
