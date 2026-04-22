"use client";

import { memo } from "react";
import { UploadCloud, Search, Grid3X3, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/utils";
import { useMediaStore } from "@/features/media/media-store";
import { useUploadStore } from "@/features/media/upload-store";

interface MediaHeaderProps {
  onUploadClick: () => void;
}

export const MediaHeader = memo(function MediaHeader({ onUploadClick }: MediaHeaderProps) {
  const search = useMediaStore(s => s.search);
  const viewMode = useMediaStore(s => s.viewMode);
  const setSearch = useMediaStore(s => s.setSearch);
  const setViewMode = useMediaStore(s => s.setViewMode);
  const isUploading = useUploadStore(s => s.isUploading);

  return (
    <div className="h-10 px-4 flex items-center gap-2 min-w-0 border-b">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="h-7 pl-8 pr-7 text-xs" />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="size-3" />
          </button>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex h-7 border rounded-md overflow-hidden shrink-0">
        <button onClick={() => setViewMode("grid")} className={cn("flex items-center justify-center w-7 h-full", viewMode === "grid" ? "bg-accent" : "hover:bg-accent/50")}>
          <Grid3X3 className="size-3.5" />
        </button>
        <div className="w-px bg-border" />
        <button onClick={() => setViewMode("list")} className={cn("flex items-center justify-center w-7 h-full", viewMode === "list" ? "bg-accent" : "hover:bg-accent/50")}>
          <List className="size-3.5" />
        </button>
      </div>

      <Button onClick={onUploadClick} disabled={isUploading} size="sm">
        <UploadCloud className="size-3.5" />
        Upload
      </Button>
    </div>
  );
});
