"use client";

import { useNode, useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayIcon } from "@hugeicons/core-free-icons";
import type { VideoProps } from "@/lib/craft-editor/types";
import { VideoSettings } from "../settings";

const ASPECT_RATIO_MAP = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
    "9:16": "aspect-[9/16]",
};

function getEmbedUrl(src: string, provider: string): string {
    if (!src) return "";
    
    if (provider === "youtube") {
        // Extract video ID from various YouTube URL formats
        const match = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    if (provider === "vimeo") {
        const match = src.match(/vimeo\.com\/(\d+)/);
        if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
    
    return src;
}

export function Video({
    src = "",
    provider = "youtube",
    autoplay = false,
    loop = false,
    muted = false,
    controls = true,
    aspectRatio = "16:9",
    poster,
}: VideoProps) {
    const { connectors: { connect, drag }, selected, hovered } = useNode((state) => ({
        selected: state.events.selected,
        hovered: state.events.hovered,
    }));
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

    const embedUrl = getEmbedUrl(src, provider);

    if (!src) {
        return (
            <div
                ref={(ref) => { if (ref) connect(drag(ref)); }}
                className={cn(
                    "flex items-center justify-center bg-muted rounded-xl transition-all w-full",
                    ASPECT_RATIO_MAP[aspectRatio],
                    enabled && selected && "ring-2 ring-primary ring-inset",
                    enabled && hovered && !selected && "ring-2 ring-primary/40 ring-inset",
                    enabled && "cursor-move"
                )}
            >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <HugeiconsIcon icon={PlayIcon} className="h-12 w-12" />
                    <span className="text-sm">Add video URL</span>
                </div>
            </div>
        );
    }

    if (provider === "custom") {
        return (
            <div
                ref={(ref) => { if (ref) connect(drag(ref)); }}
                className={cn(
                    "relative rounded-xl overflow-hidden transition-all w-full",
                    ASPECT_RATIO_MAP[aspectRatio],
                    enabled && selected && "ring-2 ring-primary ring-inset",
                    enabled && hovered && !selected && "ring-2 ring-primary/40 ring-inset",
                    enabled && "cursor-move"
                )}
            >
                <video
                    src={src}
                    poster={poster}
                    autoPlay={autoplay}
                    loop={loop}
                    muted={muted}
                    controls={controls}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    return (
        <div
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "relative rounded-xl overflow-hidden transition-all w-full",
                ASPECT_RATIO_MAP[aspectRatio],
                enabled && selected && "ring-2 ring-primary ring-inset",
                enabled && hovered && !selected && "ring-2 ring-primary/40 ring-inset",
                enabled && "cursor-move"
            )}
        >
            <iframe
                src={`${embedUrl}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
}

Video.craft = {
    displayName: "Video",
    props: {
        src: "",
        provider: "youtube",
        autoplay: false,
        loop: false,
        muted: false,
        controls: true,
        aspectRatio: "16:9",
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: VideoSettings,
    },
};
