import { create } from "zustand";
import type { UploadingFile, UploadStatus } from "@/features/media/types";
import { validateFile } from "@/features/media/types";
import { uploadAsset } from "@/app/dashboard/media/actions";
import { useMediaStore } from "./media-store";

interface UploadState {
  files: UploadingFile[];
  isUploading: boolean;
  isDragging: boolean;

  addFiles: (files: File[], folderId: string | null) => void;
  cancelUpload: (id: string) => void;
  retryUpload: (id: string, folderId: string | null) => void;
  clearCompleted: () => void;
  setDragging: (v: boolean) => void;
}

let idCounter = 0;

export const useUploadStore = create<UploadState>((set, get) => ({
  files: [],
  isUploading: false,
  isDragging: false,

  addFiles: (rawFiles, folderId) => {
    const entries: UploadingFile[] = [];
    for (const file of rawFiles) {
      const validation = validateFile(file);
      const id = `upload-${++idCounter}`;
      entries.push({
        id,
        file,
        progress: 0,
        status: validation.valid ? "pending" : "error",
        error: validation.error,
      });
    }

    set((s) => ({ files: [...entries, ...s.files], isUploading: true }));

    // Start uploading valid files
    for (const entry of entries) {
      if (entry.status === "pending") {
        processUpload(entry.id, entry.file, folderId);
      }
    }
  },

  cancelUpload: (id) => {
    set((s) => ({
      files: s.files.filter((f) => f.id !== id),
      isUploading: s.files.some((f) => f.id !== id && f.status === "uploading"),
    }));
  },

  retryUpload: (id, folderId) => {
    const file = get().files.find((f) => f.id === id);
    if (!file) return;
    updateFile(id, { status: "uploading", progress: 0, error: undefined });
    processUpload(id, file.file, folderId);
  },

  clearCompleted: () => {
    set((s) => ({
      files: s.files.filter((f) => f.status !== "complete" && f.status !== "error"),
    }));
  },

  setDragging: (v) => set({ isDragging: v }),
}));

function updateFile(id: string, updates: Partial<UploadingFile>) {
  useUploadStore.setState((s) => ({
    files: s.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    isUploading: s.files.some(
      (f) => (f.id === id ? (updates.status ?? f.status) : f.status) === "uploading"
    ),
  }));
}

async function processUpload(id: string, file: File, folderId: string | null) {
  updateFile(id, { status: "uploading", progress: 10 });

  try {
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) formData.append("folderId", folderId);

    updateFile(id, { progress: 40 });
    const result = await uploadAsset(formData);
    updateFile(id, { progress: 80 });

    if (!result.success || !result.asset) {
      updateFile(id, { status: "error", error: result.error ?? "Upload failed", progress: 0 });
      return;
    }

    updateFile(id, { status: "complete", progress: 100, asset: result.asset });

    // Add to media store
    useMediaStore.getState().addAsset(result.asset);
  } catch (err) {
    updateFile(id, {
      status: "error",
      error: err instanceof Error ? err.message : "Upload failed",
      progress: 0,
    });
  }
}
