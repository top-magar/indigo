"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, ImageOff } from "lucide-react";
import { cn } from "@/shared/utils";
import type { MediaAsset } from "@/features/media/types";

interface ImagePreviewProps {
  asset: MediaAsset;
  isFullscreen: boolean;
  showControls: boolean;
}

export function ImagePreview({ asset, isFullscreen }: ImagePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
        <ImageOff className="size-8" />
        <p className="text-sm">Failed to load image</p>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full p-4">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <Image
        src={asset.cdnUrl}
        alt={asset.altText || asset.filename}
        width={asset.width || 800}
        height={asset.height || 600}
        className={cn("max-w-full max-h-full object-contain rounded-md", loading && "opacity-0")}
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
        unoptimized
        priority
      />
    </div>
  );
}
