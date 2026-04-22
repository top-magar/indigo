"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Copy,
  Trash2,
  Download,
  File,
  Image,
  Video,
  Check,
  X,
  ExternalLink,
  Calendar,
  HardDrive,
  Grid,
  Share,
  Info,
  FolderOpen,
  Mail,
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
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface AssetInfoPanelProps {
  asset: MediaAsset;
  onDeleted?: () => void;
  onUpdated?: (asset: MediaAsset) => void;
  onClose: () => void;
}

export function AssetInfoPanel({ asset, onDeleted, onUpdated, onClose }: AssetInfoPanelProps) {
  const [filename, setFilename] = useState(asset.filename);
  const [altText, setAltText] = useState(asset.altText || "");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [copied, setCopied] = useState(false);

  const fileType = useMemo(() => getFileTypeCategory(asset.mimeType), [asset.mimeType]);

  // Reset form state when asset changes
  useEffect(() => {
    setFilename(asset.filename);
    setAltText(asset.altText || "");
    setActiveTab("info");
    setCopied(false);
    setShowDeleteDialog(false);
  }, [asset.id]);

  const formattedDate = useMemo(() => {
    return new Date(asset.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [asset.createdAt]);

  const megapixels = useMemo(() => {
    if (!asset.width || !asset.height) return null;
    return ((asset.width * asset.height) / 1000000).toFixed(1);
  }, [asset.width, asset.height]);

  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(asset.cdnUrl);
    setCopied(true);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [asset.cdnUrl]);

  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.href = asset.cdnUrl;
    link.download = asset.originalFilename;
    link.click();
    toast.success("Download started");
  }, [asset.cdnUrl, asset.originalFilename]);

  const handleShare = useCallback(async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: asset.filename, url: asset.cdnUrl });
      } catch {
        handleCopyUrl();
      }
    } else {
      handleCopyUrl();
    }
  }, [asset.filename, asset.cdnUrl, handleCopyUrl]);

  const handleEmailShare = useCallback(() => {
    const subject = `Check out this asset: ${asset.filename}`;
    const body = `I wanted to share this asset with you:\n\n${asset.cdnUrl}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }, [asset.filename, asset.cdnUrl]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: asset.filename, url: asset.cdnUrl });
      } catch {
        // Ignore aborts
      }
    }
  }, [asset.filename, asset.cdnUrl]);

  const handleSave = useCallback(async () => {
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

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAsset(asset.id);

      if (result.success) {
        toast.success("Asset deleted");
        setShowDeleteDialog(false);
        onClose();
        onDeleted?.();
      } else {
        toast.error(result.error || "Failed to delete asset");
      }
    } catch {
      toast.error("Failed to delete asset");
    } finally {
      setIsDeleting(false);
    }
  }, [asset.id, onClose, onDeleted]);

  return (
    <>
      <div className="w-[360px] shrink-0 border-l bg-background flex flex-col h-full relative z-10">
        <div className="p-4 border-b flex items-center justify-between shrink-0 bg-background">
          <div className="flex items-center gap-3 overflow-hidden">
            <h2 className="font-semibold truncate text-sm" title={asset.filename}>
              {asset.filename}
            </h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
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
                          {fileType === "video" ? <Video className="size-8" /> : <File className="size-8" />}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button variant="secondary" onClick={handleDownload}>
                          <Download className="size-3.5" />
                          Download
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={handleCopyUrl} className="w-full">
                        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        {copied ? "Copied" : "Copy Link"}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <Share className="size-3.5" />
                            Share
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={handleCopyUrl}>
                            <ExternalLink className="size-3.5" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleEmailShare}>
                            <Mail className="size-3.5" />
                            Email
                          </DropdownMenuItem>
                          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                            <DropdownMenuItem onClick={handleNativeShare}>
                              <Share className="size-3.5" />
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
                      <Info className="size-4 text-primary" />
                      Metadata
                    </h3>
                    <div className="grid gap-3 text-sm">
                      <div className="grid grid-cols-[24px_1fr_auto] gap-3 items-center">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">{formattedDate}</span>
                      </div>
                      <div className="grid grid-cols-[24px_1fr_auto] gap-3 items-center">
                        <HardDrive className="size-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Size</span>
                        <span className="font-medium">{formatFileSize(asset.sizeBytes)}</span>
                      </div>
                      <div className="grid grid-cols-[24px_1fr_auto] gap-3 items-center">
                        <File className="size-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="secondary" className="font-normal uppercase text-[10px] h-5">{asset.mimeType.split("/")[1]}</Badge>
                      </div>
                      {asset.width && asset.height && (
                        <>
                          <div className="grid grid-cols-[24px_1fr_auto] gap-3 items-center">
                            <Grid className="size-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Dimensions</span>
                            <span className="font-medium">{asset.width} × {asset.height}</span>
                          </div>
                          <div className="grid grid-cols-[24px_1fr_auto] gap-3 items-center">
                            <Image className="size-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Megapixels</span>
                            <span className="font-medium">{megapixels} MP</span>
                          </div>
                        </>
                      )}
                      <div className="grid grid-cols-[24px_1fr_auto] gap-3 items-center">
                        <FolderOpen className="size-4 text-muted-foreground" />
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
                      <Trash2 className="size-3.5" />
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
