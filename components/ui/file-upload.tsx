"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Upload04Icon,
  Cancel01Icon,
  Image01Icon,
  File01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { useFileUpload, type UploadedFile } from "@/hooks/use-file-upload";
import Image from "next/image";

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  initialFiles?: UploadedFile[];
  onFilesChange?: (files: UploadedFile[]) => void;
  onUpload?: (files: File[]) => Promise<UploadedFile[]>;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "compact" | "avatar";
}

export function FileUpload({
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  maxFiles = 5,
  initialFiles = [],
  onFilesChange,
  onUpload,
  onError,
  className,
  disabled = false,
  variant = "default",
}: FileUploadProps) {
  const [{ files, isDragging, isUploading, error }, { removeFile, openFileDialog, getInputProps, getRootProps }] =
    useFileUpload({
      accept,
      maxSize,
      maxFiles,
      initialFiles,
      onUpload,
      onError: (err) => {
        onError?.(err);
      },
    });

  // Notify parent of file changes
  if (onFilesChange && files !== initialFiles) {
    onFilesChange(files);
  }

  const inputProps = getInputProps();
  const rootProps = getRootProps();

  if (variant === "avatar") {
    const currentImage = files[0]?.preview || files[0]?.url;
    return (
      <div className={cn("relative", className)}>
        <div
          className={cn(
            "relative flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed bg-muted transition-colors",
            isDragging && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          {...(!disabled ? rootProps : {})}
        >
          {currentImage ? (
            <Image
              src={currentImage}
              alt="Avatar"
              fill
              className="object-cover"
            />
          ) : (
            <HugeiconsIcon icon={Image01Icon} className="w-8 h-8 text-muted-foreground" />
          )}
          {!disabled && (
            <button
              type="button"
              onClick={openFileDialog}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-full"
            >
              <HugeiconsIcon icon={Upload04Icon} className="w-5 h-5 text-white" />
            </button>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>
        <input {...inputProps} className="sr-only" disabled={disabled} />
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        <div
          className={cn(
            "flex items-center gap-2 p-2 border rounded-lg transition-colors",
            isDragging && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          {...(!disabled ? rootProps : {})}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <HugeiconsIcon icon={Upload04Icon} className="w-4 h-4 mr-2" />
            )}
            Choose file
          </Button>
          <span className="text-sm text-muted-foreground">
            {files.length > 0 ? `${files.length} file(s) selected` : "No file chosen"}
          </span>
        </div>
        <input {...inputProps} className="sr-only" disabled={disabled} />
        {error && <p className="text-xs text-destructive">{error}</p>}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <FilePreview key={file.id} file={file} onRemove={() => removeFile(file.id)} size="sm" />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragging && "border-primary bg-primary/5",
          !isDragging && "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        {...(!disabled ? rootProps : {})}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-muted p-3">
            {isUploading ? (
              <HugeiconsIcon icon={Loading03Icon} className="w-6 h-6 text-muted-foreground animate-spin" />
            ) : (
              <HugeiconsIcon icon={Upload04Icon} className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse (max {Math.round(maxSize / 1024 / 1024)}MB)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            disabled={disabled || isUploading}
            className="mt-2"
          >
            Select files
          </Button>
        </div>
        <input {...inputProps} className="sr-only" disabled={disabled} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {files.map((file) => (
            <FilePreview key={file.id} file={file} onRemove={() => removeFile(file.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilePreviewProps {
  file: UploadedFile;
  onRemove: () => void;
  size?: "sm" | "md";
}

function FilePreview({ file, onRemove, size = "md" }: FilePreviewProps) {
  const isImage = file.type.startsWith("image/");
  const preview = file.preview || file.url;

  if (size === "sm") {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted rounded-md group">
        {isImage && preview ? (
          <div className="relative w-8 h-8 rounded overflow-hidden shrink-0">
            <Image src={preview} alt={file.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded bg-background flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={File01Icon} className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <span className="text-xs truncate flex-1">{file.name}</span>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded-full hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative group rounded-lg overflow-hidden border bg-muted">
      {isImage && preview ? (
        <div className="relative aspect-square">
          <Image src={preview} alt={file.name} fill className="object-cover" />
        </div>
      ) : (
        <div className="aspect-square flex flex-col items-center justify-center p-4">
          <HugeiconsIcon icon={File01Icon} className="w-8 h-8 text-muted-foreground mb-2" />
          <span className="text-xs text-muted-foreground truncate w-full text-center">{file.name}</span>
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
      </button>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-white truncate">{file.name}</p>
        <p className="text-[10px] text-white/70">{formatFileSize(file.size)}</p>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Export types
export type { UploadedFile };
