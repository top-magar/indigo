"use client";

import { memo, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Image,
  Video,
  File,
  ChevronUp,
  ChevronDown,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/shared/utils";
import type { UploadingFile } from "@/features/media/types";

interface UploadPanelProps {
  uploadingFiles: UploadingFile[];
  onCancelUpload: (uploadId: string) => void;
  onClearUploads: () => void;
  onRetryUpload?: (file: File) => void;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.startsWith("video/")) return Video;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const UploadPanel = memo(function UploadPanel({
  uploadingFiles,
  onCancelUpload,
  onClearUploads,
  onRetryUpload,
}: UploadPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const stats = useMemo(() => {
    const active = uploadingFiles.filter(
      (u) => u.status === "uploading" || u.status === "pending"
    );
    const completed = uploadingFiles.filter((u) => u.status === "complete");
    const errors = uploadingFiles.filter((u) => u.status === "error");
    
    // Calculate overall progress based on active uploads only
    // If no active uploads, show 100% if there are completed files
    let overallProgress = 0;
    if (active.length > 0) {
      const activeProgress = active.reduce((sum, u) => sum + u.progress, 0);
      overallProgress = Math.round(activeProgress / active.length);
    } else if (completed.length > 0) {
      overallProgress = 100;
    }

    // Calculate total size being uploaded (only active files)
    const totalSize = active.reduce((sum, u) => sum + u.file.size, 0);
    const uploadedSize = active.reduce((sum, u) => sum + (u.file.size * u.progress / 100), 0);

    return {
      activeCount: active.length,
      completedCount: completed.length,
      errorCount: errors.length,
      overallProgress,
      totalSize,
      uploadedSize,
      remainingSize: totalSize - uploadedSize,
      isUploading: active.length > 0,
    };
  }, [uploadingFiles]);

  if (uploadingFiles.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]"
      >
        <div className="bg-background border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className={cn(
              "px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors",
              stats.isUploading ? "bg-primary/5" : stats.errorCount > 0 ? "bg-[var(--ds-red-100)]" : "bg-[var(--ds-green-100)]"
            )}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {/* Upload Icon with Animation */}
            <div className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
              stats.isUploading ? "bg-primary/10" : stats.errorCount > 0 ? "bg-[var(--ds-red-200)]" : "bg-[var(--ds-green-200)]"
            )}>
              {stats.isUploading ? (
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  <UploadCloud className="h-4.5 w-4.5 text-primary" />
                </motion.div>
              ) : stats.errorCount > 0 ? (
                <AlertCircle className="h-4.5 w-4.5 text-[var(--ds-red-700)]" />
              ) : (
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--ds-green-700)]" />
              )}
            </div>

            {/* Status Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {stats.isUploading 
                    ? `Uploading ${stats.activeCount} file${stats.activeCount > 1 ? "s" : ""}` 
                    : stats.errorCount > 0 
                      ? "Upload incomplete"
                      : "Upload complete"
                  }
                </span>
                {stats.isUploading && (
                  <span className="text-xs text-[var(--ds-gray-600)] tabular-nums">
                    {stats.overallProgress}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--ds-gray-600)] mt-0.5">
                {stats.completedCount > 0 && (
                  <span className="flex items-center gap-1 text-[var(--ds-green-700)]">
                    <CheckCircle2 className="h-3 w-3" />
                    {stats.completedCount}
                  </span>
                )}
                {stats.errorCount > 0 && (
                  <span className="flex items-center gap-1 text-[var(--ds-red-700)]">
                    <AlertCircle className="h-3 w-3" />
                    {stats.errorCount}
                  </span>
                )}
                {stats.isUploading && stats.remainingSize > 0 && (
                  <span>{formatFileSize(stats.remainingSize)} remaining</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isExpanded ? "Collapse" : "Expand"}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearUploads();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear all</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Overall Progress Bar */}
          {stats.isUploading && (
            <div className="h-1 bg-[var(--ds-gray-100)]">
              <motion.div
                className="h-full bg-primary"
                style={{ width: `${stats.overallProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          )}

          {/* File List */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="max-h-64 overflow-auto">
                  {uploadingFiles.map((upload, index) => (
                    <motion.div
                      key={upload.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 border-t transition-colors",
                        upload.status === "error" && "bg-[var(--ds-red-100)]",
                        upload.status === "complete" && "bg-[var(--ds-green-100)]"
                      )}
                    >
                      {/* File Type Icon */}
                      <div className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center shrink-0",
                        upload.status === "error" ? "bg-[var(--ds-red-200)]" :
                        upload.status === "complete" ? "bg-[var(--ds-green-200)]" : "bg-[var(--ds-gray-100)]"
                      )}>
                        {(() => {
                          const FileIcon = getFileIcon(upload.file.type);
                          return (
                            <FileIcon 
                              className={cn(
                                "h-4 w-4",
                                upload.status === "error" ? "text-[var(--ds-red-700)]" :
                                upload.status === "complete" ? "text-[var(--ds-green-700)]" : "text-[var(--ds-gray-600)]"
                              )} 
                            />
                          );
                        })()}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm truncate font-medium">{upload.file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {upload.status === "error" ? (
                            <span className="text-xs text-[var(--ds-red-700)] truncate">{upload.error}</span>
                          ) : upload.status === "complete" ? (
                            <span className="text-xs text-[var(--ds-green-700)]">Uploaded</span>
                          ) : (
                            <>
                              <span className="text-xs text-[var(--ds-gray-600)]">
                                {formatFileSize(upload.file.size)}
                              </span>
                              <span className="text-xs text-[var(--ds-gray-600)]">•</span>
                              <span className="text-xs text-primary font-medium tabular-nums">
                                {upload.progress}%
                              </span>
                            </>
                          )}
                        </div>
                        {(upload.status === "uploading" || upload.status === "pending") && (
                          <div className="mt-1.5 h-1 bg-[var(--ds-gray-100)] rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${upload.progress}%` }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Status/Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {upload.status === "uploading" && (
                          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        )}
                        {upload.status === "complete" && (
                          <CheckCircle2 className="h-4 w-4 text-[var(--ds-green-700)]" />
                        )}
                        {upload.status === "error" && onRetryUpload && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  onCancelUpload(upload.id);
                                  onRetryUpload(upload.file);
                                }}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Retry</TooltipContent>
                          </Tooltip>
                        )}
                        {(upload.status === "uploading" || upload.status === "pending") && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => onCancelUpload(upload.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Cancel</TooltipContent>
                          </Tooltip>
                        )}
                        {(upload.status === "complete" || upload.status === "error") && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-50 hover:opacity-100"
                                onClick={() => onCancelUpload(upload.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Dismiss</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
