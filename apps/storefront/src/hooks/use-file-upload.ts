"use client";

import { useState, useCallback, useRef, type ChangeEvent, type DragEvent } from "react";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
  file?: File;
}

interface UseFileUploadOptions {
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  initialFiles?: UploadedFile[];
  onUpload?: (files: File[]) => Promise<UploadedFile[]>;
  onError?: (error: string) => void;
}

interface UseFileUploadState {
  files: UploadedFile[];
  isDragging: boolean;
  isUploading: boolean;
  error: string | null;
}

interface UseFileUploadActions {
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  openFileDialog: () => void;
  getInputProps: () => {
    type: "file";
    accept?: string;
    multiple: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    ref: React.RefObject<HTMLInputElement | null>;
  };
  getRootProps: () => {
    onDragOver: (e: DragEvent) => void;
    onDragLeave: (e: DragEvent) => void;
    onDrop: (e: DragEvent) => void;
  };
}

type UseFileUploadReturn = [UseFileUploadState, UseFileUploadActions];

function generateId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createPreview(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export function useFileUpload({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  initialFiles = [],
  onUpload,
  onError,
}: UseFileUploadOptions = {}): UseFileUploadReturn {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File "${file.name}" exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`;
      }
      if (accept) {
        const acceptedTypes = accept.split(",").map((t) => t.trim());
        const isAccepted = acceptedTypes.some((type) => {
          if (type.startsWith(".")) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.replace("/*", "/"));
          }
          return file.type === type;
        });
        if (!isAccepted) {
          return `File "${file.name}" is not an accepted file type`;
        }
      }
      return null;
    },
    [accept, maxSize]
  );

  const addFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const newFiles = Array.from(fileList);
      const availableSlots = maxFiles - files.length;

      if (availableSlots <= 0) {
        const errorMsg = `Maximum ${maxFiles} files allowed`;
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      const filesToAdd = newFiles.slice(0, availableSlots);
      const validFiles: File[] = [];

      for (const file of filesToAdd) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          onError?.(validationError);
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      setIsUploading(true);
      setError(null);

      try {
        if (onUpload) {
          const uploadedFiles = await onUpload(validFiles);
          setFiles((prev) => [...prev, ...uploadedFiles]);
        } else {
          // Create local previews
          const uploadedFiles: UploadedFile[] = await Promise.all(
            validFiles.map(async (file) => ({
              id: generateId(),
              name: file.name,
              size: file.size,
              type: file.type,
              preview: await createPreview(file),
              file,
            }))
          );
          setFiles((prev) => [...prev, ...uploadedFiles]);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Upload failed";
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setIsUploading(false);
      }
    },
    [files.length, maxFiles, validateFile, onUpload, onError]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview && file.preview.startsWith("data:")) {
        // Revoke object URL if it was created
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
    setError(null);
  }, []);

  const clearFiles = useCallback(() => {
    files.forEach((file) => {
      if (file.preview && file.preview.startsWith("data:")) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setError(null);
  }, [files]);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(e.target.files);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const getInputProps = useCallback(
    () => ({
      type: "file" as const,
      accept,
      multiple: maxFiles > 1,
      onChange: handleInputChange,
      ref: inputRef,
    }),
    [accept, maxFiles, handleInputChange]
  );

  const getRootProps = useCallback(
    () => ({
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    }),
    [handleDragOver, handleDragLeave, handleDrop]
  );

  return [
    { files, isDragging, isUploading, error },
    { addFiles, removeFile, clearFiles, openFileDialog, getInputProps, getRootProps },
  ];
}
