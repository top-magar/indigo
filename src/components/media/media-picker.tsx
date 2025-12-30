"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Upload04Icon,
  Search01Icon,
  Image01Icon,
  Video01Icon,
  File01Icon,
  FilterIcon,
  CheckmarkSquare02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type {
  MediaAsset,
  FileTypeFilter,
  AllowedMimeType,
  SelectionMode,
} from "@/lib/media/types";
import { formatFileSize, getFileTypeCategory, validateFile } from "@/lib/media/types";
import { getAssets, uploadAsset } from "@/app/dashboard/media/actions";

export interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (assets: MediaAsset[]) => void;
  mode?: SelectionMode;
  accept?: AllowedMimeType[];
  maxSelection?: number;
  title?: string;
}

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  mode = "single",
  accept,
  maxSelection = 10,
  title = "Select Media",
}: MediaPickerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fileType, setFileType] = useState<FileTypeFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Load assets when dialog opens
  useEffect(() => {
    if (open) {
      loadAssets(true);
    } else {
      // Reset state when closed
      setSelectedIds(new Set());
      setSearch("");
      setFileType("all");
      setActiveTab("library");
    }
  }, [open]);

  // Reload when search or filter changes
  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        loadAssets(true);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [search, fileType, open]);

  const loadAssets = useCallback(async (reset = false) => {
    setIsLoading(true);
    try {
      const result = await getAssets({
        search: search || undefined,
        fileType,
        cursor: reset ? undefined : nextCursor,
        limit: 30,
      });

      // Filter by accepted mime types if specified
      let filteredAssets = result.assets;
      if (accept && accept.length > 0) {
        filteredAssets = result.assets.filter((asset) =>
          accept.some((type) => {
            if (type.endsWith("/*")) {
              return asset.mimeType.startsWith(type.replace("/*", "/"));
            }
            return asset.mimeType === type;
          })
        );
      }

      if (reset) {
        setAssets(filteredAssets);
      } else {
        setAssets((prev) => [...prev, ...filteredAssets]);
      }
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error("Failed to load assets:", error);
      toast.error("Failed to load media library");
    } finally {
      setIsLoading(false);
    }
  }, [search, fileType, nextCursor, accept]);

  // Handle selection
  const toggleSelection = useCallback((asset: MediaAsset) => {
    if (mode === "single") {
      setSelectedIds(new Set([asset.id]));
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(asset.id)) {
          next.delete(asset.id);
        } else if (next.size < maxSelection) {
          next.add(asset.id);
        } else {
          toast.error(`Maximum ${maxSelection} items can be selected`);
        }
        return next;
      });
    }
  }, [mode, maxSelection]);

  // Handle confirm selection
  const handleConfirm = useCallback(() => {
    const selectedAssets = assets.filter((a) => selectedIds.has(a.id));
    onSelect(selectedAssets);
    onOpenChange(false);
  }, [assets, selectedIds, onSelect, onOpenChange]);

  // Handle file upload
  const handleUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Validate files
    const validFiles = fileArray.filter((file) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        return false;
      }
      if (accept && accept.length > 0) {
        const isAccepted = accept.some((type) => {
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.replace("/*", "/"));
          }
          return file.type === type;
        });
        if (!isAccepted) {
          toast.error(`${file.name}: File type not accepted`);
          return false;
        }
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    let completed = 0;
    const newAssets: MediaAsset[] = [];

    for (const file of validFiles) {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadAsset(formData);

      if (result.success && result.asset) {
        newAssets.push(result.asset);
      } else {
        toast.error(`Failed to upload ${file.name}: ${result.error}`);
      }

      completed++;
      setUploadProgress(Math.round((completed / validFiles.length) * 100));
    }

    if (newAssets.length > 0) {
      setAssets((prev) => [...newAssets, ...prev]);
      toast.success(`Uploaded ${newAssets.length} file${newAssets.length > 1 ? "s" : ""}`);
      
      // Auto-select uploaded files in single mode
      if (mode === "single" && newAssets.length === 1) {
        setSelectedIds(new Set([newAssets[0].id]));
      }
      
      // Switch to library tab to show uploaded files
      setActiveTab("library");
    }

    setIsUploading(false);
    setUploadProgress(0);
  }, [accept, mode]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files);
    }
  }, [handleUpload]);

  const selectedCount = selectedIds.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-4xl h-[80vh] flex flex-col p-0"
        showCloseButton={true}
      >
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as "library" | "upload")}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 border-b">
            <TabsList className="h-10">
              <TabsTrigger value="library" className="text-xs">
                <HugeiconsIcon icon={Image01Icon} className="h-4 w-4 mr-1.5" />
                Library
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-xs">
                <HugeiconsIcon icon={Upload04Icon} className="h-4 w-4 mr-1.5" />
                Upload
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="library" className="flex-1 flex flex-col m-0 overflow-hidden">
            {/* Search and Filters */}
            <div className="px-6 py-3 border-b flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  placeholder="Search files..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              <Select value={fileType} onValueChange={(v) => setFileType(v as FileTypeFilter)}>
                <SelectTrigger className="w-32 h-9">
                  <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="images">Images</SelectItem>
                  <SelectItem value="videos">Videos</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                </SelectContent>
              </Select>

              {selectedCount > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <HugeiconsIcon icon={CheckmarkSquare02Icon} className="h-4 w-4" />
                  {selectedCount} selected
                </div>
              )}
            </div>

            {/* Asset Grid */}
            <div className="flex-1 overflow-auto p-4">
              {isLoading && assets.length === 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : assets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <HugeiconsIcon icon={Image01Icon} className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {search ? "No files match your search" : "No files in library"}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setActiveTab("upload")}
                  >
                    Upload Files
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                    {assets.map((asset) => (
                      <PickerAssetCard
                        key={asset.id}
                        asset={asset}
                        isSelected={selectedIds.has(asset.id)}
                        onSelect={() => toggleSelection(asset)}
                        selectionMode={mode}
                      />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadAssets(false)}
                        disabled={isLoading}
                      >
                        {isLoading ? "Loading..." : "Load More"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent 
            value="upload" 
            className="flex-1 m-0 p-6"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div
              className={cn(
                "h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors",
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              )}
            >
              {isUploading ? (
                <div className="text-center w-full max-w-xs">
                  <HugeiconsIcon icon={Upload04Icon} className="h-10 w-10 mx-auto text-primary animate-pulse" />
                  <p className="mt-3 text-sm font-medium">Uploading...</p>
                  <Progress value={uploadProgress} className="mt-3 h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">{uploadProgress}%</p>
                </div>
              ) : (
                <>
                  <HugeiconsIcon icon={Upload04Icon} className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">
                    Drag and drop files here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    or click to browse
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.multiple = mode === "multiple";
                      input.accept = accept?.join(",") || "image/*,video/*,.pdf";
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files) handleUpload(files);
                      };
                      input.click();
                    }}
                  >
                    Browse Files
                  </Button>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Max file size: 10MB
                  </p>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedCount === 0}>
            Select {selectedCount > 0 && `(${selectedCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Picker Asset Card Component
function PickerAssetCard({
  asset,
  isSelected,
  onSelect,
  selectionMode,
}: {
  asset: MediaAsset;
  isSelected: boolean;
  onSelect: () => void;
  selectionMode: SelectionMode;
}) {
  const fileType = getFileTypeCategory(asset.mimeType);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative aspect-square rounded-lg border bg-muted overflow-hidden transition-all",
        isSelected
          ? "ring-2 ring-primary ring-offset-2"
          : "hover:ring-2 hover:ring-primary/50"
      )}
    >
      {/* Thumbnail */}
      {fileType === "image" ? (
        <img
          src={asset.thumbnailUrl || asset.cdnUrl}
          alt={asset.altText || asset.filename}
          className="w-full h-full object-cover"
        />
      ) : fileType === "video" ? (
        <div className="w-full h-full flex items-center justify-center">
          <HugeiconsIcon icon={Video01Icon} className="h-8 w-8 text-muted-foreground" />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <HugeiconsIcon icon={File01Icon} className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {/* Selection indicator */}
      {selectionMode === "multiple" && (
        <div className="absolute top-1.5 left-1.5">
          <Checkbox
            checked={isSelected}
            className="bg-background/80 backdrop-blur"
          />
        </div>
      )}

      {/* Selected overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/10" />
      )}

      {/* Filename tooltip on hover */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-white truncate">{asset.filename}</p>
        <p className="text-xs text-white/70">{formatFileSize(asset.sizeBytes)}</p>
      </div>
    </button>
  );
}
