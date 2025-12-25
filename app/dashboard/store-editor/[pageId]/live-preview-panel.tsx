"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Cancel01Icon,
    EyeIcon,
    SmartPhone01Icon,
    Tablet01Icon,
    ComputerIcon,
    RefreshIcon,
    ArrowExpand01Icon,
    LinkSquare01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { PageBlock } from "@/types/page-builder";

interface LivePreviewPanelProps {
    storeSlug: string;
    pageSlug: string;
    blocks: PageBlock[];
    onClose: () => void;
}

type PreviewDevice = "desktop" | "tablet" | "mobile";

const DEVICE_CONFIG: Record<PreviewDevice, { width: string; height: string; label: string }> = {
    desktop: { width: "100%", height: "100%", label: "Desktop" },
    tablet: { width: "768px", height: "1024px", label: "Tablet" },
    mobile: { width: "375px", height: "667px", label: "Mobile" },
};

export function LivePreviewPanel({
    storeSlug,
    pageSlug,
    blocks,
    onClose,
}: LivePreviewPanelProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [device, setDevice] = useState<PreviewDevice>("desktop");
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Generate preview URL - this would point to your store preview endpoint
    const previewUrl = `/store/${storeSlug}/${pageSlug}?preview=true`;

    const handleRefresh = () => {
        setIsLoading(true);
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
        }
    };

    const handleOpenInNewTab = () => {
        window.open(previewUrl, "_blank");
    };

    const handleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    useEffect(() => {
        // Send updated blocks to iframe for live preview
        const sendBlocksToPreview = () => {
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage(
                    { type: "PREVIEW_UPDATE", blocks },
                    "*"
                );
            }
        };

        // Debounce updates
        const timeoutId = setTimeout(sendBlocksToPreview, 300);
        return () => clearTimeout(timeoutId);
    }, [blocks]);

    return (
        <div
            className={cn(
                "flex flex-col bg-background",
                isFullscreen
                    ? "fixed inset-0 z-50"
                    : "h-full"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-chart-2/10 flex items-center justify-center">
                        <HugeiconsIcon icon={EyeIcon} className="h-5 w-5 text-chart-2" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold">Live Preview</h2>
                        <p className="text-xs text-muted-foreground">See changes in real-time</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh}>
                                <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Refresh Preview</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenInNewTab}>
                                <HugeiconsIcon icon={LinkSquare01Icon} className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Open in New Tab</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFullscreen}>
                                <HugeiconsIcon icon={ArrowExpand01Icon} className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</TooltipContent>
                    </Tooltip>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                        <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Device Selector */}
            <div className="flex items-center justify-center py-3 border-b border-border bg-muted/30">
                <div className="flex items-center bg-background rounded-lg p-1 border border-border">
                    {(["desktop", "tablet", "mobile"] as const).map((d) => (
                        <Tooltip key={d}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setDevice(d)}
                                    className={cn(
                                        "h-8 w-8 flex items-center justify-center rounded-md transition-all",
                                        device === d
                                            ? "bg-chart-2/10 text-chart-2"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <HugeiconsIcon
                                        icon={d === "desktop" ? ComputerIcon : d === "tablet" ? Tablet01Icon : SmartPhone01Icon}
                                        className="h-4 w-4"
                                    />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>{DEVICE_CONFIG[d].label}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 overflow-auto bg-muted/50 p-4 flex items-start justify-center">
                <div
                    className={cn(
                        "bg-background rounded-xl shadow-2xl overflow-hidden transition-all duration-300 relative",
                        "ring-1 ring-border"
                    )}
                    style={{
                        width: DEVICE_CONFIG[device].width,
                        maxWidth: device === "desktop" ? "100%" : DEVICE_CONFIG[device].width,
                        height: device === "desktop" ? "calc(100vh - 180px)" : DEVICE_CONFIG[device].height,
                    }}
                >
                    {/* Device Frame Header (for mobile/tablet) */}
                    {device !== "desktop" && (
                        <div className="h-6 bg-muted/50 border-b border-border flex items-center justify-center">
                            <div className="w-16 h-1 rounded-full bg-muted-foreground/20" />
                        </div>
                    )}

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-chart-2 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm text-muted-foreground">Loading preview...</span>
                            </div>
                        </div>
                    )}

                    {/* Iframe */}
                    <iframe
                        ref={iframeRef}
                        src={previewUrl}
                        className="w-full h-full border-0"
                        onLoad={() => setIsLoading(false)}
                        title="Store Preview"
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
                <span>
                    Viewing: {storeSlug}.yourstore.com/{pageSlug}
                </span>
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
                    Live updates enabled
                </span>
            </div>
        </div>
    );
}
